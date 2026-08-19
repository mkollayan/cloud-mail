#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

DB_NAME="email"
R2_BUCKET="cloud-mail-backups"
OUT_DIR="backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
FILE_NAME="$DB_NAME-$TIMESTAMP.sql"
OUT_FILE="$OUT_DIR/$FILE_NAME"

mkdir -p "$OUT_DIR"

npx wrangler d1 export "$DB_NAME" --remote --output="$OUT_FILE"
npx wrangler r2 object put "$R2_BUCKET/$FILE_NAME" --file="$OUT_FILE" --remote

echo "Backup saved to mail-worker/$OUT_FILE and uploaded to r2://$R2_BUCKET/$FILE_NAME"
