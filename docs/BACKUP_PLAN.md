# OmniMind Production Sprint 5 — Backup Plan

**Date:** 2026-06-17  
**RPO Target:** 1 hour | **RTO Target:** 4 hours

---

## Backup Scope

| Asset | Method | Frequency | Retention |
|-------|--------|-----------|-----------|
| MongoDB (primary DB) | `mongodump` gzip archive | Hourly (prod) | 30 days |
| Redis (cache + queues) | RDB snapshot | Every 6 hours | 7 days |
| Projects / workspaces | MongoDB collections | Included in Mongo dump | 30 days |
| Object storage (S3) | S3 versioning + lifecycle | Continuous | 90 days |
| K8s manifests | Git (source of truth) | Every commit | Infinite |
| Container images | GHCR tags | Every release | 90 days |

---

## Scripts

Located in `infra/backup/`:

| Script | Purpose |
|--------|---------|
| `backup-mongodb.sh` | Versioned `mongodump` to `./backups/mongodb/` |
| `backup-redis.sh` | Redis RDB export |
| `verify-backup.sh` | `mongorestore --dryRun` integrity check |
| `restore-mongodb.sh` | Disaster recovery restore |

### MongoDB backup

```bash
export MONGODB_URI="mongodb+srv://..."
export BACKUP_DIR=/var/backups/omnimind/mongodb
./infra/backup/backup-mongodb.sh
```

### Redis backup

```bash
export REDIS_HOST=omnimind-cache
./infra/backup/backup-redis.sh
```

### Verify

```bash
./infra/backup/verify-backup.sh /var/backups/omnimind/mongodb
```

---

## Versioned Backup Naming

```
backups/mongodb/omnimind-mongo-20260617-143000.gz
backups/redis/omnimind-redis-20260617-143000.rdb
```

---

## Automated Schedule (Production)

### Cron (Linux)

```cron
# MongoDB hourly
0 * * * * MONGODB_URI=$MONGODB_URI /opt/omnimind/infra/backup/backup-mongodb.sh

# Redis every 6 hours
0 */6 * * * REDIS_HOST=omnimind-redis /opt/omnimind/infra/backup/backup-redis.sh

# Verify daily at 03:00 UTC
0 3 * * * /opt/omnimind/infra/backup/verify-backup.sh
```

### Kubernetes CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: omnimind-mongo-backup
  namespace: omnimind
spec:
  schedule: "0 * * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: mongo:7
              command: ["/bin/bash", "/scripts/backup-mongodb.sh"]
              envFrom:
                - secretRef:
                    name: omnimind-secrets
          restartPolicy: OnFailure
```

---

## Disaster Recovery Procedure

### Scenario: Database corruption

1. **Stop writes:** Scale backend to 0 or enable maintenance mode
2. **Identify backup:** Latest verified archive from `backups/mongodb/`
3. **Restore:** `./infra/backup/restore-mongodb.sh <archive.gz>`
4. **Verify:** Run pytest smoke + manual health check
5. **Resume:** Scale backend back up

### Scenario: Region failure

1. Deploy stack to secondary region from GHCR images
2. Restore MongoDB from cross-region backup (Atlas global cluster)
3. Update DNS / Ingress to secondary region
4. Validate Redis cold start (cache rebuild acceptable)

### Scenario: Redis loss

- **Impact:** Cache miss storm, queued jobs lost
- **Recovery:** Redeploy Redis from RDB; workers reconnect
- **Mitigation:** AOF persistence enabled in compose/K8s manifests

---

## Backup Verification

| Check | Command | Frequency |
|-------|---------|-----------|
| Archive integrity | `verify-backup.sh` | Daily |
| Restore drill | Staging restore monthly | Monthly |
| RTO measurement | Timed DR exercise | Quarterly |

---

## Offsite Storage

Upload archives to S3/GCS with lifecycle rules:

```bash
aws s3 sync ./backups/mongodb s3://omnimind-backups-prod/mongodb/ \
  --storage-class STANDARD_IA
```

Enable **object lock** / versioning for compliance retention.

---

## Project & Workspace Backup

Projects and workspaces persist in MongoDB (`omnicore` collections). Included in MongoDB dumps. For file attachments:

- S3 versioning on `omnimind-prod-assets` bucket
- Cross-region replication for DR

---

## Compliance Notes

- Backups must **exclude** raw JWT secrets (never in DB)
- PII fields follow retention policy from `COMPLIANCE_READINESS.md`
- Encrypt backups at rest (S3 SSE-KMS / Atlas encryption)
