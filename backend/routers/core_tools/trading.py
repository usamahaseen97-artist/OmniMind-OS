"""POST /api/v1/trading/* — Tool 7 Quantum Automated Trading Agent."""

from __future__ import annotations

from typing import Any, Literal, Optional

from fastapi import APIRouter
from pydantic import Field

from schemas.strict import StrictModel
from services.router_guard import isolated_tool_route
from services.tools.trading_tool import execute_trading, run_trading_agent

router = APIRouter(prefix="/api/v1/trading", tags=["trading"])


class TradingAgentBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    symbols: Optional[list[str]] = Field(default=None, max_length=20)
    stop_loss_pct: float = Field(default=5.0, ge=0.1, le=50)
    take_profit_pct: float = Field(default=12.0, ge=0.1, le=200)
    allocation_usd: float = Field(default=10000.0, ge=0)
    command: str = Field(default="", max_length=4000)


class TradingExecutionBody(StrictModel):
    user_id: str = Field(default="anonymous", max_length=128)
    symbols: Optional[list[str]] = Field(default=None, max_length=20)
    stop_loss_pct: float = Field(default=5.0, ge=0.1, le=50)
    take_profit_pct: float = Field(default=12.0, ge=0.1, le=200)
    allocation_usd: float = Field(default=10000.0, ge=0)
    command: str = Field(default="", max_length=4000)
    mode: Literal["MANUAL", "AUTONOMOUS"] = "MANUAL"
    brokerage_webhook: Optional[str] = Field(default=None, max_length=2048)


@router.post("/agent")
@isolated_tool_route(tool="quantum-trading")
async def trading_agent(body: TradingAgentBody) -> dict[str, Any]:
    return await run_trading_agent(
        user_id=body.user_id,
        symbols=body.symbols,
        stop_loss_pct=body.stop_loss_pct,
        take_profit_pct=body.take_profit_pct,
        allocation_usd=body.allocation_usd,
        command=body.command,
    )


@router.post("/execution")
@isolated_tool_route(tool="quantum-trading")
async def trading_execution(body: TradingExecutionBody) -> dict[str, Any]:
    return await execute_trading(
        user_id=body.user_id,
        symbols=body.symbols,
        stop_loss_pct=body.stop_loss_pct,
        take_profit_pct=body.take_profit_pct,
        allocation_usd=body.allocation_usd,
        command=body.command,
        mode=body.mode,
        brokerage_webhook=body.brokerage_webhook,
    )
