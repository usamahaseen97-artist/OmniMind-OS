"""
OmniMind V11 — Medical Diagnostic Intelligence Core (CV inference + manual slider sync).
"""

from __future__ import annotations

import hashlib
import math
import uuid
from datetime import datetime, timezone
from typing import Any, Literal

StreamSource = Literal["camera", "upload"]
FileType = Literal["dicom", "video", "image"]

_sessions: dict[str, dict[str, Any]] = {}

_DEFAULT_SETTINGS = {
    "sensitivity": 0.72,
    "contrast": 1.0,
    "vascular_isolation": 0.35,
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _session_id() -> str:
    return str(uuid.uuid4())


def get_or_create_session(session_id: str | None = None) -> str:
    sid = session_id or _session_id()
    if sid not in _sessions:
        _sessions[sid] = {
            "session_id": sid,
            "manual_settings": dict(_DEFAULT_SETTINGS),
            "frame_index": 0,
            "anomalies": [],
            "updated_at": _now(),
        }
    return sid


def _seed_anomalies(
    *,
    sensitivity: float,
    contrast: float,
    frame_index: int,
    file_type: FileType,
) -> list[dict[str, Any]]:
    """Deterministic mock CV — scales with sensitivity and frame index."""
    base_conf = min(0.99, 0.55 + sensitivity * 0.4)
    drift = (frame_index % 12) * 2
    catalog = [
        {"label": "Pulmonary Nodule", "coordinates": [120 + drift, 45, 30, 30]},
        {"label": "Bone Fracture Line", "coordinates": [80, 140 + drift, 55, 12]},
        {"label": "Tissue Density", "coordinates": [200, 90, 40, 40]},
    ]
    if file_type == "dicom":
        catalog.append({"label": "DICOM Slice Artifact", "coordinates": [160, 60, 24, 24]})
    count = max(1, int(round(sensitivity * len(catalog))))
    out: list[dict[str, Any]] = []
    for i, item in enumerate(catalog[:count]):
        conf = min(0.99, base_conf - i * 0.04 + contrast * 0.02)
        out.append(
            {
                "label": item["label"],
                "confidence": round(conf, 3),
                "coordinates": item["coordinates"],
            }
        )
    return out


def _mesh_url(session_id: str, file_type: FileType) -> str:
    digest = hashlib.sha1(f"{session_id}:{file_type}".encode()).hexdigest()[:10]
    organ = "brain" if file_type == "dicom" else "thorax"
    return f"/assets/generated_meshes/{organ}_scan_{digest}.obj"


def _clinical_summary(anomalies: list[dict[str, Any]], file_count: int) -> str:
    if not anomalies:
        return f"Pre-parsed automated insights based on {file_count} scan files context — no acute anomalies flagged at current sensitivity."
    labels = ", ".join(a["label"] for a in anomalies[:3])
    return (
        f"Pre-parsed automated insights based on {file_count} scan files context — "
        f"flagged: {labels}. Recommend radiologist confirmation."
    )


async def analyze_stream_payload(
    *,
    stream_source: StreamSource,
    file_type: FileType,
    manual_settings: dict[str, Any] | None = None,
    session_id: str | None = None,
    frame_index: int = 0,
    file_count: int = 1,
) -> dict[str, Any]:
    sid = get_or_create_session(session_id)
    session = _sessions[sid]
    settings = {**session.get("manual_settings", _DEFAULT_SETTINGS)}
    if manual_settings:
        for k in ("sensitivity", "contrast", "vascular_isolation"):
            if k in manual_settings:
                settings[k] = float(manual_settings[k])
    session["manual_settings"] = settings
    session["frame_index"] = frame_index
    session["file_type"] = file_type
    session["stream_source"] = stream_source

    sensitivity = float(settings.get("sensitivity", 0.72))
    contrast = float(settings.get("contrast", 1.0))
    vascular = float(settings.get("vascular_isolation", 0.35))

    anomalies = _seed_anomalies(
        sensitivity=sensitivity,
        contrast=contrast,
        frame_index=frame_index,
        file_type=file_type,
    )
    session["anomalies"] = anomalies
    session["updated_at"] = _now()

    return {
        "ok": True,
        "session_id": sid,
        "stream_source": stream_source,
        "file_type": file_type,
        "frame_index": frame_index,
        "manual_settings": settings,
        "filter_state": {
            "contrast": contrast,
            "sensitivity": sensitivity,
            "vascular_layer": vascular,
            "brightness": round(1.0 + (contrast - 1.0) * 0.15, 3),
        },
        "anomalies_detected": anomalies,
        "volumetric_3d_mesh_url": _mesh_url(sid, file_type),
        "clinical_summary_draft": _clinical_summary(anomalies, max(1, file_count)),
    }


def apply_manual_settings(session_id: str, manual_settings: dict[str, Any]) -> dict[str, Any]:
    sid = get_or_create_session(session_id)
    session = _sessions[sid]
    merged = {**session.get("manual_settings", _DEFAULT_SETTINGS), **manual_settings}
    session["manual_settings"] = merged
    session["updated_at"] = _now()
    frame = int(session.get("frame_index", 0))
    file_type: FileType = session.get("file_type", "image")
    return {
        "type": "settings_sync",
        "session_id": sid,
        "manual_settings": merged,
        "filter_state": {
            "contrast": float(merged.get("contrast", 1.0)),
            "sensitivity": float(merged.get("sensitivity", 0.72)),
            "vascular_layer": float(merged.get("vascular_isolation", 0.35)),
            "brightness": round(1.0 + (float(merged.get("contrast", 1.0)) - 1.0) * 0.15, 3),
        },
        "anomalies_detected": _seed_anomalies(
            sensitivity=float(merged.get("sensitivity", 0.72)),
            contrast=float(merged.get("contrast", 1.0)),
            frame_index=frame,
            file_type=file_type,
        ),
    }
