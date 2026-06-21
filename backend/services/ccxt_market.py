"""
CCXT market wrapper — live quotes when ccxt is installed, mock fallback otherwise.
Keeps trading tools off local Bloomberg mock-only paths when exchange data is available.
"""

from __future__ import annotations

import logging
import random
from typing import Any, Optional

logger = logging.getLogger(__name__)

_DEFAULT_SYMBOLS = ["BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT", "XRP/USDT"]


def _mock_ticker(symbol: str) -> dict[str, Any]:
    base = {"BTC/USDT": 64000, "ETH/USDT": 3400, "SOL/USDT": 145, "BNB/USDT": 580, "XRP/USDT": 0.62}.get(
        symbol, 100.0
    )
    change = round(random.uniform(-5.5, 5.5), 2)
    price = round(base * (1 + change / 100), 4)
    return {
        "symbol": symbol,
        "price": price,
        "change_pct": change,
        "volume": round(random.uniform(1e6, 5e7), 0),
        "source": "mock_ccxt",
    }


async def fetch_market_signals(
    symbols: Optional[list[str]] = None,
    *,
    exchange_id: str = "binance",
) -> dict[str, Any]:
    import asyncio

    sym_list = symbols or list(_DEFAULT_SYMBOLS)

    async def _fetch() -> dict[str, Any]:
        return await _fetch_market_signals_inner(sym_list, exchange_id=exchange_id)

    try:
        return await asyncio.wait_for(_fetch(), timeout=4.0)
    except asyncio.TimeoutError:
        logger.warning("CCXT fetch timed out — returning mock signals")
        ticks = [_mock_ticker(s) for s in sym_list[:10]]
        alerts = [t for t in ticks if abs(float(t.get("change_pct") or 0)) >= 3.0]
        return {
            "ok": True,
            "mode": "mock_ccxt_timeout",
            "exchange": exchange_id,
            "ticks": ticks,
            "volatility_alerts": alerts,
            "risk_score": 35.0,
            "investment_guidance": [
                {
                    "symbol": t["symbol"],
                    "action": "WATCH",
                    "price": t["price"],
                    "change_pct": t["change_pct"],
                    "note": "Live exchange fetch timed out — mock guidance active.",
                }
                for t in ticks[:3]
            ],
            "notification_hint": "Enable N8N_WEBHOOK_TRADING_ALERT in .env for push alerts.",
        }


async def _fetch_market_signals_inner(
    sym_list: list[str],
    *,
    exchange_id: str = "binance",
) -> dict[str, Any]:
    ticks: list[dict[str, Any]] = []
    mode = "mock"

    try:
        import ccxt.async_support as ccxt  # type: ignore

        exchange_cls = getattr(ccxt, exchange_id, None)
        if exchange_cls:
            exchange = exchange_cls({"enableRateLimit": True})
            try:
                for sym in sym_list[:10]:
                    try:
                        t = await exchange.fetch_ticker(sym)
                        last = float(t.get("last") or t.get("close") or 0)
                        pct = float(t.get("percentage") or 0)
                        ticks.append(
                            {
                                "symbol": sym,
                                "price": last,
                                "change_pct": round(pct, 2),
                                "volume": t.get("baseVolume"),
                                "source": exchange_id,
                            }
                        )
                    except Exception as exc:
                        logger.debug("CCXT ticker %s failed: %s", sym, exc)
                if ticks:
                    mode = "ccxt_live"
            finally:
                await exchange.close()
    except ImportError:
        logger.debug("ccxt not installed — using mock market signals")
    except Exception as exc:
        logger.warning("CCXT market fetch failed: %s", exc)

    if not ticks:
        ticks = [_mock_ticker(s) for s in sym_list[:10]]
        mode = "mock_ccxt"

    alerts = [t for t in ticks if abs(float(t.get("change_pct") or 0)) >= 3.0]
    risk_score = min(100, 20 + len(alerts) * 12 + sum(abs(t.get("change_pct", 0)) for t in alerts))

    recommendations = []
    for t in sorted(ticks, key=lambda x: abs(x.get("change_pct", 0)), reverse=True)[:3]:
        ch = float(t.get("change_pct") or 0)
        action = "WATCH" if abs(ch) < 2 else ("CONSIDER BUY" if ch > 2 else "REDUCE EXPOSURE / STOP-LOSS")
        recommendations.append(
            {
                "symbol": t["symbol"],
                "action": action,
                "price": t["price"],
                "change_pct": ch,
                "note": f"Automated guard: set stop if loss exceeds configured threshold.",
            }
        )

    return {
        "ok": True,
        "mode": mode,
        "exchange": exchange_id,
        "ticks": ticks,
        "volatility_alerts": alerts,
        "risk_score": round(risk_score, 1),
        "investment_guidance": recommendations,
        "notification_hint": "Enable N8N_WEBHOOK_TRADING_ALERT in .env for push alerts.",
    }
