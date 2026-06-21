"""
OmniMind V11 — orchestrator entry point for Uvicorn.

Run from the backend folder (correct root):
    cd backend
    python omni_orchestrator.py

Or from project root (matches frontend on port 8001):
    .\\run-backend-8001.ps1

Correct uvicorn forms (from ``backend/``):
    uvicorn main:app --host 127.0.0.1 --port 8001
    uvicorn omni_orchestrator:app --host 127.0.0.1 --port 8001

Do NOT use ``uvicorn backend.main:app`` or ``backend.omni_orchestrator:app`` —
that causes ``ModuleNotFoundError: No module named 'backend'``.
"""

from __future__ import annotations

import os
import sys

# Ensure imports resolve when launched from project root via ``python backend/omni_orchestrator.py``.
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)
os.chdir(_BACKEND_DIR)

from main import app  # noqa: E402  — re-export for ``uvicorn omni_orchestrator:app``

if __name__ == "__main__":
    from runtime import freeze_support_windows, run_uvicorn

    os.environ.setdefault("HOST", "127.0.0.1")
    os.environ.setdefault("PORT", "8001")
    freeze_support_windows()
    run_uvicorn()
