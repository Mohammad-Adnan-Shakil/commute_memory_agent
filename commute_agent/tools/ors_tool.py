import time
import os
import requests
import polyline
from dotenv import load_dotenv

_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_env_path)

GRAPHHOPPER_API_KEY = os.getenv("GRAPHHOPPER_API_KEY")
GRAPHHOPPER_BASE_URL = "https://graphhopper.com/api/1/route"


def get_route(origin_lon: float, origin_lat: float, dest_lon: float, dest_lat: float, max_retries: int = 3) -> dict:
    """
    Fetches a driving route between two coordinates using GraphHopper Directions API.

    Args:
        origin_lon: Origin longitude
        origin_lat: Origin latitude
        dest_lon: Destination longitude
        dest_lat: Destination latitude
        max_retries: Number of retry attempts on transient failures

    Returns:
        A dict with distance (km), duration (min), route summary,
        and decoded road-following geometry as [lat, lon] pairs.
    """
    params = {
        "point": [f"{origin_lat},{origin_lon}", f"{dest_lat},{dest_lon}"],
        "vehicle": "car",
        "key": GRAPHHOPPER_API_KEY,
        "points_encoded": "true",  # returns Google-polyline-format geometry, same decoder as before
    }

    last_error = None
    for attempt in range(max_retries):
        response = requests.get(GRAPHHOPPER_BASE_URL, params=params)

        if response.status_code == 200:
            data = response.json()

            if "paths" not in data or not data["paths"]:
                last_error = f"GraphHopper returned no paths: {response.text}"
                break

            path = data["paths"][0]
            distance_m = path["distance"]
            duration_ms = path["time"]
            encoded_geometry = path["points"]

            decoded_coords = polyline.decode(encoded_geometry)

            return {
                "distance_km": round(distance_m / 1000, 2),
                "duration_min": round(duration_ms / 1000 / 60, 1),
                "raw_summary": {"distance": distance_m, "duration": duration_ms / 1000},
                "route_coordinates": decoded_coords
            }

        last_error = f"GraphHopper request failed: {response.status_code} - {response.text}"
        if response.status_code in (429, 500, 502, 503) and attempt < max_retries - 1:
            import time
            time.sleep(1.5 * (attempt + 1))
            continue
        break

    return {"error": last_error}