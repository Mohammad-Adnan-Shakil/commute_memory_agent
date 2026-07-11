from google.adk.tools import ToolContext
import uuid
from datetime import datetime, timezone

def _get_embedding(text: str) -> list[float]:
    try:
        from ..memory.embeddings import embed_text
        return embed_text(text)
    except ImportError:
        return []

def log_conversation_turn(role: str, content: str, tool_context: ToolContext) -> dict:
    """
    Logs a single conversation turn to persistent memory.
    session_id is pulled automatically from ADK context — do not ask the model for it.
    """
    session_id = tool_context._invocation_context.session.id
    record_id = str(uuid.uuid4())
    record = {
        "id": record_id, "session_id": session_id,
        "role": role, "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    print(f"[STUB] log_conversation_turn: {record}")
    return {"status": "logged_stub", "id": record_id}


def store_route_preference(
    origin: str, destination: str, distance_km: float,
    duration_min: float, tool_context: ToolContext, preference_text: str = "",
) -> dict:
    session_id = tool_context._invocation_context.session.id
    record_id = str(uuid.uuid4())
    embedding = _get_embedding(preference_text) if preference_text else []
    record = {
        "id": record_id, "session_id": session_id,
        "origin": origin, "destination": destination,
        "distance_km": distance_km, "duration_min": duration_min,
        "preference_text": preference_text, "embedding_dim": len(embedding),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    print(f"[STUB] store_route_preference: {record}")
    return {"status": "logged_stub", "id": record_id}


def log_recommendation(
    recommended_departure: str, reasoning: str, tool_context: ToolContext,
) -> dict:
    session_id = tool_context._invocation_context.session.id
    record_id = str(uuid.uuid4())
    record = {
        "id": record_id, "session_id": session_id,
        "recommended_departure": recommended_departure, "reasoning": reasoning,
        "actual_outcome": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    print(f"[STUB] log_recommendation: {record}")
    return {"status": "logged_stub", "id": record_id}