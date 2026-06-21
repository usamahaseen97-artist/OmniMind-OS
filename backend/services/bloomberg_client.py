"""
Bloomberg market data connector (mock for dev; structured for blpapi swap-in).

Production: set BLOOMBERG_MODE=live and install blpapi when terminal access exists.
"""

from __future__ import annotations

import random
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Optional


class BloombergMode(str, Enum):
    MOCK = "mock"
    LIVE = "live"


@dataclass
class MarketTick:
    symbol: str
    price: float
    bid: float
    ask: float
    volume: int
    timestamp: str
    currency: str = "USD"
    exchange: str = "XNYS"


@dataclass
class FinancialIndicator:
    name: str
    value: float
    unit: str
    as_of: str


@dataclass
class HistoricalBar:
    symbol: str
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


@dataclass
class BloombergSnapshot:
    """Spark/Kafka-ingestible financial batch."""

    batch_id: str
    source: str
    mode: str
    generated_at: str
    symbols: list[str]
    ticks: list[dict[str, Any]] = field(default_factory=list)
    indicators: list[dict[str, Any]] = field(default_factory=list)
    history: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_spark_records(self) -> list[dict[str, Any]]:
        """Flatten ticks + history for DataFrame-style ingestion."""
        rows: list[dict[str, Any]] = []
        for t in self.ticks:
            rows.append({**t, "record_type": "tick", "batch_id": self.batch_id})
        for h in self.history:
            rows.append({**h, "record_type": "ohlcv", "batch_id": self.batch_id})
        return rows

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# Mock universe — replace with live BQL/ref data subscriptions in production
DEFAULT_SYMBOLS = [
    "AAPL US Equity",
    "MSFT US Equity",
    "GOOGL US Equity",
    "TSLA US Equity",
    "SPY US Equity",
    "EURUSD Curncy",
    "GC1 Comdty",
]


class MockBloombergClient:
    """Simulates Bloomberg real-time + reference data."""

    def __init__(self, symbols: Optional[list[str]] = None) -> None:
        self.symbols = symbols or list(DEFAULT_SYMBOLS)
        self._seed_prices = {s: random.uniform(20, 500) for s in self.symbols}

    def get_realtime_ticks(self, count_per_symbol: int = 1) -> list[MarketTick]:
        now = datetime.now(timezone.utc)
        ticks: list[MarketTick] = []
        for symbol in self.symbols:
            base = self._seed_prices[symbol]
            for i in range(count_per_symbol):
                drift = random.gauss(0, base * 0.002)
                price = round(max(0.01, base + drift), 4)
                self._seed_prices[symbol] = price
                spread = price * 0.0002
                ticks.append(
                    MarketTick(
                        symbol=symbol,
                        price=price,
                        bid=round(price - spread, 4),
                        ask=round(price + spread, 4),
                        volume=random.randint(10_000, 2_000_000),
                        timestamp=(now - timedelta(seconds=i)).isoformat(),
                    )
                )
        return ticks

    def get_indicators(self) -> list[FinancialIndicator]:
        now = datetime.now(timezone.utc).isoformat()
        return [
            FinancialIndicator("PE_RATIO", round(random.uniform(12, 35), 2), "x", now),
            FinancialIndicator("DIV_YIELD", round(random.uniform(0.5, 4.5), 2), "%", now),
            FinancialIndicator("BETA", round(random.uniform(0.6, 1.8), 2), "x", now),
            FinancialIndicator("RSI_14", round(random.uniform(25, 75), 2), "index", now),
            FinancialIndicator("MACD", round(random.uniform(-2, 2), 3), "pts", now),
            FinancialIndicator("IVOL_30D", round(random.uniform(10, 45), 2), "%", now),
        ]

    def get_historical_bars(self, days: int = 30) -> list[HistoricalBar]:
        bars: list[HistoricalBar] = []
        today = datetime.now(timezone.utc).date()
        for symbol in self.symbols:
            close = self._seed_prices[symbol]
            for d in range(days):
                dt = today - timedelta(days=days - d - 1)
                move = random.gauss(0, close * 0.015)
                o = close
                c = max(0.01, close + move)
                h = max(o, c) * (1 + random.uniform(0, 0.01))
                l = min(o, c) * (1 - random.uniform(0, 0.01))
                bars.append(
                    HistoricalBar(
                        symbol=symbol,
                        date=dt.isoformat(),
                        open=round(o, 4),
                        high=round(h, 4),
                        low=round(l, 4),
                        close=round(c, 4),
                        volume=random.randint(1_000_000, 50_000_000),
                    )
                )
                close = c
        return bars

    def build_snapshot(self, *, history_days: int = 14) -> BloombergSnapshot:
        ticks = self.get_realtime_ticks()
        indicators = self.get_indicators()
        history = self.get_historical_bars(days=history_days)
        return BloombergSnapshot(
            batch_id=str(uuid.uuid4()),
            source="bloomberg-mock",
            mode=BloombergMode.MOCK.value,
            generated_at=datetime.now(timezone.utc).isoformat(),
            symbols=self.symbols,
            ticks=[asdict(t) for t in ticks],
            indicators=[asdict(i) for i in indicators],
            history=[asdict(h) for h in history],
            metadata={
                "vendor": "OmniMind Mock Bloomberg",
                "schema": "omnimind.finance.v1",
                "spark_ingest": True,
            },
        )


class BloombergClient:
    """Facade — routes to mock or live (blpapi) implementation."""

    def __init__(self, mode: str = "mock", symbols: Optional[list[str]] = None) -> None:
        self.mode = BloombergMode(mode.lower()) if mode else BloombergMode.MOCK
        self._mock = MockBloombergClient(symbols)

    def fetch_snapshot(self, *, history_days: int = 14) -> BloombergSnapshot:
        if self.mode == BloombergMode.LIVE:
            return self._fetch_live_snapshot(history_days=history_days)
        return self._mock.build_snapshot(history_days=history_days)

    def stream_ticks(self, batches: int = 5) -> list[BloombergSnapshot]:
        """Simulate a short real-time stream (multiple snapshots)."""
        return [self._mock.build_snapshot(history_days=7) for _ in range(batches)]

    def _fetch_live_snapshot(self, *, history_days: int) -> BloombergSnapshot:
        try:
            import blpapi  # type: ignore  # noqa: F401
        except ImportError as exc:
            snap = self._mock.build_snapshot(history_days=history_days)
            snap.metadata["live_fallback"] = f"blpapi not installed: {exc}"
            snap.mode = "mock-fallback"
            return snap
        # Placeholder for real session/refdata requests
        snap = self._mock.build_snapshot(history_days=history_days)
        snap.source = "bloomberg-live-stub"
        snap.mode = BloombergMode.LIVE.value
        snap.metadata["note"] = "Wire blpapi refdata/subscription handlers here"
        return snap
