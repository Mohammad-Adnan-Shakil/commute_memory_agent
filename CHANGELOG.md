# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added (planned)
- CockroachDB cluster provisioning
- CockroachDB MCP Server live connection
- Live vector search for route preference recall
- AWS Lambda deployed to AWS (production)
- Expanded corridor database beyond 4 corridors
- Live traffic data integration

## [1.0.0] — 2026-07-23

### Added
- Forked from [bengaluru-commute-agent](https://github.com/Mohammad-Adnan-Shakil/bengaluru-commute-agent) for CockroachDB × AWS hackathon
- Multi-agent architecture: orchestrator, route_agent, advisor_agent
- Google ADK with LiteLlm wrapper for OpenRouter/Tencent Hy3 LLM
- GraphHopper Directions API for live routing (replaced OpenRouteService)
- Memory tools: `log_conversation_turn`, `store_route_preference`, `log_recommendation`, `recall_similar_routes`
- CockroachDB SQL templates for vector-enabled memory schema
- AWS Lambda handler (`aws_lambda/memory_handler.py`) with IAM least-privilege policies
- Local Lambda test harness and Secrets Manager integration pattern
- FastAPI backend with `/chat` endpoint and CORS support
- React 19 + Vite 8 + Tailwind v4 + Framer Motion frontend with route map
- Architecture-themed UI redesign with Logo component, particle background
- Previously Asked memory-recall UI feature
- Animated hero/chat UI wired to real backend logic
- Retry logic for intermittent API failures (403 from heigit, 429 from OpenRouter)
- Polyline decoding and structured distance/duration extraction
- Curated bottleneck knowledge base for 4 major Bengaluru corridors
- Departure time comparison tool for temporal reasoning
- Dockerfile and .dockerignore for containerized deployment
- Full pytest suite (18 tests) for memory_handler and ors_tool

### Changed
- Switched LLM from Google Gemini 2.5 Flash-Lite to Tencent Hy3 via OpenRouter
- Replaced OpenRouteService routing with GraphHopper Directions API
- Migrated frontend from legacy components to Shadcn-style architecture-themed design
- Updated CORS configuration for deployed frontend URL
- Fixed requirements.txt to scope to project venv instead of global environment
- Improved bottleneck rendering with text fallback and case-consistent frontend display

### Fixed
- Distance/duration data flow uses structured fields instead of regex parsing
- Agent no longer claims route failure when `get_route` succeeds
- Map fitBounds rendering with Bengaluru center fallback
- Stale Gemini 503 retry logic now catches OpenRouter 429 rate limits
- Scroll behavior on EmptyState component for small screens
- .env loading from correct path relative to ors_tool.py
- Duplicate tool calls in route_agent eliminated

### Security
- Added MIT License
- AWS Lambda IAM policies follow least-privilege principle
- CockroachDB credentials pattern uses AWS Secrets Manager

### DevOps
- Backend deployed on Render, Frontend deployed on Vercel
- Environment variable based API URL configuration
- Dockerfile for reproducible builds
