# Architecture

## Component Breakdown

### Commute Agent (Orchestrator)
- **Role:** Root agent that delegates to route_agent and advisor_agent
- **Tech:** Google ADK + LiteLlm (OpenRouter/Tencent Hy3)
- **Location:** commute_agent/agent.py

### Route Agent
- **Role:** Data-gathering sub-agent for routing and congestion checks
- **Tech:** Google ADK sub-agent
- **Location:** commute_agent/sub_agents/route_agent.py

### Advisor Agent
- **Role:** Decision-making sub-agent for departure time comparison
- **Tech:** Google ADK sub-agent
- **Location:** commute_agent/sub_agents/advisor_agent.py

### Memory Tools
- **Role:** Agentic memory — stores route preferences, recalls similar routes
- **Tech:** CockroachDB (pending) via AWS Lambda
- **Location:** commute_agent/tools/memory_tool.py

### AWS Lambda Memory Handler
- **Role:** Serverless memory boundary layer (write/query)
- **Tech:** Python + AWS Lambda + CockroachDB SQL templates
- **Location:** aws_lambda/memory_handler.py

### FastAPI Backend
- **Role:** HTTP server with /chat endpoint
- **Tech:** FastAPI + Uvicorn
- **Location:** api.py

### React Frontend
- **Role:** Chat UI with route map, session history, architecture visualization
- **Tech:** React 19 + Vite 8 + Tailwind v4 + Framer Motion + Leaflet
- **Location:** frontend/src/

## Key Architectural Decisions

### Decision 1: OpenRouter/Tencent Hy3 over Google Gemini
**What:** Uses LiteLlm wrapper with OpenRouter to access Tencent Hy3 (free tier) instead of the original Gemini 2.5 Flash-Lite
**Why:** Hackathon requirement or free tier availability. OpenRouter provides unified API for multiple LLM providers through ADK's LiteLlm abstraction.
**Tradeoff:** Potential quality difference vs Gemini. Dependency on OpenRouter availability.

### Decision 2: CockroachDB + AWS Lambda for Agentic Memory
**What:** Memory stored in CockroachDB Cloud (distributed SQL with vector support), accessed via AWS Lambda boundary layer
**Why:** CockroachDB provides distributed vector indexing for multi-region agentic memory. AWS Lambda acts as secure boundary layer between agent and database.
**Tradeoff:** Memory feature still pending (stubs implemented). Lambda cold start adds latency to memory operations.

### Decision 3: GraphHopper over OpenRouteService
**What:** Uses GraphHopper Directions API for routing instead of original ORS
**Why:** Free tier availability for hackathon. GraphHopper provides similar driving directions with polyline decoding.
**Tradeoff:** Different API format. Slightly different route optimization.

## Data Flow
1. User submits query → FastAPI /chat → ADK runner invokes orchestrator
2. Orchestrator delegates to route_agent → get_route (GraphHopper) → check_bottleneck (curated data)
3. If memory tool available: store_route_preference or recall_similar_routes
4. If recommendation needed → advisor_agent → compare_departure_times
5. Response returned with route coordinates, congestion, and session history

## Known Limitations
- CockroachDB cluster not yet provisioned — memory tools are stubs
- AWS Lambda memory handler not yet deployed
- Only 4 known Bengaluru corridors in bottlenecks.json
- No persistent session memory across restarts

## Future Considerations
- Provision CockroachDB cluster and enable vector search
- Deploy AWS Lambda handler
- Expand corridor database
- Add live traffic data integration
