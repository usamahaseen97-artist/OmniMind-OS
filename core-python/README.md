# core-python

Python Core AI Engine for OmniMind V11.

## Responsibilities
- FastAPI orchestration for the 19 tools
- LangChain-style routing and tool planner boundaries
- Multi-modal file ingestion pipeline for Neural Chatbot
- Async context compression/truncation for large file uploads
- SaaS automation workflows and webhook dispatching

## Migration strategy
- Existing runtime backend remains in `../backend`
- New module composes and progressively absorbs routers/services from `backend`
- Gateway traffic should terminate at `gateway-go` and forward to this module

## Run
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

## Free / open-source provider pipeline
- Set `GITHUB_TOKEN` in `backend/.env` (PAT with `models:read` scope).
- Optional: `GITHUB_MODELS_DEFAULT=meta-llama/llama-3.3-70b-instruct`, `GITHUB_MODELS_CODER=qwen/qwen2.5-coder-32b-instruct`
- Endpoints: `GET /api/v1/providers/status`, `POST /api/v1/providers/chat`, `POST /api/v1/providers/chat/free`
- Community API directory syncs hourly from public GitHub aggregate lists.
