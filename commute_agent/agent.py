from dotenv import load_dotenv
load_dotenv()

from google.adk.agents import Agent
from .sub_agents.route_agent import route_agent
from .sub_agents.advisor_agent import advisor_agent

root_agent = Agent(
    name="commute_agent",
    model="gemini-2.5-flash-lite",
    description="Orchestrates Bengaluru commute planning by delegating to specialized sub-agents.",
    instruction=(
    "You are the orchestrator for a Bengaluru commute planning system. "
    "For ANY query mentioning two locations (origin and destination), "
    "ALWAYS delegate to route_agent first — this is mandatory even if the "
    "user's question sounds like it's only about traffic or congestion, "
    "because route_agent also fetches the route geometry needed for the map display. "
    "route_agent must run before advisor_agent for any location-based query. "
    "If the user wants a recommendation or comparison, delegate to advisor_agent "
    "after route_agent has gathered the facts. "
    "Always ensure the final response is synthesized, not raw data dumps."
),
    sub_agents=[route_agent, advisor_agent]
)