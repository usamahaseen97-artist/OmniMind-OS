# OmniMind OS

[![CI](https://img.shields.io/github/actions/workflow/status/omnimind/omnimind/ci.yml?branch=master&label=CI)](https://github.com/omnimind/omnimind/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/python-3.11%2B-blue)](https://www.python.org/)
[![Node](https://img.shields.io/badge/node-20%2B-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Docs](https://img.shields.io/badge/docs-enterprise-brightgreen)](docs/README.md)

**OmniMind OS** is an enterprise AI operating environment: a Next.js workspace shell, FastAPI platform backend, and OmniCore modules for automation, security, mission control, and cloud sync.

---

## Quick start

```bash
# Prerequisites: Python 3.11+, Node.js 20+, Git

git clone https://github.com/omnimind/omnimind.git
cd omnimind

# Backend
cd backend
python -m pip install -r requirements.txt
cp .env.example .env          # edit secrets locally — never commit
set REDIS_ENABLED=false         # Windows CMD
python -m uvicorn main:app --host 127.0.0.1 --port 8001

# Frontend (new terminal)
cd frontend
npm ci
cp ../.env.example .env.local   # or use OMNIMIND-START.ps1 on Windows
npm run dev
```

Open **http://localhost:3000**. API health: **http://127.0.0.1:8001/api/v1/platform/health**

Windows one-command startup: `.\OMNIMIND-START.ps1`

Full guide: [docs/INSTALLATION.md](docs/INSTALLATION.md)

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System layers, OmniCore platform, data flow |
| [Installation](docs/INSTALLATION.md) | Local setup from a clean environment |
| [Deployment](docs/DEPLOYMENT.md) | Docker, Kubernetes, CI/CD |
| [Configuration](docs/CONFIGURATION.md) | Environment variables and secrets |
| [API Reference](docs/API_REFERENCE.md) | Platform REST endpoints (293 routes) |
| [Security](docs/SECURITY.md) | Auth, RBAC, rate limits, compliance |
| [Developer Guide](docs/DEVELOPER_GUIDE.md) | Repo layout, workflows, testing |
| [Contributing](docs/CONTRIBUTING.md) | How to contribute |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common issues and fixes |
| [Release Notes](docs/RELEASE_NOTES.md) | V12 enterprise release |
| [License](docs/LICENSE.md) | License verification |

Index: [docs/README.md](docs/README.md)

---

## Repository layout

```
omnimind/
├── backend/          # FastAPI API (port 8001) — primary backend
├── frontend/         # Next.js 15 workspace UI
├── core_engine/      # Production Dockerfile for backend
├── docs/             # Enterprise documentation
├── infra/            # K8s, nginx, observability, env templates
├── .github/workflows # CI, Docker publish, deploy
└── docker-compose*.yml
```

> **Note:** `backend/` is the canonical API. `gateway-go/` and `core-python/` are auxiliary services.

---

## Verify your install

```bash
# Backend compile + tests
python -m compileall -q backend
cd backend && pip install -r requirements.txt -r requirements-test.txt
pytest tests/ -q

# Frontend
cd frontend && npm ci && npm run test && npm run build
```

---

## Protected systems

Do not redesign without explicit architecture approval:

- OmniForge Engine
- OmniForge Code Generation
- Architectural Designer Core

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) and [docs/LICENSE.md](docs/LICENSE.md).
