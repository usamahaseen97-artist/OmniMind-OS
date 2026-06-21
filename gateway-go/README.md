# gateway-go

High-concurrency OmniMind edge gateway.

## Responsibilities
- Stateless JWT validation
- Web/mobile/API traffic ingress
- `/ws/stream-preview` multi-device sync hub
- Forward authenticated `/api/*` requests to Python core
- Shared Redis connectivity for session hot paths

## Run
```bash
go run ./cmd/gateway
```

## Environment
- `GATEWAY_PORT` (default `8080`)
- `CORE_PYTHON_URL` (default `http://127.0.0.1:8001`)
- `JWT_SECRET_KEY`
- `REDIS_ADDR` (default `127.0.0.1:6379`)

Provider routes (`/api/v1/providers/*`) proxy to core-python with `X-OmniForge-Free-Pipeline` header passthrough.
