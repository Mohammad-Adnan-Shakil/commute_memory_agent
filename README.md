# Commute Memory Agent

A CockroachDB-backed fork of [bengaluru-commute-agent](https://github.com/Mohammad-Adnan-Shakil/bengaluru-commute-agent), built for the CockroachDB × AWS "Build with Agentic Memory" hackathon.

## What this is

A multi-agent Bengaluru commute planning system with persistent agentic memory — the agent remembers past route queries, tracks user preferences via vector embeddings, and logs recommendation outcomes for accuracy tracking over time.

Built on Google ADK, with the LLM backend swapped from Gemini to OpenRouter for cost-free, higher-reliability tool calling.

## Architecture
commute_agent (orchestrator)
├── route_agent      → get_route, check_bottleneck, store_route_preference
└── advisor_agent     → compare_departure_times, log_recommendation

Strict separation of concerns: `route_agent` gathers raw data only (never recommends), `advisor_agent` synthesizes a decisive recommendation from that data.

## Stack

- **Agent framework:** Google ADK (Agent Development Kit)
- **LLM:** Tencent Hy3 (free tier) via OpenRouter, using ADK's `LiteLlm` wrapper
- **Routing:** OpenRouteService / api.heigit.org
- **Memory (in progress):** CockroachDB Cloud — conversation history, route preference embeddings (Distributed Vector Indexing), recommendation outcome tracking
- **Embeddings:** Ollama + `nomic-embed-text` (local, zero-cost)
- **Frontend:** React + Vite + Tailwind + React-Leaflet

## Status

- ✅ Base agent forked and working (route fetching, corridor bottleneck detection, departure-time comparison, recommendation synthesis)
- ✅ LLM backend swapped to OpenRouter (free tier), tool-calling verified
- ✅ Memory tool stubs in place (`log_conversation_turn`, `store_route_preference`, `log_recommendation`)
- ⬜ CockroachDB Cloud cluster provisioning
- ⬜ CockroachDB MCP Server connection
- ⬜ Live vector search for preference recall
- ⬜ AWS Lambda integration

## Setup

```bash
git clone <this-repo-url>
cd commute-memory-agent
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

Create a `.env` in the root with:
OPENROUTER_API_KEY=your_key_here
ORS_API_KEY=your_key_here

Run locally:
```bash
adk web
```

## Hackathon

Built for [CockroachDB × AWS: Build with Agentic Memory](https://cockroachdb-ai.devpost.com/) — deadline August 19, 2026.
