# OmniMind V11 Polyglot Microservices Blueprint

This scaffold establishes a production-ready split without breaking current app behavior.

## Service topology
- `gateway-go` (edge traffic + JWT + websocket sync)
- `core-python` (AI orchestration + multimodal + SaaS workflows)
- `performance-rust` (high-frequency compute + vector acceleration)
- `performance-cpp` (GPU/media performance bridge with async cloud fallback)
- `redis` shared cache/memory bus
- optional internal gRPC contract under `contracts/proto`

## Tool mapping
- Neural Chatbot (Tool 19): `core-python` context compression + multimodal pipeline
- Quantum Trading (Tool 17): Rust indicator math and vector fetch acceleration
- OmniMap / Theme streams (Tool 4/6 style workloads): Rust fast transforms
- Visionary / VFX / Architectural (Tools 8/9/10): C++ local GPU wrapper with >5s cloud failover
- Full API/web/mobile traffic: Go gateway on top of Python core

## Communication model
1. Client (web/mobile) -> `gateway-go`
2. Gateway validates JWT, forwards API to `core-python`, maintains `/ws/stream-preview`
3. Core dispatches heavy math/media to Rust/C++ workers over loopback gRPC/HTTP2
4. Redis used as first-read cache for active sessions and context chunks

## Migration sequence
1. Keep existing `backend` running (no breaking changes)
2. Start `gateway-go` in front of current Python backend
3. Move selected routers/services progressively from `backend` to `core-python`
4. Replace hot paths with Rust/C++ worker calls while preserving tool contracts
