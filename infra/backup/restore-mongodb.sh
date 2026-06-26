#!/usr/bin/env bash
# Disaster recovery restore — MongoDB (Sprint 5)
set -euo pipefail

ARCHIVE="${1:?Usage: restore-mongodb.sh <archive.gz>}"
MONGODB_URI="${MONGODB_URI:?MONGODB_URI required}"

echo "Restoring from $ARCHIVE to $MONGODB_URI"
read -r -p "This will overwrite data. Continue? [y/N] " CONFIRM
[[ "$CONFIRM" == "y" ]] || exit 1

mongorestore --uri="$MONGODB_URI" --archive="$ARCHIVE" --gzip --drop
echo "Restore complete"
