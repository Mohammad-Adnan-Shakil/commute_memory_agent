from google.adk.agents import Agent
from ..tools.ors_tool import get_route
from ..tools.bottleneck_tool import check_bottleneck

route_agent = Agent(
    name="route_agent",
    model="gemini-2.5-flash-lite",
    description="Gathers raw commute data: route distance, duration, and known corridor congestion status. Does not make recommendations.",
    instruction=(
    "You are a data-gathering agent for Bengaluru commutes. "
    "Given a start and end location, use get_route ONCE to fetch distance, "
    "duration, and route geometry. "
    "If get_route returns valid data (distance_km, duration_min, route_coordinates), "
    "you MUST treat this as a SUCCESS. Never say the route service is unavailable "
    "or that you cannot fulfill the request if get_route returned valid data. "
    "If a departure time is given and the route passes through a known corridor "
    "(silk_board_orr, whitefield_stretch, hebbal, electronic_city), "
    "use check_bottleneck ONCE for that corridor. "
    "Report the raw facts only — distance, duration, congestion status, "
    "delay multiplier, and alternate routes. Do NOT give a final recommendation. "
    "Convert place names to approximate lat/lon coordinates yourself if given place names."
),
    tools=[get_route, check_bottleneck]
)