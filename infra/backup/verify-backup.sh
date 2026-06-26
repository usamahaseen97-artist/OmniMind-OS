#!/usr/bin/env bash
# Verify latest backup integrity (Sprint 5)
set -euo pipefail

BACKUP_DIR="${1:-./backups/mongodb}"
LATEST=$(ls -t "$BACKUP_DIR"/*.gz 2>/dev/null | head -1)

if [[ -z "$LATEST" ]]; then
  echo "No MongoDB backups found in $BACKUP_DIR"
  exit 1
fi

echo "Verifying $LATEST"
mongorestore --archive="$LATEST" --gzip --dryRun

echo "Backup verification passed"
