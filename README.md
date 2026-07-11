# Commute Memory Agent

A CockroachDB-backed fork of [bengaluru-commute-agent](https://github.com/Mohammad-Adnan-Shakil/bengaluru-commute-agent), built for the CockroachDB × AWS "Build with Agentic Memory" hackathon.

An agentic AI system built with Google ADK that reasons about known Bengaluru traffic bottlenecks and helps decide when and how to travel — now with persistent agentic memory.

## What this is

A multi-agent Bengaluru commute planning system that remembers past route queries, tracks user preferences via vector embeddings, and logs recommendation outcomes for accuracy tracking over time.

## Architecture
commute_agent (orchestrator)
├── route_agent      → get_route, check_bottleneck, store_route_preference
└── advisor_agent    → compare_departure_times, log_recommendation

Strict separation of concerns: `route_agent` gathers raw data only (never recommends), `advisor_agent` synthesizes a decisive recommendation from that data. The orchestrator delegates based on query intent at inference time — not a fixed execution order.

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
git clone https://github.com/Mohammad-Adnan-Shakil/commute_memory_agent.git
cd commute_memory_agent
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create a `.env` in the root with:
OPENROUTER_API_KEY=your_key_here
ORS_API_KEY=your_key_here

Run locally:
```bash
adk web
```

## Example Queries

- "Route from Koramangala to Indiranagar"
- "Should I leave Electronic City for Whitefield at 7:30 AM or 9:15 AM?"
- "What's the traffic like from Silk Board to ORR at 8:45 AM?"

## Hackathon

Built for [CockroachDB × AWS: Build with Agentic Memory](https://cockroachdb-ai.devpost.com/) — deadline August 19, 2026.

## Author

Mohammad Adnan Shakil — [GitHub](https://github.com/Mohammad-Adnan-Shakil)
