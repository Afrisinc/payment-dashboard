#!/bin/sh
set -e

DIST_DIR="/usr/share/nginx/html"
ENV_FILE="$DIST_DIR/env-config.js"

echo "Injecting runtime environment variables..."

sed -i "s|__VITE_API_BASE_URL__|${VITE_API_BASE_URL:-__VITE_API_BASE_URL__}|g" "$ENV_FILE"
sed -i "s|__VITE_AUTH_UI_URL__|${VITE_AUTH_UI_URL:-__VITE_AUTH_UI_URL__}|g" "$ENV_FILE"

echo "Environment injection complete:"
cat "$ENV_FILE"

exec nginx -g "daemon off;"
