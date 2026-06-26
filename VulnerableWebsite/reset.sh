#!/usr/bin/env bash
set -euo pipefail
echo "Resetting darklab ERP demo..."
docker compose down --remove-orphans
docker volume rm maodun-workshop_postgres_data 2>/dev/null || true
docker compose up -d --build
sleep 25
echo "Done — http://localhost"
