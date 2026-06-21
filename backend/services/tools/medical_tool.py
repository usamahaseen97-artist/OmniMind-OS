"""Tool 6 — Autonomous Medical Diagnostic mock analytics."""

from __future__ import annotations

import base64
import logging
from typing import Any, Optional
from uuid import uuid4

from services.mongo_pools import save_module_record

logger = logging.getLogger(__name__)

_VACCINE_GUIDANCE = {
    "general": "Stay current on age-appropriate vaccines (flu, COVID-19, hepatitis B). Consult a licensed clinician for personalized schedules.",
    "travel": "Verify destination-specific vaccines 4–6 weeks before travel (typhoid, yellow fever where required).",
    "pediatric": "Follow national immunization schedule — MMR, polio, DPT per local health authority guidance.",
}

_PHARMA_KNOWLEDGE = {
    "glucose_elevated": "Metformin and lifestyle modification are common first-line approaches — prescription only via licensed physician.",
    "infection": "Antibiotics require culture/sensitivity testing — never self-prescribe.",
    "general": "Use WHO Essential Medicines list as reference; verify drug interactions with a pharmacist.",
}


def _decode_document_text(
    document_text: Optional[str],
    pdf_base64: Optional[str],
) -> str:
    text = (document_text or "").strip()
    if text:
        return text[:50000]
    if not pdf_base64:
        return ""
    try:
        raw = base64.b64decode(pdf_base64, validate=False)
        import io

        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(raw))
        pages = [p.extract_text() or "" for p in reader.pages[:12]]
        return "\n".join(pages)[:50000]
    except Exception:
        return ""


async def _vision_insights(image_base64: Optional[str]) -> list[dict[str, Any]]:
    if not image_base64:
        return []
    try:
        from config import get_settings

        settings = get_settings()
        if not settings.gemini_api_key:
            return [
                {
                    "type": "imaging_note",
                    "level": "info",
                    "note": "Image received — add GEMINI_API_KEY for cloud vision analysis.",
                }
            ]
        import httpx

        model = settings.gemini_model.strip() or "gemini-2.0-flash"
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.gemini_api_key}"
        body = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"inline_data": {"mime_type": "image/jpeg", "data": image_base64[:8_000_000]}},
                        {
                            "text": (
                                "Analyze this medical/clinical image or face scan. "
                                "List observable findings, possible concerns (non-diagnostic), "
                                "and recommended next steps. Include disclaimer."
                            )
                        },
                    ],
                }
            ],
            "generationConfig": {"maxOutputTokens": 1024},
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            res = await client.post(url, json=body)
            if res.status_code >= 400:
                return []
            data = res.json()
            text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            if text:
                return [{"type": "vision_analysis", "level": "review", "note": text[:2000]}]
    except Exception as exc:
        logger.debug("Medical vision skipped: %s", exc)
    return []

_NORMAL_RANGES = {
    "wbc": (4.5, 11.0, "K/µL"),
    "rbc": (4.5, 5.5, "M/µL"),
    "calcium": (8.5, 10.5, "mg/dL"),
    "glucose": (70, 99, "mg/dL"),
}


def _evaluate(name: str, value: float) -> dict[str, Any]:
    lo, hi, unit = _NORMAL_RANGES[name]
    ok = lo <= value <= hi
    severity = "normal"
    if not ok:
        severity = "review" if abs(value - (lo + hi) / 2) < (hi - lo) else "critical"
    return {
        "parameter": name.upper(),
        "value": value,
        "unit": unit,
        "normal_range": f"{lo}–{hi}",
        "status": "within_range" if ok else "out_of_range",
        "severity": severity,
    }


async def analyze_medical_payload(
    *,
    user_id: str = "anonymous",
    document_text: Optional[str] = None,
    pdf_base64: Optional[str] = None,
    image_base64: Optional[str] = None,
    mock_values: Optional[dict[str, float]] = None,
) -> dict[str, Any]:
    job_id = str(uuid4())
    inputs = []
    parsed_doc = _decode_document_text(document_text, pdf_base64)
    if parsed_doc:
        inputs.append("document_text")
        document_text = parsed_doc
    if pdf_base64:
        inputs.append("pdf")
    if image_base64:
        inputs.append("camera_frame")

    values = mock_values or {
        "wbc": 7.2,
        "rbc": 4.8,
        "calcium": 9.1,
        "glucose": 118.0,
    }

    metrics = [_evaluate(k, float(values[k])) for k in _NORMAL_RANGES if k in values]
    critical = [m for m in metrics if m["severity"] == "critical"]
    warnings = [m for m in metrics if m["severity"] == "review"]

    risk_flags = []
    if values.get("glucose", 0) > 126:
        risk_flags.append({"type": "hyperglycemia", "level": "moderate", "note": "Fasting glucose elevated — follow-up A1C recommended"})
    if values.get("wbc", 0) > 15:
        risk_flags.append({"type": "leukocytosis", "level": "high", "note": "WBC significantly elevated — infection or inflammation workup"})
    if any("tumor" in (document_text or "").lower() for _ in [0]):
        risk_flags.append({"type": "oncology_keyword", "level": "critical", "note": "Oncology terms detected in uploaded document — urgent specialist review"})

    vision_flags = await _vision_insights(image_base64)
    risk_flags.extend(vision_flags)

    vaccine_guidance = [_VACCINE_GUIDANCE["general"]]
    if "travel" in (document_text or "").lower():
        vaccine_guidance.append(_VACCINE_GUIDANCE["travel"])
    pharma_notes = [_PHARMA_KNOWLEDGE["general"]]
    if values.get("glucose", 0) > 126:
        pharma_notes.append(_PHARMA_KNOWLEDGE["glucose_elevated"])
    if values.get("wbc", 0) > 15:
        pharma_notes.append(_PHARMA_KNOWLEDGE["infection"])

    record = {
        "id": job_id,
        "user_id": user_id,
        "inputs": inputs,
        "metrics": metrics,
        "warnings": warnings,
        "critical": critical,
        "risk_flags": risk_flags,
    }
    await save_module_record("medical", record)
    logger.info("Medical analysis job=%s inputs=%s critical=%s", job_id, inputs, len(critical))

    return {
        "ok": True,
        "job_id": job_id,
        "inputs_received": inputs,
        "diagnostics_board": metrics,
        "warnings": warnings,
        "critical_alerts": critical + risk_flags,
        "vaccine_guidance": vaccine_guidance,
        "pharmaceutical_knowledge": pharma_notes,
        "summary": (
            "All parameters within clinical norms."
            if not warnings and not critical and not risk_flags
            else "Review suggested — see warnings and critical alerts."
        ),
        "disclaimer": "Mock analytics for development — not a substitute for licensed medical care.",
    }


_SPECIALIST_REGISTRY = [
    {
        "name": "Dr. Khan",
        "specialty": "Endocrinology",
        "city": "Karachi",
        "country": "Pakistan",
        "rating": 4.8,
        "map_pin": {"lat": 24.8607, "lng": 67.0011},
    },
    {
        "name": "Dr. Reyes",
        "specialty": "Hematology",
        "city": "Dubai",
        "country": "UAE",
        "rating": 4.7,
        "map_pin": {"lat": 25.2048, "lng": 55.2708},
    },
]

_ORGANIC_GUIDES = {
    "glucose": "Increase fiber intake, hydrate, reduce refined sugars, recheck fasting levels in 2 weeks.",
    "wbc": "Rest, hydration, monitor for fever — organic anti-inflammatory foods if clinically appropriate.",
    "general": "Balanced whole foods, sleep hygiene, stress reduction, follow-up labs with licensed provider.",
}


async def diagnose_medical(
    *,
    user_id: str = "anonymous",
    document_text: Optional[str] = None,
    pdf_base64: Optional[str] = None,
    image_base64: Optional[str] = None,
    video_stream_url: Optional[str] = None,
    mock_values: Optional[dict[str, float]] = None,
) -> dict[str, Any]:
    """Full diagnostic pipeline with referrals and organic remediation guides."""
    base = await analyze_medical_payload(
        user_id=user_id,
        document_text=document_text,
        pdf_base64=pdf_base64,
        image_base64=image_base64,
        mock_values=mock_values,
    )

    abnormal = [m for m in base.get("diagnostics_board", []) if m.get("status") != "within_range"]
    guides = []
    for m in abnormal:
        key = m.get("parameter", "").lower()
        param = "glucose" if "glucose" in key else "wbc" if "wbc" in key else "general"
        guides.append({"parameter": m.get("parameter"), "guide": _ORGANIC_GUIDES.get(param, _ORGANIC_GUIDES["general"])})

    specialists = _SPECIALIST_REGISTRY if abnormal or base.get("critical_alerts") else []

    if video_stream_url:
        base["inputs_received"] = list(base.get("inputs_received", [])) + ["live_video_stream"]

    return {
        **base,
        "pathology_warnings": base.get("critical_alerts", []) + base.get("warnings", []),
        "organic_remediation_guides": guides or [{"parameter": "ALL", "guide": _ORGANIC_GUIDES["general"]}],
        "specialist_referrals": specialists,
        "hospital_map_data": [s["map_pin"] for s in specialists],
    }
