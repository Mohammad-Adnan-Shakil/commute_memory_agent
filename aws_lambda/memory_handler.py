"""
Lambda function: memory_handler
Acts as the write/query boundary between the commute agent and CockroachDB.
DB connection is stubbed until CockroachDB cluster is live (Aug 9).
"""

import json
import uuid
from datetime import datetime, timezone


def _recall_similar_routes(payload: dict) -> dict:
    """
    Queries route_preferences for semantically similar past queries
    using vector distance search (CockroachDB Distributed Vector Indexing).
    Stubbed to return mock results until the cluster is live.
    """
    query = (
        "SELECT origin, destination, preference_text, created_at "
        "FROM route_preferences "
        "WHERE session_id = %s "
        "ORDER BY preference_embedding <-> %s "
        "LIMIT 3"
    )
    params = (payload["session_id"], payload.get("embedding", []))
    _execute_query(query, params)

    # STUB: fake matches until real DB is wired (Aug 9)
    mock_results = [
        {
            "origin": "Koramangala",
            "destination": "Indiranagar",
            "preference_text": "avoid highways",
            "created_at": "2026-07-10T08:15:00+00:00",
        }
    ]
    return {"status": "recalled", "matches": mock_results}


# --- Stubbed DB layer — replace with real CockroachDB connection on Aug 9 ---
def _execute_query(query: str, params: tuple) -> dict:
    """
    Placeholder for the real CockroachDB connection (via psycopg2 or
    CockroachDB MCP Server). Currently just logs what WOULD be executed.
    """
    print(f"[STUB DB CALL] query={query} | params={params}")
    return {"status": "stub_success"}


# --- Action handlers ---
def _log_conversation_turn(payload: dict) -> dict:
    record_id = str(uuid.uuid4())
    query = (
        "INSERT INTO conversations (id, session_id, role, content, created_at) "
        "VALUES (%s, %s, %s, %s, %s)"
    )
    params = (
        record_id,
        payload["session_id"],
        payload["role"],
        payload["content"],
        datetime.now(timezone.utc).isoformat(),
    )
    _execute_query(query, params)
    return {"status": "logged", "id": record_id}


def _store_route_preference(payload: dict) -> dict:
    record_id = str(uuid.uuid4())
    query = (
        "INSERT INTO route_preferences "
        "(id, session_id, origin, destination, distance_km, duration_min, "
        "preference_text, preference_embedding, created_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)"
    )
    params = (
        record_id,
        payload["session_id"],
        payload["origin"],
        payload["destination"],
        payload.get("distance_km"),
        payload.get("duration_min"),
        payload.get("preference_text", ""),
        payload.get("embedding", []),
        datetime.now(timezone.utc).isoformat(),
    )
    _execute_query(query, params)
    return {"status": "logged", "id": record_id}


def _log_recommendation(payload: dict) -> dict:
    record_id = str(uuid.uuid4())
    query = (
        "INSERT INTO recommendation_outcomes "
        "(id, session_id, recommended_departure, reasoning, actual_outcome, created_at) "
        "VALUES (%s, %s, %s, %s, %s, %s)"
    )
    params = (
        record_id,
        payload["session_id"],
        payload["recommended_departure"],
        payload["reasoning"],
        "pending",
        datetime.now(timezone.utc).isoformat(),
    )
    _execute_query(query, params)
    return {"status": "logged", "id": record_id}


# --- Action router ---
ACTIONS = {
    "log_conversation": _log_conversation_turn,
    "store_preference": _store_route_preference,
    "log_recommendation": _log_recommendation,
    "recall_similar_routes": _recall_similar_routes,   # add this line
}


def lambda_handler(event, context):
    """
    Entry point. Expects event body (JSON) like:
    { "action": "store_preference", "payload": { ... } }
    """
    try:
        body = json.loads(event.get("body", "{}")) if "body" in event else event
        action = body.get("action")
        payload = body.get("payload", {})

        if action not in ACTIONS:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": f"Unknown action: {action}"}),
            }

        result = ACTIONS[action](payload)
        return {"statusCode": 200, "body": json.dumps(result)}

    except KeyError as e:
        return {"statusCode": 400, "body": json.dumps({"error": f"Missing field: {e}"})}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}