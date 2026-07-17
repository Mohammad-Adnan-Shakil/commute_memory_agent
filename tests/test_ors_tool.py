"""
Tests for commute_agent/tools/ors_tool.py (GraphHopper-backed get_route).
All HTTP calls are mocked — no real API requests, no API key needed to run tests.
"""

import sys
import os
from unittest.mock import patch, MagicMock
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "commute_agent", "tools"))
import ors_tool


# A minimal valid GraphHopper response, encoded geometry decodes to 2 points.
# Polyline-encoded string for [(12.9279, 77.6271), (12.9719, 77.6412)] at precision 5.
MOCK_SUCCESS_RESPONSE = {
    "paths": [
        {
            "distance": 6980.0,   # meters
            "time": 654000,       # milliseconds
            "points": "_p~iF~ps|U_ulLnnqC",  # placeholder encoded polyline
        }
    ]
}


class TestGetRouteSuccess:
    @patch("ors_tool.requests.get")
    def test_success_returns_correct_shape(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = MOCK_SUCCESS_RESPONSE
        mock_get.return_value = mock_response

        result = ors_tool.get_route(77.6271, 12.9279, 77.6412, 12.9719)

        assert "error" not in result
        assert result["distance_km"] == 6.98
        assert result["duration_min"] == 10.9
        assert "route_coordinates" in result
        assert isinstance(result["route_coordinates"], list)

    @patch("ors_tool.requests.get")
    def test_calls_correct_endpoint_with_key(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = MOCK_SUCCESS_RESPONSE
        mock_get.return_value = mock_response

        ors_tool.get_route(77.6271, 12.9279, 77.6412, 12.9719)

        called_url = mock_get.call_args[0][0]
        called_params = mock_get.call_args[1]["params"]
        assert "graphhopper.com" in called_url
        assert "key" in called_params
        assert called_params["vehicle"] == "car"


class TestGetRouteFailure:
    @patch("ors_tool.requests.get")
    def test_no_paths_in_response_returns_error(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"paths": []}
        mock_get.return_value = mock_response

        result = ors_tool.get_route(77.6271, 12.9279, 77.6412, 12.9719)

        assert "error" in result

    @patch("ors_tool.requests.get")
    def test_permanent_error_returns_error_without_infinite_retry(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"
        mock_get.return_value = mock_response

        result = ors_tool.get_route(77.6271, 12.9279, 77.6412, 12.9719, max_retries=3)

        assert "error" in result
        # 401 is not in the retry list, should fail fast on first attempt
        assert mock_get.call_count == 1

    @patch("ors_tool.time.sleep", return_value=None)
    @patch("ors_tool.requests.get")
    def test_rate_limit_retries_up_to_max(self, mock_get, mock_sleep):
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.text = "Rate limited"
        mock_get.return_value = mock_response

        result = ors_tool.get_route(77.6271, 12.9279, 77.6412, 12.9719, max_retries=3)

        assert "error" in result
        assert mock_get.call_count == 3

    @patch("ors_tool.time.sleep", return_value=None)
    @patch("ors_tool.requests.get")
    def test_recovers_after_transient_failure(self, mock_get, mock_sleep):
        fail_response = MagicMock()
        fail_response.status_code = 503
        fail_response.text = "Service unavailable"

        success_response = MagicMock()
        success_response.status_code = 200
        success_response.json.return_value = MOCK_SUCCESS_RESPONSE

        mock_get.side_effect = [fail_response, success_response]

        result = ors_tool.get_route(77.6271, 12.9279, 77.6412, 12.9719, max_retries=3)

        assert "error" not in result
        assert result["distance_km"] == 6.98
        assert mock_get.call_count == 2