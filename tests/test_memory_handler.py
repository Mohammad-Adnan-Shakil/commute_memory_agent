"""
Tests for aws_lambda/memory_handler.py
Covers all four actions (log_conversation, store_preference, log_recommendation,
recall_similar_routes) plus error paths (unknown action, missing fields).
No real DB calls — _execute_query is stubbed by design until CockroachDB is live.
"""

import json
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "aws_lambda"))
from memory_handler import lambda_handler


def _invoke(action, payload):
    event = {"body": json.dumps({"action": action, "payload": payload})}
    result = lambda_handler(event, None)
    return result["statusCode"], json.loads(result["body"])


class TestLogConversationTurn:
    def test_success_returns_200_and_id(self):
        status, body = _invoke("log_conversation", {
            "session_id": "test-session-001",
            "role": "user",
            "content": "route from koramangala to indiranagar",
        })
        assert status == 200
        assert body["status"] == "logged"
        assert "id" in body

    def test_missing_required_field_returns_400(self):
        status, body = _invoke("log_conversation", {
            "session_id": "test-session-001",
            "role": "user",
            # missing "content"
        })
        assert status == 400
        assert "error" in body


class TestStoreRoutePreference:
    def test_success_returns_200_and_id(self):
        status, body = _invoke("store_preference", {
            "session_id": "test-session-001",
            "origin": "Koramangala",
            "destination": "Indiranagar",
            "distance_km": 5.74,
            "duration_min": 8.6,
            "preference_text": "avoid highways",
            "embedding": [],
        })
        assert status == 200
        assert body["status"] == "logged"
        assert "id" in body

    def test_optional_fields_default_gracefully(self):
        # distance_km/duration_min/preference_text/embedding are optional in the handler
        status, body = _invoke("store_preference", {
            "session_id": "test-session-001",
            "origin": "Koramangala",
            "destination": "Indiranagar",
        })
        assert status == 200

    def test_missing_required_field_returns_400(self):
        status, body = _invoke("store_preference", {
            "session_id": "test-session-001",
            "origin": "Koramangala",
            # missing "destination"
        })
        assert status == 400


class TestLogRecommendation:
    def test_success_returns_200_and_id(self):
        status, body = _invoke("log_recommendation", {
            "session_id": "test-session-001",
            "recommended_departure": "7:30 AM",
            "reasoning": "Corridor congestion low before 8 AM",
        })
        assert status == 200
        assert body["status"] == "logged"
        assert "id" in body

    def test_missing_required_field_returns_400(self):
        status, body = _invoke("log_recommendation", {
            "session_id": "test-session-001",
            "recommended_departure": "7:30 AM",
            # missing "reasoning"
        })
        assert status == 400


class TestRecallSimilarRoutes:
    def test_success_returns_200_and_matches(self):
        status, body = _invoke("recall_similar_routes", {
            "session_id": "test-session-001",
            "embedding": [],
        })
        assert status == 200
        assert body["status"] == "recalled"
        assert "matches" in body
        assert isinstance(body["matches"], list)

    def test_missing_session_id_returns_400(self):
        status, body = _invoke("recall_similar_routes", {
            "embedding": [],
        })
        assert status == 400


class TestActionRouting:
    def test_unknown_action_returns_400(self):
        status, body = _invoke("delete_everything", {"session_id": "test-session-001"})
        assert status == 400
        assert "Unknown action" in body["error"]

    def test_missing_action_returns_400(self):
        event = {"body": json.dumps({"payload": {}})}
        result = lambda_handler(event, None)
        assert result["statusCode"] == 400

    def test_malformed_json_body_returns_500(self):
        event = {"body": "not valid json{{{"}
        result = lambda_handler(event, None)
        assert result["statusCode"] == 500