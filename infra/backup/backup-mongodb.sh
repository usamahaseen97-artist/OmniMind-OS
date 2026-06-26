#!/usr/bin/env bash
# MongoDB backup — versioned snapshots (Sprint 5)
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups/mongodb}"
MONGODB_URI="${MONGODB_URI:?MONGODB_URI required}"

mkdir -p "$BACKUP_DIR"
ARCHIVE="$BACKUP_DIR/omnimind-mongo-$TIMESTAMP.gz"

echo "Backing up MongoDB to $ARCHIVE"
mongodump --uri="$MONGODB_URI" --archive="$ARCHIVE" --gzip

echo "Backup complete: $ARCHIVE"
ls -lh "$ARCHIVE"
