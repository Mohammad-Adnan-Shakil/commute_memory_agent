# Commute Memory Agent — Backend API
# Standardized runtime for the FastAPI + Google ADK agent backend.

FROM python:3.12-slim

WORKDIR /app

# System dependencies (if any C-extension packages in requirements.txt need build tools,
# uncomment the next block — currently not needed for this project's dependency set)
# RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Install dependencies first (separate layer, so code changes don't invalidate the pip cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api.py .
COPY commute_agent/ ./commute_agent/
COPY aws_lambda/ ./aws_lambda/

# Render (and most PaaS providers) inject the PORT env var at runtime.
# Default to 8000 for local `docker run` testing.
ENV PORT=8000
EXPOSE 8000

# Shell form so $PORT is expanded correctly at container start
CMD uvicorn api:app --host 0.0.0.0 --port $PORT