#!/usr/bin/env bash
# Load build-time environment variables from pass.
# Usage: source env.sh
#
# Required before: npm run build, wrangler pages deploy

export VITE_API_BASE_URL=https://warehouse-api.kwasek.workers.dev
export VITE_API_TOKEN=$(pass Internet/warehouse/token/api-frontend)

echo "warehouse-web env loaded."
