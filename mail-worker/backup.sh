#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

DB_NAME="email"
OUT_DIR="backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$OUT_DIR/$DB_NAME-$TIMESTAMP.sql"

mkdir -p "$OUT_DIR"

npx wrangler d1 export "$DB_NAME" --remote --output="$OUT_FILE"

echo "Backup saved to mail-worker/$OUT_FILE"
