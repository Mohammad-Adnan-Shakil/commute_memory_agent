import json
import os
import uuid
from datetime import datetime, timezone
import psycopg2

# Reused across warm Lambda invocations to avoid reconnecting every call
_connection = None

def _get_connection():
    global _connection
    if _connection is None or _connection.closed:
        _connection = psycopg2.connect(os.environ["COCKROACHDB_CONNECTION_STRING"])
    return _connection


def _execute_query(query: str, params: tuple, fetch: bool = False):
    """
    Executes a query against the real CockroachDB cluster.
    Set fetch=True for SELECT queries to return rows.
    """
    conn = _get_connection()
    with conn.cursor() as cur:
        cur.execute(query, params)
        if fetch:
            rows = cur.fetchall()
            colnames = [desc[0] for desc in cur.description]
            conn.commit()
            return [dict(zip(colnames, row)) for row in rows]
        conn.commit()
        return {"status": "success"}


def _recall_similar_routes(payload: dict) -> dict:
    query = (
        "SELECT origin, destination, preference_text, created_at "
        "FROM route_preferences "
        "WHERE session_id = %s "
        "ORDER BY preference_embedding <-> %s "
        "LIMIT 3"
    )
    params = (payload["session_id"], payload.get("embedding", []))
    results = _execute_query(query, params, fetch=True)
    return {"status": "recalled", "matches": results}


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