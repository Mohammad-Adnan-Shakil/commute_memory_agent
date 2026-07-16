"""
Local test harness for memory_handler.py — simulates Lambda invocation
without needing AWS deployed. Run this directly to sanity-check the handler.
"""

import json
from memory_handler import lambda_handler

def run_test(action, payload):
    event = {
        "body": json.dumps({"action": action, "payload": payload})
    }
    result = lambda_handler(event, None)
    print(f"\n--- Test: {action} ---")
    print(f"Status: {result['statusCode']}")
    print(f"Body: {result['body']}")


if __name__ == "__main__":
    run_test("log_conversation", {
        "session_id": "test-session-001",
        "role": "user",
        "content": "route from koramangala to indiranagar"
    })

    run_test("store_preference", {
        "session_id": "test-session-001",
        "origin": "Koramangala",
        "destination": "Indiranagar",
        "distance_km": 6.98,
        "duration_min": 10.9,
        "preference_text": "avoid highways"
    })

    run_test("log_recommendation", {
        "session_id": "test-session-001",
        "recommended_departure": "7:30 AM",
        "reasoning": "Corridor congestion low before 8 AM"
    })

    # Test the error path — unknown action
    run_test("delete_everything", {"session_id": "test-session-001"})