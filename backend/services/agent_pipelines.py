"""Agent pipeline compute modules (analytics, devops verify, medical) — isolated from chat/SSE."""

from __future__ import annotations

import asyncio
import hashlib
import math
import re
from typing import Any


def _python_compute_revenue(series: list[float]) -> dict[str, Any]:
    """Simulates a local Python analytics module (moving average + forecast)."""
    if not series:
        series = [12.0, 18.0, 22.0, 28.0, 31.0, 36.0, 40.0, 44.0, 48.0, 52.0]
    n = len(series)
    window = min(3, n)
    ma = sum(series[-window:]) / window
    growth = (series[-1] - series[0]) / max(series[0], 1.0) if n > 1 else 0.05
    forecast = [round(ma * (1 + 0.08 * (i + 1)), 2) for i in range(6)]
    revenue_next_q = round(ma * (1 + growth) * 1.12, 2)
    normalized = [round(v / max(series) * 100, 1) for v in series]
    return {
        "module": "omnimind_analytics_py",
        "input_points": n,
        "moving_average": round(ma, 2),
        "growth_rate_pct": round(growth * 100, 2),
        "revenue_prediction_next_quarter": revenue_next_q,
        "forecast_series": forecast,
        "chart_series": normalized,
        "bar_series": [round(v * 0.85 + 10, 1) for v in normalized],
    }


async def run_analytics_compute(data: list[float]) -> dict[str, Any]:
    await asyncio.sleep(0.35)
    clean = [float(x) for x in data if isinstance(x, (int, float)) and math.isfinite(float(x))]
    result = _python_compute_revenue(clean)
    return {"ok": True, "compute": result}


async def verify_database_connection(
    *,
    uri: str,
    username: str,
    password: str,
    port: str,
) -> dict[str, Any]:
    await asyncio.sleep(1.2)
    uri_ok = uri.strip().startswith(("mongodb://", "mongodb+srv://"))
    port_ok = port.strip().isdigit()
    cred_ok = len(username.strip()) > 0 and len(password) >= 4
    success = uri_ok and port_ok and cred_ok
    fingerprint = hashlib.sha256(f"{uri}:{username}:{port}".encode()).hexdigest()[:12]
    return {
        "ok": success,
        "status": "handshake_complete" if success else "verification_failed",
        "message": (
            "Pipeline handshake OK — Motor pool ready (simulated)."
            if success
            else "Invalid URI, port, or credentials format."
        ),
        "pipeline_id": f"db-{fingerprint}",
        "latency_ms": 1180,
    }


async def run_medical_diagnostic(
    *,
    symptom_text: str,
    file_names: list[str],
    scan_mode: str,
) -> dict[str, Any]:
    await asyncio.sleep(0.9)
    text = (symptom_text or "").lower()
    severity = "low"
    if any(w in text for w in ("severe", "acute", "emergency", "critical")):
        severity = "high"
    elif any(w in text for w in ("pain", "fever", "infection", "fracture")):
        severity = "moderate"
    elif file_names:
        severity = "moderate"

    indicators = []
    if file_names:
        indicators.extend([f"Attachment: {n}" for n in file_names[:5]])
    if text:
        tokens = re.findall(r"[a-zA-Z]{4,}", text)[:6]
        indicators.extend([f"Symptom token: {t}" for t in tokens])
    if not indicators:
        indicators = ["No acute markers in supplied context (mock scan)"]

    ailments = {
        "low": "Mild inflammation / stress response (mock)",
        "moderate": "Localized infection or musculoskeletal strain (mock)",
        "high": "Requires urgent clinical review — do not rely on AI alone (mock)",
    }

    solutions = [
        "Hydration + rest protocol (mock advisory)",
        "Follow-up labs: CBC, CRP within 48h",
        "Consult licensed physician before any medication",
    ]
    if severity == "high":
        solutions.insert(0, "Seek emergency care if symptoms worsen (mock)")

    medicines = [
        "Paracetamol 500mg — only if prescribed (mock)",
        "Electrolyte replenishment (OTC guidance mock)",
    ]

    return {
        "ok": True,
        "scan_mode": scan_mode,
        "analyzed_indicators": indicators,
        "predicted_ailment": ailments[severity],
        "severity": severity,
        "recommended_solutions": solutions,
        "recommended_medicines": medicines,
        "disclaimer": "Mock diagnostic schema — not medical advice.",
    }
