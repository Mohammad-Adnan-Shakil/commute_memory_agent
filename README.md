# Bengaluru Commute Agent

An agentic AI system built with Google ADK + Gemini that doesn't just find routes —
it reasons about known Bengaluru traffic bottlenecks and helps you decide when and how to travel.

Built for the Google AI Agent Builder Series 2026 (Open Innovation track).

**Live demo:** https://bengaluru-commute-agent.vercel.app

## Why This Exists

Bengaluru has some of the worst urban traffic in the world. Generic routing tools show you
distance and time, but they don't account for corridor-specific congestion patterns commuters
already know from experience. This agent reasons over curated knowledge of Bengaluru's worst
bottlenecks — Silk Board, Whitefield, Hebbal, Electronic City — and gives a synthesized,
decisive recommendation instead of raw numbers, visualized on an interactive map with
color-coded congestion segments.

## Architecture
commute_agent (orchestrator)
├── route_agent — gathers data
│     ├── get_route (OpenRouteService, real road-following geometry)
│     └── check_bottleneck (curated corridor knowledge)
└── advisor_agent — reasons and decides
└── compare_departure_times

The orchestrator delegates to `route_agent` for factual data gathering, then to `advisor_agent`
for synthesis and decision-making. Each agent has a single, clear responsibility — one gathers,
one decides. Gemini decides which tools to call and which agent to delegate to at inference
time, based on the query — not a fixed execution order.

## Tech Stack

**Agent**
- Google Agent Development Kit (ADK)
- Gemini 2.5 Flash-Lite
- OpenRouteService via HeiGIT (`api.heigit.org`) — live routing, decoded polyline geometry

**Full Stack**
- FastAPI (backend, wraps the ADK agent as a REST endpoint, with retry logic for transient Gemini errors)
- React + Vite
- Tailwind CSS v4
- React-Leaflet (interactive map, color-coded congestion segments, dark CartoDB tiles)

**Deployment**
- Backend: Render
- Frontend: Vercel

## Known Corridors

| Corridor | Peak Windows | Max Delay Multiplier |
|---|---|---|
| Silk Board – ORR | 8:30–10:30 AM, 5:30–8:00 PM | 2.5x |
| Whitefield – Marathahalli | 9:00–10:30 AM, 6:00–8:30 PM | 2.0x |
| Hebbal Flyover | 8:00–10:00 AM, 6:30–8:30 PM | 2.0x |
| Electronic City – Hosur Road | 8:30–10:00 AM, 6:00–8:00 PM | 2.4x |

## Setup

### Agent Only (CLI / ADK Web)

```bash
git clone https://github.com/Mohammad-Adnan-Shakil/bengaluru-commute-agent.git
cd bengaluru-commute-agent/commute_agent
python -m venv venv
venv\Scripts\activate  # Windows
pip install google-adk python-dotenv requests polyline

# Create .env with:
# GOOGLE_API_KEY=your_gemini_key
# ORS_API_KEY=your_openrouteservice_key

cd ..
adk web
```

### Full Stack (Frontend + Backend)

```bash
# Terminal 1 — backend
cd bengaluru-commute-agent
venv\Scripts\activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8001

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. Set `VITE_API_URL` in `frontend/.env` if pointing to a
non-default backend URL.

> **Note:** OpenRouteService migrated its API base URL from `api.openrouteservice.org` to
> `api.heigit.org` in April 2026. This project uses the current endpoint. If you fork this
> and hit a "disallowed" error from ORS, confirm you're using `api.heigit.org`.

## Example Queries

- "What's the traffic like from Silk Board to ORR at 8:45 AM?"
- "Should I leave Electronic City for Whitefield at 7:30 AM or 9:15 AM?"
- "What's the route from Jayanagar to Koramangala at 9 AM?" (tests graceful fallback for routes outside known corridors)

## Limitations & Future Work

- Congestion data is curated from public commuter reports, not pulled from live traffic feeds.
  A production version would integrate real-time traffic APIs.
- Currently covers 4 major corridors. Expansion would require crowd-sourced or municipal
  traffic data for broader city coverage.
- No persistent memory across sessions yet.
- Free-tier Gemini API has rate limits that can occasionally cause delayed or retried responses
  under high demand; retry logic is implemented to handle this gracefully.
- Free-tier Render hosting spins down after inactivity — first request after idle may take
  30-50 seconds to respond.
- Place-name-to-coordinate resolution for locations outside the 4 known corridors relies on
  the model's own geocoding; uncommon or ambiguous place names may occasionally fail to resolve.

## Author

Mohammad Adnan Shakil — [GitHub](https://github.com/Mohammad-Adnan-Shakil)
