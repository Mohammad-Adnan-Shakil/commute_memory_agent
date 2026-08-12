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
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
            if fetch:
                rows = cur.fetchall()
                colnames = [desc[0] for desc in cur.description]
                conn.commit()
                results = []
                for row in rows:
                    record = {}
                    for col, val in zip(colnames, row):
                        if hasattr(val, "isoformat"):
                            record[col] = val.isoformat()
                        else:
                            record[col] = val
                    results.append(record)
                return results
            conn.commit()
            return {"status": "success"}
    except Exception as e:
        conn.rollback()
        raise


def _recall_similar_routes(payload: dict) -> dict:
    user_id = payload.get("user_id")
    session_id = payload.get("session_id")
    embedding = payload.get("embedding", [])
    if embedding:
        embedding_literal = "[" + ",".join(str(x) for x in embedding) + "]"
    else:
        embedding_literal = None  # NULL in the database, not an empty vector

    if user_id:
        query = (
            "SELECT origin, destination, preference_text, created_at "
            "FROM route_preferences "
            "WHERE user_id = %s "
            "ORDER BY preference_embedding <-> %s "
            "LIMIT 3"
        )
        params = (user_id, embedding_literal)
    else:
        query = (
            "SELECT origin, destination, preference_text, created_at "
            "FROM route_preferences "
            "WHERE session_id = %s "
            "ORDER BY preference_embedding <-> %s "
            "LIMIT 3"
        )
        params = (session_id, embedding_literal)
    try:
        results = _execute_query(query, params, fetch=True)
        return {"status": "recalled", "matches": results}
    except Exception as e:
        return {"error": f"Database read failed: {str(e)}"}


# --- Action handlers ---
def _log_conversation_turn(payload: dict) -> dict:
    record_id = str(uuid.uuid4())
    query = (
        "INSERT INTO conversations (id, session_id, user_id, role, content, created_at) "
        "VALUES (%s, %s, %s, %s, %s, %s)"
    )
    params = (
        record_id,
        payload["session_id"],
        payload.get("user_id"),
        payload["role"],
        payload["content"],
        datetime.now(timezone.utc).isoformat(),
    )
    try:
        _execute_query(query, params)
        return {"status": "logged", "id": record_id}
    except Exception as e:
        return {"error": f"Database write failed: {str(e)}"}


def _store_route_preference(payload: dict) -> dict:
    record_id = str(uuid.uuid4())
    query = (
        "INSERT INTO route_preferences "
        "(id, session_id, user_id, origin, destination, distance_km, duration_min, "
        "preference_text, preference_embedding, created_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
    )
    embedding = payload.get("embedding", [])
    if embedding:
        embedding_literal = "[" + ",".join(str(x) for x in embedding) + "]"
    else:
        embedding_literal = None  # NULL in the database, not an empty vector
    params = (
        record_id,
        payload["session_id"],
        payload.get("user_id"),
        payload["origin"],
        payload["destination"],
        payload.get("distance_km"),
        payload.get("duration_min"),
        payload.get("preference_text", ""),
        embedding_literal,
        datetime.now(timezone.utc).isoformat(),
    )
    try:
        _execute_query(query, params)
        return {"status": "logged", "id": record_id}
    except Exception as e:
        return {"error": f"Database write failed: {str(e)}"}


def _log_recommendation(payload: dict) -> dict:
    record_id = str(uuid.uuid4())
    query = (
        "INSERT INTO recommendation_outcomes "
        "(id, session_id, user_id, recommended_departure, reasoning, actual_outcome, created_at) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s)"
    )
    params = (
        record_id,
        payload["session_id"],
        payload.get("user_id"),
        payload["recommended_departure"],
        payload["reasoning"],
        "pending",
        datetime.now(timezone.utc).isoformat(),
    )
    try:
        _execute_query(query, params)
        return {"status": "logged", "id": record_id}
    except Exception as e:
        return {"error": f"Database write failed: {str(e)}"}


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