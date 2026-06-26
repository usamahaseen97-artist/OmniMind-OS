# Installation

Install OmniMind OS from a clean environment. Verified targets: **Windows 10/11**, **Ubuntu 22.04+**, **macOS 14+**.

---

## Prerequisites

| Tool | Version | Verify |
|------|---------|--------|
| Python | 3.11 – 3.13 | `python --version` |
| Node.js | 20 LTS | `node --version` |
| npm | 10+ | `npm --version` |
| Git | 2.40+ | `git --version` |
| Docker | 24+ (optional) | `docker --version` |

Optional for live AI completions:

- [LM Studio](https://lmstudio.ai/) on port `1234`, or
- Cloud API keys (Gemini, OpenAI, Groq) in `backend/.env`

---

## 1. Clone repository

```bash
git clone https://github.com/omnimind/omnimind.git
cd omnimind
```

---

## 2. Backend setup

```bash
cd backend
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Environment
cp .env.example .env
# Edit .env — at minimum for local dev:
#   JWT_SECRET_KEY=<random-32+-char-string>
#   REDIS_ENABLED=false
#   OMNIMIND_ENV=development
```

### Start API server

```bash
# Linux / macOS
export REDIS_ENABLED=false
export JWT_SECRET_KEY=local-dev-secret-minimum-32-chars
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

```powershell
# Windows PowerShell
$env:REDIS_ENABLED = "false"
$env:JWT_SECRET_KEY = "local-dev-secret-minimum-32-chars"
python -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### Verify backend

```bash
curl http://127.0.0.1:8001/api/v1/platform/health
# Expected: {"ok":true,"service":"omnimind-platform","status":"healthy"}
```

---

## 3. Frontend setup

```bash
cd frontend
npm ci

# Environment
cat > .env.local << 'EOF'
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8001
OMNIMIND_BACKEND_URL=http://127.0.0.1:8001
EOF

npm run dev
```

Open **http://localhost:3000**

---

## 4. Windows quick start

```powershell
.\OMNIMIND-START.ps1
.\run-frontend.ps1
```

`OMNIMIND-START.ps1` installs Python deps, writes `frontend/.env.local`, and starts the backend.

---

## 5. Docker (optional)

```bash
# Minimal mesh — backend + Redis + nginx
docker compose up -d --build

# Full production stack
cp infra/env/staging.env.example .env
docker compose -f docker-compose.prod.yml up -d --build
```

Health: `curl http://localhost/api/v1/platform/health`

---

## 6. Run tests (verify install)

```bash
cd backend
pip install -r requirements.txt -r requirements-test.txt
pytest tests/ -q

cd ../frontend
npm run test
```

Expected: **75 backend tests pass**, **42 frontend tests pass**.

---

## 7. Compile check

```bash
python -m compileall -q backend
cd frontend && npm run typecheck
```

---

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for port conflicts, MongoDB, Redis, and build errors.

---

## Next steps

- [CONFIGURATION.md](CONFIGURATION.md) — full environment reference
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) — development workflow
- [API_REFERENCE.md](API_REFERENCE.md) — REST endpoints
