#!/usr/bin/env bash
# Redis AOF/RDB backup (Sprint 5)
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups/redis}"
REDIS_HOST="${REDIS_HOST:-127.0.0.1}"
REDIS_PORT="${REDIS_PORT:-6379}"

mkdir -p "$BACKUP_DIR"
ARCHIVE="$BACKUP_DIR/omnimind-redis-$TIMESTAMP.rdb"

echo "Triggering Redis BGSAVE on $REDIS_HOST:$REDIS_PORT"
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" BGSAVE
sleep 5
redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$ARCHIVE"

echo "Redis backup: $ARCHIVE"
