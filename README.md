# Bengaluru Commute Agent

An agentic AI system built with Google ADK + Gemini that doesn't just find routes —
it reasons about known Bengaluru traffic bottlenecks and helps you decide when and how to travel.

Built for the Google AI Agent Builder Series 2026 (Open Innovation track).

## Why This Exists

Bengaluru has some of the worst urban traffic in the world. Generic routing tools show you
distance and time, but they don't account for corridor-specific congestion patterns commuters
already know from experience. This agent reasons over curated knowledge of Bengaluru's worst
bottlenecks — Silk Board, Whitefield, Hebbal, Electronic City — and gives a synthesized,
decisive recommendation instead of raw numbers.

## Architecture
commute_agent (orchestrator)

├── route_agent — gathers data

│     ├── get_route (OpenRouteService)

│     └── check_bottleneck (curated corridor knowledge)

└── advisor_agent — reasons and decides

└── compare_departure_times

The orchestrator delegates to `route_agent` for factual data gathering, then to `advisor_agent`
for synthesis and decision-making. This separation means each agent has a single, clear
responsibility — one gathers, one decides.

## Tech Stack

**Agent**
- Google Agent Development Kit (ADK)
- Gemini 2.5 Flash-Lite
- OpenRouteService API (routing)
- Python

**Frontend**
- React (Vite)
- Tailwind CSS v4
- FastAPI (backend wrapper exposing the agent as a REST endpoint)

## Known Corridors

| Corridor | Peak Windows | Max Delay Multiplier |
|---|---|---|
| Silk Board – ORR | 8:30–10:30 AM, 5:30–8:00 PM | 2.5x |
| Whitefield – Marathahalli | 9:00–10:30 AM, 6:00–8:30 PM | 2.0x |
| Hebbal Flyover | 8:00–10:00 AM, 6:30–8:30 PM | 2.0x |
| Electronic City – Hosur Road | 8:30–10:00 AM, 6:00–8:00 PM | 2.4x |

## Setup

### Agent (CLI / ADK Web)

```bash
git clone https://github.com/Mohammad-Adnan-Shakil/bengaluru-commute-agent.git
cd bengaluru-commute-agent/commute_agent
python -m venv venv
venv\Scripts\activate  # Windows
pip install google-adk python-dotenv requests

# Create .env with:
# GOOGLE_API_KEY=your_gemini_key
# ORS_API_KEY=your_openrouteservice_key

cd ..
adk web
```

### Full Stack (Frontend + Backend)

```bash
# Terminal 1 — backend (FastAPI wrapping the ADK agent)
cd bengaluru-commute-agent
venv\Scripts\activate
pip install fastapi uvicorn
uvicorn api:app --reload --port 8001

# Terminal 2 — frontend (React + Tailwind)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` for the chat interface, or use `adk web`'s built-in UI
at `http://127.0.0.1:8000` to see the raw agent trace (tool calls, sub-agent delegation).

## Example Queries

- "What's the traffic like from Silk Board to ORR at 8:45 AM?"
- "Should I leave Electronic City for Whitefield at 7:30 AM or 9:15 AM?"
- "What's the route from Jayanagar to Koramangala at 9 AM?" (tests graceful fallback for routes outside known corridors)

## Limitations & Future Work

- Congestion data is curated from public commuter reports, not pulled from live traffic feeds.
  A production version would integrate real-time traffic APIs.
- Currently covers 4 major corridors. Expansion would require crowd-sourced or municipal
  traffic data for broader city coverage.
- No persistent memory across sessions yet — planned as a next iteration.
- Free-tier Gemini API quota limits sustained testing; production deployment would require
  a billed tier for reliability.

## Author

Mohammad Adnan Shakil — [GitHub](https://github.com/Mohammad-Adnan-Shakil)
