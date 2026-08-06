KNOWN_LOCATIONS = {
    "electronic city": (12.8452, 77.6602),
    "whitefield": (12.9698, 77.7500),
    "marathahalli": (12.9569, 77.7011),
    "koramangala": (12.9352, 77.6245),
    "indiranagar": (12.9784, 77.6408),
    "silk board": (12.9172, 77.6228),
    "orr": (12.9350, 77.6963),
    "outer ring road": (12.9350, 77.6963),
    "hebbal": (13.0355, 77.5970),
    "hsr layout": (12.9121, 77.6446),
    "mg road": (12.9757, 77.6068),
    "hbr layout": (13.0389, 77.6255),
    "jayanagar": (12.9250, 77.5938),
    "jp nagar": (12.9077, 77.5851),
    "btm layout": (12.9166, 77.6101),
    "airport": (13.1986, 77.7066),
    "kempegowda international airport": (13.1986, 77.7066),
    "kia": (13.1986, 77.7066),
}


def resolve_known_location(place_name: str):
    """
    Returns (lat, lon) if place_name matches a known Bengaluru location,
    otherwise returns None (caller should fall back to LLM's own estimate).
    Matching is case-insensitive and checks if the known key appears
    anywhere in the input string, to handle variations like
    "near electronic city" or "Electronic City Phase 1".
    """
    normalized = place_name.strip().lower()
    for key, coords in KNOWN_LOCATIONS.items():
        if key in normalized:
            return coords
    return None