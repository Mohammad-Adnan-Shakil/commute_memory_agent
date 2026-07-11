# Commute Memory Agent

A CockroachDB-backed fork of [bengaluru-commute-agent](https://github.com/Mohammad-Adnan-Shakil/bengaluru-commute-agent), built for the CockroachDB × AWS "Build with Agentic Memory" hackathon.

## What this is

A multi-agent Bengaluru commute planning system with persistent agentic memory — the agent remembers past route queries, tracks user preferences via vector embeddings, and logs recommendation outcomes for accuracy tracking over time.

Built on Google ADK, with the LLM backend swapped from Gemini to OpenRouter for cost-free, higher-reliability tool calling.

## Architecture
