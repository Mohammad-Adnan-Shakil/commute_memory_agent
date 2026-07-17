import os
import requests
import polyline
from dotenv import load_dotenv
import time

_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_path)

ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_BASE_URL = "https://api.heigit.org/openrouteservice/v2/directions/driving-car"

def get_route(origin_lon: float, origin_lat: float, dest_lon: float, dest_lat: float, max_retries: int = 3) -> dict:
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }
    body = {
        "coordinates": [[origin_lon, origin_lat], [dest_lon, dest_lat]]
    }

    last_error = None
    for attempt in range(max_retries):
        response = requests.post(ORS_BASE_URL, json=body, headers=headers)

        if response.status_code == 200:
            data = response.json()
            route = data["routes"][0]
            summary = route["summary"]
            encoded_geometry = route["geometry"]
            decoded_coords = polyline.decode(encoded_geometry)

            return {
                "distance_km": round(summary["distance"] / 1000, 2),
                "duration_min": round(summary["duration"] / 60, 1),
                "raw_summary": summary,
                "route_coordinates": decoded_coords
            }

        last_error = f"ORS request failed: {response.status_code} - {response.text}"
        if response.status_code == 403 and attempt < max_retries - 1:
            time.sleep(1.5 * (attempt + 1))
            continue
        break

    return {"error": last_error}

def get_route(origin_lon: float, origin_lat: float, dest_lon: float, dest_lat: float) -> dict:
    """
    Fetches a driving route between two coordinates using OpenRouteService.

    Args:
        origin_lon: Origin longitude
        origin_lat: Origin latitude
        dest_lon: Destination longitude
        dest_lat: Destination latitude

    Returns:
        A dict with distance (km), duration (min), route summary,
        and decoded road-following geometry as [lat, lon] pairs.
    """
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }
    body = {
        "coordinates": [[origin_lon, origin_lat], [dest_lon, dest_lat]]
    }

    response = requests.post(ORS_BASE_URL, json=body, headers=headers)

    if response.status_code != 200:
        return {"error": f"ORS request failed: {response.status_code} - {response.text}"}

    data = response.json()
    route = data["routes"][0]
    summary = route["summary"]
    encoded_geometry = route["geometry"]

    decoded_coords = polyline.decode(encoded_geometry)

    return {
        "distance_km": round(summary["distance"] / 1000, 2),
        "duration_min": round(summary["duration"] / 60, 1),
        "raw_summary": summary,
        "route_coordinates": decoded_coords
    }