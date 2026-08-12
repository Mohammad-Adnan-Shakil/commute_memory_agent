# Commute Memory Agent

A CockroachDB-backed fork of [bengaluru-commute-agent](https://github.com/Mohammad-Adnan-Shakil/bengaluru-commute-agent), built for the CockroachDB × AWS "Build with Agentic Memory" hackathon.

An agentic AI system built with Google ADK that reasons about known Bengaluru traffic bottlenecks and helps decide when and how to travel — now with persistent, user-scoped agentic memory backed by CockroachDB's Distributed Vector Indexing.

**Live demo:** https://commute-memory-agent-navy.vercel.app
**Backend API:** https://commute-memory-agent-backend.onrender.com

## What this is

A multi-agent Bengaluru commute planning system that remembers past route queries and preferences via vector embeddings, recalls them through similarity search, and persists them across sessions and devices for logged-in users — while remaining fully usable anonymously.

## Architecture

```
commute_agent (orchestrator)
├── route_agent      → get_route, check_bottleneck, resolve_known_location,
│                       store_route_preference, recall_similar_routes
└── advisor_agent    → compare_departure_times, log_recommendation
```

Strict separation of concerns: `route_agent` gathers raw data only (never recommends), `advisor_agent` synthesizes a decisive recommendation from that data. The orchestrator delegates based on query intent at inference time — not a fixed execution order.

Memory writes and recall route through a dedicated handler (`aws_lambda/memory_handler.py`) that connects directly to CockroachDB, acting as an isolated write/query boundary between the agent and the database rather than being embedded in the agent's tool logic. This handler was built and tested for AWS Lambda deployment (see **Known Limitations** below for its current runtime status).

## Known Corridors

| Corridor | Peak Windows | Max Delay Multiplier |
|---|---|---|
| Silk Board – ORR | 8:30–10:30 AM, 5:30–8:00 PM | 2.5x |
| Whitefield – Marathahalli | 9:00–10:30 AM, 6:00–8:30 PM | 2.0x |
| Hebbal Flyover | 8:00–10:00 AM, 6:30–8:30 PM | 2.0x |
| Electronic City – Hosur Road | 8:30–10:00 AM, 6:00–8:00 PM | 2.4x |

## Stack

- **Agent framework:** Google ADK (Agent Development Kit)
- **LLM:** Cohere North Mini Code (free tier) via OpenRouter, using ADK's `LiteLlm` wrapper — chosen after two larger free models (Llama 3.3, Nemotron 3 Ultra) hit discontinuation/capacity limits under real load
- **Routing:** GraphHopper Directions API
- **Memory:** CockroachDB Cloud — conversation history, route preference embeddings with a **Distributed Vector Index**, recalled via vector similarity search (`ORDER BY preference_embedding <-> $1`)
- **Embeddings:** A zero-dependency, deterministic feature-hashing embedding (768-dim, implemented in `commute_agent/memory/embeddings.py`) — chosen over a locally-hosted model (e.g. Ollama) because the deployed backend runs on Render, which has no local LLM runtime available; this keeps embedding generation reliable and free in production rather than silently failing
- **Auth:** JWT-based signup/login (bcrypt password hashing via `passlib`), optional — anonymous session-based usage remains fully supported for users who don't create an account
- **Frontend:** React + Vite + Tailwind v4 + Framer Motion + React-Leaflet, with a WebGL shader background and a dedicated landing page explaining the architecture to first-time visitors
- **Deployment:** Backend on Render, Frontend on Vercel

## Status

- ✅ Multi-agent orchestration, route fetching, corridor bottleneck detection, departure-time comparison, recommendation synthesis
- ✅ LLM backend on OpenRouter (free tier), tool-calling verified under real load
- ✅ Routing via GraphHopper, including a hardcoded coordinate lookup for well-known Bengaluru locations (fixes LLM geocoding inaccuracy for common places)
- ✅ **CockroachDB Cloud cluster live** — schema deployed (`users`, `conversations`, `route_preferences` with a Distributed Vector Index, `recommendation_outcomes`)
- ✅ **Memory fully live in production** — real writes, real feature-hashed embeddings, real vector similarity recall, confirmed end-to-end
- ✅ **JWT authentication live** — signup, login, password hashing, session persistence via localStorage, and cross-session/cross-device memory recall for logged-in users (verified with a live token against two different session IDs)
- ✅ Anonymous usage remains fully supported alongside authenticated usage
- ✅ Full stack deployed live (Render + Vercel), including a dedicated landing/explainer page
- ⬜ **AWS Lambda deployed to live AWS infrastructure** — see Known Limitations

## Known Limitations

**AWS Lambda is not deployed to actual AWS infrastructure.** The Lambda handler code (`aws_lambda/memory_handler.py`) is written, tested, and structured for deployment (including least-privilege IAM trust/permissions policies in `aws_lambda/iam/`), and it runs correctly today — but in-process, called directly by the FastAPI backend on Render, not as a real AWS Lambda function behind API Gateway. Deployment was blocked by a card verification failure during AWS account setup that could not be resolved within the submission window. CockroachDB's Distributed Vector Indexing and managed MCP Server are the tools actually exercised live in this submission.

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
COCKROACHDB_CONNECTION_STRING=your_connection_string_here
JWT_SECRET=a_random_secret_string
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

- "Route from Koramangala to Indiranagar, avoid highways"
- "Should I leave Electronic City for Whitefield at 7:30 AM or 9:15 AM?"
- "What's the traffic like from Silk Board to ORR at 8:45 AM?"

## Hackathon

Built for [CockroachDB × AWS: Build with Agentic Memory](https://cockroachdb-ai.devpost.com/) — deadline **August 18, 2026, 5:00 PM EDT**.

## Author

Mohammad Adnan Shakil — [GitHub](https://github.com/Mohammad-Adnan-Shakil)