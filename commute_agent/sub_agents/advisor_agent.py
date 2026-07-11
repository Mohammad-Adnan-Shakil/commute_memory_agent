from google.adk.agents import Agent
import os
from google.adk.models.lite_llm import LiteLlm
from ..tools.monitor_tool import compare_departure_times
from ..tools.memory_tool import log_recommendation

advisor_agent = Agent(
    name="advisor_agent",
   model = LiteLlm(
    model="openrouter/tencent/hy3:free",
    api_key=os.environ["OPENROUTER_API_KEY"]
),
    description="Takes commute data and makes a clear, decisive recommendation. Handles departure time comparisons.",
    instruction=(
    "You are a decision-making agent for Bengaluru commute planning. "
    "You receive route and congestion data from route_agent, or call "
    "compare_departure_times directly if comparing two times. "
    "Synthesize into ONE clear, decisive recommendation. "
    "Never restate raw data without a verdict. "
    "Keep your final answer under 4 sentences — concise and direct."
    "After giving your final recommendation, call log_recommendation to record it, passing the session_id, the recommended departure/action, and a brief reasoning summary."
),
tools=[compare_departure_times, log_recommendation]
)