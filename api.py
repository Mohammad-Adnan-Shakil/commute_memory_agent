import asyncio
import os
import uuid
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from commute_agent.agent import root_agent
import psycopg2
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone

MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

def _compute_bottleneck_indices(route_coords, congestion_level):
    """Compute proportional bottleneck segment indices based on route length."""
    if not route_coords or len(route_coords) < 4:
        return []
    if congestion_level not in ("HIGH", "MEDIUM"):
        return []
    num_segments = len(route_coords) - 1
    seg_start = int(num_segments * 0.3)
    seg_end = int(num_segments * 0.7)
    return list(range(seg_start, seg_end + 1))


MOCK_ROUTE_COORDS = [[12.9172, 77.6229], [12.9215, 77.6332], [12.9245, 77.6412], [12.9278, 77.6558], [12.9310, 77.6701], [12.9335, 77.6835], [12.9350, 77.6963]]
MOCK_RESPONSES = {
    "default": {
        "response": "Traffic from Silk Board to Outer Ring Road at 8:45 AM is experiencing HIGH congestion. Delay multiplier of 2.5x — a 15-minute stretch could take 40+ minutes. Consider HSR Layout inner roads or the elevated corridor.",
        "tool_trace": ["get_route", "check_bottleneck"],
        "session_id": "mock-session-123",
        "route_coordinates": MOCK_ROUTE_COORDS,
        "bottleneck_segment_indices": _compute_bottleneck_indices(MOCK_ROUTE_COORDS, "HIGH"),
        "congestion_level": "HIGH"
    }
}

app = FastAPI()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get("JWT_SECRET", "change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def get_db_connection():
    return psycopg2.connect(os.environ["COCKROACHDB_CONNECTION_STRING"])


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "email": email, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(authorization: str = Header(None)) -> dict | None:
    """
    Returns the decoded JWT payload if a valid Bearer token is present,
    otherwise None (caller decides whether auth is required).
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "")
    return decode_access_token(token)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5175",
        "https://commute-memory-agent-navy.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

session_service = InMemorySessionService()
runner = Runner(agent=root_agent, app_name="commute_agent", session_service=session_service)


class Query(BaseModel):
    message: str
    session_id: str | None = None


class SignupRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


@app.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE email = %s", (req.email,))
            if cur.fetchone():
                raise HTTPException(status_code=400, detail="Email already registered")

            user_id = str(uuid.uuid4())
            hashed = hash_password(req.password)
            cur.execute(
                "INSERT INTO users (id, email, password_hash) VALUES (%s, %s, %s)",
                (user_id, req.email, hashed)
            )
            conn.commit()

        token = create_access_token(user_id, req.email)
        return AuthResponse(access_token=token, user_id=user_id, email=req.email)
    finally:
        conn.close()


@app.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, password_hash FROM users WHERE email = %s", (req.email,))
            row = cur.fetchone()
            if not row or not verify_password(req.password, row[1]):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            user_id = str(row[0])

        token = create_access_token(user_id, req.email)
        return AuthResponse(access_token=token, user_id=user_id, email=req.email)
    finally:
        conn.close()


async def run_with_retry(user_id: str, session_id: str, message_content: Content, max_retries: int = 3):
    """
    Runs the agent with retry on transient Gemini 503 errors.
    Backs off 5s, 10s, 15s between attempts.
    """
    for attempt in range(max_retries):
        try:
            events = []
            async for event in runner.run_async(
                user_id=user_id, session_id=session_id, new_message=message_content
            ):
                events.append(event)
            return events
        except Exception as e:
            is_last_attempt = attempt == max_retries - 1
            is_rate_limit = "429" in str(e) or "RateLimitError" in str(e) or "rate-limited" in str(e).lower()
            if is_rate_limit and not is_last_attempt:
                await asyncio.sleep(5 * (attempt + 1))
                continue
            raise


def extract_route_geometry(events):
    """Scans agent events for get_route's tool response, pulls real geometry."""
    for event in events:
        try:
            function_responses = event.get_function_responses()
        except AttributeError:
            continue
        if function_responses:
            for fr in function_responses:
                print(f"DEBUG: tool={fr.name}, response keys={fr.response.keys() if isinstance(fr.response, dict) else 'not a dict'}")
                if fr.name == "get_route":
                    result = fr.response
                    if isinstance(result, dict) and "route_coordinates" in result:
                        return result["route_coordinates"]
    return None


def extract_congestion_level(events):
    """Scans agent events for check_bottleneck's response, returns congestion level."""
    for i, event in enumerate(events):
        try:
            function_responses = event.get_function_responses()
        except AttributeError:
            continue
        if function_responses:
            for j, fr in enumerate(function_responses):
                print(f"DEBUG extract_congestion_level: event[{i}] func_resp[{j}] name={fr.name}, response_type={type(fr.response).__name__}")
                if isinstance(fr.response, dict):
                    print(f"DEBUG extract_congestion_level:   keys={list(fr.response.keys())}")
                if fr.name == "check_bottleneck":
                    result = fr.response
                    print(f"DEBUG extract_congestion_level: FOUND check_bottleneck, result={result!r}")
                    if isinstance(result, dict):
                        val = result.get("congestion")
                        print(f"DEBUG extract_congestion_level: returning congestion={val!r}")
                        return val
    print("DEBUG extract_congestion_level: NO check_bottleneck response found")
    return None


def extract_distance_duration(events):
    """Scans agent events for get_route's tool response, pulls distance_km and duration_min directly."""
    for event in events:
        try:
            function_responses = event.get_function_responses()
        except AttributeError:
            continue
        if function_responses:
            for fr in function_responses:
                if fr.name == "get_route":
                    result = fr.response
                    if isinstance(result, dict) and "distance_km" in result and "duration_min" in result:
                        return result["distance_km"], result["duration_min"]
    return None, None


def extract_recalled_preference(events):
    """Scans agent events for recall_similar_routes' response, returns the first stored preference match."""
    for event in events:
        try:
            function_responses = event.get_function_responses()
        except AttributeError:
            continue
        if function_responses:
            for fr in function_responses:
                if fr.name == "recall_similar_routes":
                    result = fr.response
                    if not isinstance(result, dict):
                        continue
                    matches = result.get("matches") or []
                    for m in matches:
                        if isinstance(m, dict) and m.get("preference_text"):
                            return {
                                "origin": m.get("origin"),
                                "destination": m.get("destination"),
                                "preference_text": m.get("preference_text"),
                            }
    return None


def extract_response_text(final_response):
    """
    Safely extract text from final_response.
    Handles cases where Gemini fails mid-conversation (e.g. 503 after a
    successful tool call), leaving final_response.content or .parts as None.
    """
    if not final_response:
        return "No response"
    if not final_response.content or not final_response.content.parts:
        return "Agent response was incomplete (model provider high demand). Please try again in a few seconds."
    text = final_response.content.parts[0].text
    if not text:
        return "Agent response was incomplete (model provider high demand). Please try again in a few seconds."
    return text


@app.post("/chat")
async def chat(query: Query, authorization: str = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("sub")

    if MOCK_MODE:
        return MOCK_RESPONSES["default"]

    session_id = query.session_id or str(uuid.uuid4())
    session = await session_service.get_session(
        app_name="commute_agent", user_id="user", session_id=session_id
    )
    if not session:
        session = await session_service.create_session(
            app_name="commute_agent", user_id="user", session_id=session_id,
            state={"user_id": user_id} if user_id else {}
        )
    elif user_id and session.state.get("user_id") != user_id:
        # Session exists but user_id changed/wasn't set yet (e.g. user just logged in
        # mid-session) — update the session state to reflect the authenticated user.
        session.state["user_id"] = user_id

    message_content = Content(role="user", parts=[Part(text=query.message)])

    try:
        events = await run_with_retry("user", session_id, message_content)
    except Exception as e:
        return {
            "response": f"Agent temporarily unavailable (model provider high demand). Try again in a few seconds. [{str(e)[:120]}]",
            "tool_trace": [],
            "session_id": session_id
        }

    for event in events:
        if hasattr(event, 'content') and event.content:
            print(f"DEBUG EVENT content: {event.content}")

    final_response = next((e for e in reversed(events) if e.is_final_response()), None)
    tool_calls = [
        fc.name
        for e in events
        for fc in (e.get_function_calls() or [])
    ]
    route_coords = extract_route_geometry(events)
    congestion_level = extract_congestion_level(events)
    distance_km, duration_min = extract_distance_duration(events)
    recalled_preference = extract_recalled_preference(events)

    # Fallback: parse congestion from text response if tool response wasn't found
    if congestion_level is None:
        resp_text = extract_response_text(final_response)
        upper = resp_text.upper()
        if "HIGH" in upper:
            congestion_level = "HIGH"
        elif "MEDIUM" in upper or "MODERATE" in upper:
            congestion_level = "MEDIUM"

    bottleneck_indices = _compute_bottleneck_indices(route_coords, congestion_level)

    print(f"DEBUG RESPONSE: congestion_level={congestion_level!r}, route_coords_count={len(route_coords) if route_coords else 0}, bottleneck_indices={bottleneck_indices}")

    return {
        "response": extract_response_text(final_response),
        "tool_trace": tool_calls,
        "session_id": session_id,
        "route_coordinates": route_coords,
        "congestion_level": congestion_level,
        "bottleneck_segment_indices": bottleneck_indices,
        "distance_km": distance_km,
        "duration_min": duration_min,
        "recalled_preference": recalled_preference
    }