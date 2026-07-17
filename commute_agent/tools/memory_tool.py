from google.adk.tools import ToolContext
import sys
import os

# Import the local Lambda handler directly for now.
# On Aug 9+, this import gets replaced with an HTTP call to the deployed
# Lambda's API Gateway endpoint instead.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "aws_lambda"))
from memory_handler import lambda_handler
import json


def recall_similar_routes(
    origin: str, destination: str, tool_context: ToolContext
) -> dict:
    """
    Checks memory for similar past route queries before fetching a new route.
    Returns matches with any stored preferences, so the agent can reference
    prior context instead of treating every query as brand new.
    """
    session_id = tool_context._invocation_context.session.id
    query_text = f"{origin} to {destination}"
    embedding = _get_embedding(query_text)
    return _invoke_memory_lambda("recall_similar_routes", {
        "session_id": session_id,
        "embedding": embedding,
    })

def _invoke_memory_lambda(action: str, payload: dict) -> dict:
    event = {"body": json.dumps({"action": action, "payload": payload})}
    result = lambda_handler(event, None)
    return json.loads(result["body"])


def _get_embedding(text: str) -> list[float]:
    try:
        from ..memory.embeddings import embed_text
        return embed_text(text)
    except ImportError:
        return []


def log_conversation_turn(role: str, content: str, tool_context: ToolContext) -> dict:
    """Logs a single conversation turn to persistent memory via the memory Lambda."""
    session_id = tool_context._invocation_context.session.id
    return _invoke_memory_lambda("log_conversation", {
        "session_id": session_id,
        "role": role,
        "content": content,
    })


def store_route_preference(
    origin: str, destination: str, distance_km: float,
    duration_min: float, tool_context: ToolContext, preference_text: str = "",
) -> dict:
    session_id = tool_context._invocation_context.session.id
    embedding = _get_embedding(preference_text) if preference_text else []
    return _invoke_memory_lambda("store_preference", {
        "session_id": session_id,
        "origin": origin,
        "destination": destination,
        "distance_km": distance_km,
        "duration_min": duration_min,
        "preference_text": preference_text,
        "embedding": embedding,
    })


def log_recommendation(
    recommended_departure: str, reasoning: str, tool_context: ToolContext,
) -> dict:
    session_id = tool_context._invocation_context.session.id
    return _invoke_memory_lambda("log_recommendation", {
        "session_id": session_id,
        "recommended_departure": recommended_departure,
        "reasoning": reasoning,
    })