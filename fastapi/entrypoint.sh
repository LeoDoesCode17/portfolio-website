#!/usr/bin/env bash
set -e

cd /usr/src/fastapi

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting FastAPI using Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000