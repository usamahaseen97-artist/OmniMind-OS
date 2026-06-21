# OmniMind V11 — Complete Setup & Publish

## Quick start (Windows)

```powershell
cd "C:\Users\A.K Com\Desktop\omnimind 1"
.\OMNIMIND-START.ps1
cd frontend
npm run dev
```

Open **http://localhost:3000**

## Requirements

| Component | Required for chat? | How to start |
|-----------|-------------------|--------------|
| Backend API | Yes | `.\run-backend-8000.ps1` or `.\run-backend-8001.ps1` |
| Frontend | Yes | `cd frontend && npm run dev` |
| LM Studio | Recommended | Load model → Start Server → port **1234** |
| MongoDB Atlas | Optional | `MONGODB_URI` in `backend/.env` (else in-memory fallback) |
| Docker Desktop | Optional | `.\DOCKER-OMNIMIND.ps1` for Kafka + Spark |
| Gemini API | Optional | `GEMINI_API_KEY` in `backend/.env` (fallback if LM down) |

## API keys (`backend/.env`)

Set keys for tools you use. Restart backend after changes.

- `OPENAI_API_KEY` — LM Studio token (`sk-lm-...`)
- `LLM_PROVIDER=lm_studio` — use local Llama first
- `GEMINI_API_KEY` — cloud chat fallback
- `TAVILY_API_KEY` — web search in chat
- `MONGODB_URI` — persistent chat history
- Other keys — see System Modules in the app

## Test before publish

```powershell
.\TEST-OMNIMIND.ps1
cd frontend
npm run build
```

## Publish (Vercel + API host)

1. Deploy backend (Railway, Render, Fly.io) with `backend/.env` secrets.
2. Set frontend env:
   - `NEXT_PUBLIC_BACKEND_URL=https://your-api.example.com`
   - `OMNIMIND_BACKEND_URL` (server routes)
3. `npm run build` in `frontend/`
4. Deploy to Vercel; add CORS origin in backend `ALLOWED_ORIGINS`.

## Troubleshooting

- **Failed to fetch** — backend not running or wrong port; frontend auto-tries 8000/8001.
- **Gemini 429** — use LM Studio or wait; app falls back to local LLM.
- **MongoDB** — in-memory mode works offline; fix `MONGODB_URI` for Atlas.
- **Kafka/Spark** — only for streaming modules; run `.\DOCKER-OMNIMIND.ps1`.
