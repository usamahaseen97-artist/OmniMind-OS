"""Bloomberg / market data API — Kafka/Spark wake on pipeline use when lazy-load is on."""

from __future__ import annotations

from typing import Annotated, Optional

from fastapi import APIRouter, Query
from pydantic import Field, field_validator

from config import get_settings
from schemas.strict import StrictModel
from services.bloomberg_client import BloombergClient, DEFAULT_SYMBOLS
from services.finance_pipeline import run_mock_financial_stream, spark_readiness
from services.streaming_orchestrator import service_status

router = APIRouter(prefix="/api/v1/finance", tags=["finance"])


class TestBloombergBody(StrictModel):
    symbols: list[str] = Field(
        default_factory=lambda: list(DEFAULT_SYMBOLS[:5]),
        min_length=1,
        max_length=20,
    )
    stream_batches: int = Field(default=3, ge=1, le=10)
    history_days: int = Field(default=14, ge=5, le=90)

    @field_validator("symbols")
    @classmethod
    def validate_symbols(cls, v: list[str]) -> list[str]:
        cleaned = [s.strip() for s in v if s and s.strip()]
        if not cleaned:
            raise ValueError("at least one valid symbol required")
        return cleaned


@router.get("/health")
async def finance_health():
    settings = get_settings()
    return {
        "bloomberg_mode": settings.bloomberg_mode,
        "kafka_finance_topic": settings.kafka_finance_topic,
        "spark": await spark_readiness(),
        "kafka_docker": service_status("kafka"),
        "spark_docker": service_status("spark"),
        "on_demand": settings.streaming_lazy_load,
    }


@router.get("/snapshot")
async def bloomberg_snapshot(
    symbols: Annotated[Optional[str], Query(max_length=512)] = None,
):
    sym_list = [s.strip() for s in symbols.split(",")] if symbols else None
    client = BloombergClient(mode=get_settings().bloomberg_mode, symbols=sym_list)
    return client.fetch_snapshot().to_dict()


@router.post("/test-bloomberg")
async def test_bloomberg_post(body: TestBloombergBody):
    return await run_mock_financial_stream(
        symbols=body.symbols,
        stream_batches=body.stream_batches,
        history_days=body.history_days,
    )


@router.get("/test-bloomberg")
async def test_bloomberg_get(
    stream_batches: Annotated[int, Query(ge=1, le=10)] = 3,
):
    return await run_mock_financial_stream(stream_batches=stream_batches)


@router.get("/signals")
async def finance_signals(
    symbols: Annotated[Optional[str], Query(max_length=512)] = None,
):
    """CCXT live or mock market signals — used by quantum-trading health map."""
    from services.ccxt_market import fetch_market_signals

    sym_list = [s.strip() for s in symbols.split(",")] if symbols else None
    return await fetch_market_signals(sym_list)
