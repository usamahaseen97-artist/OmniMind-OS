"""Multi-agent pipeline API — separate from Sovereign chat stream."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.agent_pipelines import (
    run_analytics_compute,
    run_medical_diagnostic,
    verify_database_connection,
)

router = APIRouter(prefix="/api/agents", tags=["agent-pipelines"])


class AnalyticsComputeBody(StrictModel):
    data: list[float] = Field(default_factory=list, max_length=120)
    chart_type: Literal["line", "bar"] = "line"


@router.post("/analytics/compute")
async def analytics_compute(body: AnalyticsComputeBody):
    """Simulates Python revenue compute → chart-ready JSON."""
    result = await run_analytics_compute(body.data)
    result["chart_type"] = body.chart_type
    return result


class VerifyDatabaseBody(StrictModel):
    uri: str = Field(default="", max_length=512)
    username: str = Field(default="", max_length=128)
    password: str = Field(default="", max_length=256)
    port: str = Field(default="27017", max_length=8)


@router.post("/devops/verify-database")
async def devops_verify_database(body: VerifyDatabaseBody):
    return await verify_database_connection(
        uri=body.uri,
        username=body.username,
        password=body.password,
        port=body.port,
    )


class MedicalDiagnoseBody(StrictModel):
    symptom_text: str = Field(default="", max_length=8000)
    file_names: list[str] = Field(default_factory=list, max_length=20)
    scan_mode: Literal["report", "xray", "facial"] = "report"


@router.post("/medical/diagnose")
async def medical_diagnose(body: MedicalDiagnoseBody):
    return await run_medical_diagnostic(
        symptom_text=body.symptom_text,
        file_names=body.file_names,
        scan_mode=body.scan_mode,
    )


@router.post("/medical/triage")
async def medical_triage(body: MedicalDiagnoseBody):
    """Alias for tools_status health map."""
    return await medical_diagnose(body)


class TranslatorBridgeBody(StrictModel):
    mode: Literal["manual", "auto"] = "manual"
    source_lang: str = Field(default="auto", max_length=16)
    target_lang: str = Field(default="ur", max_length=16)
    audio_chunk_b64: str | None = Field(default=None, max_length=200_000)


@router.post("/translator/bridge")
async def translator_bridge(body: TranslatorBridgeBody):
    """Prepares front-end for streaming audio chunks (stub ack)."""
    return {
        "ok": True,
        "mode": body.mode,
        "source_lang": body.source_lang,
        "target_lang": body.target_lang,
        "buffer_received": bool(body.audio_chunk_b64),
        "ready_for_chunks": body.mode == "auto",
        "mapping": f"{body.source_lang} ⇄ {body.target_lang}",
    }
