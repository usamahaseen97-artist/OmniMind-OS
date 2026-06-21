# Redis Shared Memory Layer

Shared cache boundary between:
- `gateway-go` (session/token lookups, realtime fanout state)
- `core-python` (conversation/profile/context cache, async jobs)
- `performance-rust` (vector and indicator hot state)

## Policy
- Active sessions and conversation chunks must be served from Redis first.
- MongoDB reads are fallback only when Redis misses.
- Service connections should use pooled clients and short I/O timeouts.

## Suggested local startup
```bash
docker run --name omnimind-redis -p 6379:6379 redis:7-alpine
```
