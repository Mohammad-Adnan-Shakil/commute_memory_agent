# Commute Memory Agent

A CockroachDB-backed fork of [bengaluru-commute-agent](https://github.com/Mohammad-Adnan-Shakil/bengaluru-commute-agent), built for the CockroachDB × AWS "Build with Agentic Memory" hackathon.

An agentic AI system built with Google ADK that reasons about known Bengaluru traffic bottlenecks and helps decide when and how to travel — now with persistent agentic memory.

**Live demo:** https://commute-memory-agent-navy.vercel.app
**Backend API:** https://commute-memory-agent-backend.onrender.com

## What this is

A multi-agent Bengaluru commute planning system that remembers past route queries, tracks user preferences via vector embeddings, and logs recommendation outcomes for accuracy tracking over time.

## Architecture

```
commute_agent (orchestrator)
├── route_agent      → get_route, check_bottleneck, store_route_preference, recall_similar_routes
└── advisor_agent    → compare_departure_times, log_recommendation
```

Strict separation of concerns: `route_agent` gathers raw data only (never recommends), `advisor_agent` synthesizes a decisive recommendation from that data. The orchestrator delegates based on query intent at inference time — not a fixed execution order.

Memory writes and recall route through a dedicated AWS Lambda handler (`aws_lambda/memory_handler.py`), acting as an isolated write/query boundary between the agent and CockroachDB — not embedded directly in the agent's tool logic.

## Known Corridors

| Corridor | Peak Windows | Max Delay Multiplier |
|---|---|---|
| Silk Board – ORR | 8:30–10:30 AM, 5:30–8:00 PM | 2.5x |
| Whitefield – Marathahalli | 9:00–10:30 AM, 6:00–8:30 PM | 2.0x |
| Hebbal Flyover | 8:00–10:00 AM, 6:30–8:30 PM | 2.0x |
| Electronic City – Hosur Road | 8:30–10:00 AM, 6:00–8:00 PM | 2.4x |

## Stack

- **Agent framework:** Google ADK (Agent Development Kit)
- **LLM:** Tencent Hy3 (free tier) via OpenRouter, using ADK's `LiteLlm` wrapper
- **Routing:** GraphHopper Directions API
- **Memory (in progress):** CockroachDB Cloud — conversation history, route preference embeddings (Distributed Vector Indexing), recommendation outcome tracking, accessed via CockroachDB Cloud's managed MCP Server
- **Compute (in progress):** AWS Lambda as the memory write/query boundary layer
- **Embeddings:** Ollama + `nomic-embed-text` (local, zero-cost)
- **Frontend:** React + Vite + Tailwind v4 + Framer Motion + React-Leaflet
- **Deployment:** Backend on Render, Frontend on Vercel

## Status

- ✅ Base agent forked and working (route fetching, corridor bottleneck detection, departure-time comparison, recommendation synthesis)
- ✅ LLM backend swapped to OpenRouter (free tier), tool-calling verified
- ✅ Routing provider swapped to GraphHopper (heigit's API intermittently blocked requests from cloud server IPs)
- ✅ Memory tools implemented (`log_conversation_turn`, `store_route_preference`, `log_recommendation`, `recall_similar_routes`) — currently backed by a local Lambda-shaped handler with stub persistence
- ✅ AWS Lambda handler written and locally tested, with IAM least-privilege policies and Secrets Manager integration pattern documented
- ✅ Full stack deployed live (Render + Vercel)
- ⬜ CockroachDB Cloud cluster provisioning
- ⬜ CockroachDB MCP Server connection (live)
- ⬜ Live vector search for preference recall (currently mock data)
- ⬜ AWS Lambda deployed to AWS (currently local-only)

## Setup

```bash
git clone https://github.com/Mohammad-Adnan-Shakil/commute_memory_agent.git
cd commute_memory_agent
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create a `.env` in the root with:
```
OPENROUTER_API_KEY=your_key_here
GRAPHHOPPER_API_KEY=your_key_here
```

Run the agent locally:
```bash
adk web
```

Run the full stack locally:
```bash
# Terminal 1 — backend
uvicorn api:app --reload --port 8001

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

## Example Queries

- "Route from Koramangala to Indiranagar"
- "Should I leave Electronic City for Whitefield at 7:30 AM or 9:15 AM?"
- "What's the traffic like from Silk Board to ORR at 8:45 AM?"

## Hackathon

Built for [CockroachDB × AWS: Build with Agentic Memory](https://cockroachdb-ai.devpost.com/) — deadline **August 18, 2026, 5:00 PM EDT**.

## Author

Mohammad Adnan Shakil — [GitHub](https://github.com/Mohammad-Adnan-Shakil)
