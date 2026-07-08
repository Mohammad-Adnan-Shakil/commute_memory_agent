import asyncio
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part
from commute_agent.agent import root_agent
import uuid

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://bengaluru-commute-agent.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

session_service = InMemorySessionService()
runner = Runner(agent=root_agent, app_name="commute_agent", session_service=session_service)


class Query(BaseModel):
    message: str
    session_id: str | None = None


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
            if "503" in str(e) and not is_last_attempt:
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
    for event in events:
        try:
            function_responses = event.get_function_responses()
        except AttributeError:
            continue
        if function_responses:
            for fr in function_responses:
                if fr.name == "check_bottleneck":
                    result = fr.response
                    if isinstance(result, dict):
                        return result.get("congestion")
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
        return "Agent response was incomplete (Gemini high demand). Please try again in a few seconds."
    text = final_response.content.parts[0].text
    if not text:
        return "Agent response was incomplete (Gemini high demand). Please try again in a few seconds."
    return text


@app.post("/chat")
async def chat(query: Query):
    if MOCK_MODE:
        return MOCK_RESPONSES["default"]
    session_id = query.session_id or str(uuid.uuid4())
    session = await session_service.get_session(
        app_name="commute_agent", user_id="user", session_id=session_id
    )
    if not session:
        session = await session_service.create_session(
            app_name="commute_agent", user_id="user", session_id=session_id
        )

    message_content = Content(role="user", parts=[Part(text=query.message)])

    try:
        events = await run_with_retry("user", session_id, message_content)
    except Exception as e:
        return {
            "response": f"Agent temporarily unavailable (Gemini high demand). Try again in a few seconds. [{str(e)[:120]}]",
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
    bottleneck_indices = _compute_bottleneck_indices(route_coords, congestion_level)

    return {
        "response": extract_response_text(final_response),
        "tool_trace": tool_calls,
        "session_id": session_id,
        "route_coordinates": route_coords,
        "congestion_level": congestion_level,
        "bottleneck_segment_indices": bottleneck_indices
    }