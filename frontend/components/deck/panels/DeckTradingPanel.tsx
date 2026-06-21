"use client";

import { Bell, Shield, TrendingUp, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deckChip, deckInput, deckPrimaryBtn } from "../../../lib/deck-interactive";
import {
  setTradingAutopilot,
  toggleTradingAutopilot,
  useDeckUi,
} from "../../../lib/deck-ui-store";
import { fetchMarketSignals, runTradingAgent } from "../../../lib/trading-api";
import { cn } from "../../../lib/utils";
import { DeckMicroLoader } from "../DeckMicroLoader";
import { DeckShell } from "../DeckShell";

const LIVE_TICKERS = [
  "[LIVE] Scanning Karachi Market Logs…",
  "Target: 90% Profit Lock Active",
  "Order book depth · PSX futures sync",
  "Risk guard: 10% stop-loss armed",
];

export function DeckTradingPanel() {
  const { tradingAutopilot } = useDeckUi();
  const [pushToken, setPushToken] = useState("");
  const [tickerIdx, setTickerIdx] = useState(0);
  const [chartBars, setChartBars] = useState([42, 55, 48, 62, 58, 71, 65, 78, 72, 85]);
  const [liveGuidance, setLiveGuidance] = useState<string>("Connect autopilot for CCXT signals");
  const [lastAlert, setLastAlert] = useState<string>("");

  const pushNotification = useCallback((title: string, body: string) => {
    setLastAlert(body);
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }, []);

  useEffect(() => {
    if (!tradingAutopilot) return;
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
    const tick = window.setInterval(() => {
      void runTradingAgent({ stop_loss_pct: 10, take_profit_pct: 90 })
        .then((r) => {
          setLiveGuidance(r.assistant_reply ?? "Trading agent active");
          const alert = r.volatility_alerts?.[0];
          if (alert) {
            pushNotification(
              "OmniMind Trading Alert",
              `${alert.symbol} moved ${alert.change_pct}% — review stop-loss.`,
            );
          }
          const guide = r.investment_guidance?.[0];
          if (guide?.action && guide.action !== "WATCH") {
            pushNotification("Investment Signal", `${guide.symbol}: ${guide.action}`);
          }
        })
        .catch(() => undefined);
      void fetchMarketSignals().catch(() => undefined);
    }, 12000);
    void runTradingAgent({ stop_loss_pct: 10, take_profit_pct: 90 })
      .then((r) => setLiveGuidance(r.assistant_reply ?? "Trading agent active"))
      .catch(() => undefined);
    return () => clearInterval(tick);
  }, [tradingAutopilot, pushNotification]);

  useEffect(() => {
    if (!tradingAutopilot) return;
    const tick = window.setInterval(() => {
      setTickerIdx((i) => (i + 1) % LIVE_TICKERS.length);
      setChartBars((bars) =>
        bars.map((b) => {
          const delta = (Math.random() - 0.42) * 12;
          return Math.max(18, Math.min(95, Math.round(b + delta)));
        }),
      );
    }, 900);
    return () => clearInterval(tick);
  }, [tradingAutopilot]);

  const activeTicker = LIVE_TICKERS[tickerIdx];
  const pathD = useMemo(() => {
    const w = 100;
    const h = 40;
    const step = w / (chartBars.length - 1);
    const pts = chartBars.map((v, i) => {
      const x = i * step;
      const y = h - (v / 100) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return pts.join(" ");
  }, [chartBars]);

  return (
    <DeckShell title="Quantum Trading" subtitle="Auto-pilot · live market simulation">
      <button
        type="button"
        onClick={() => toggleTradingAutopilot()}
        className={cn(
          deckPrimaryBtn,
          "justify-between px-3",
          tradingAutopilot && "border-[#00FF87]/60 bg-[#10B981]/20 shadow-[0_0_20px_rgba(0,255,135,0.12)]",
        )}
        aria-pressed={tradingAutopilot}
      >
        <span className="flex items-center gap-2 text-xs font-semibold">
          <Zap className={cn("h-4 w-4", tradingAutopilot && "animate-pulse")} />
          Auto-Pilot
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider",
            tradingAutopilot ? "bg-[#00FF87]/20 text-[#00FF87]" : "text-zinc-500",
          )}
        >
          {tradingAutopilot ? "ON" : "OFF"}
        </span>
      </button>

      {tradingAutopilot ? (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-[#00FF87]/40 bg-[#10B981]/10 px-2 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]" />
            <p className="animate-pulse text-[10px] font-mono font-semibold text-[#00FF87]">
              {activeTicker}
            </p>
          </div>
          <p className="text-[9px] text-zinc-500">{liveGuidance}</p>
          {lastAlert ? <p className="text-[9px] text-amber-400/90">{lastAlert}</p> : null}
          <DeckMicroLoader label="Live chart feed · Karachi session" pulse />
          <div className={cn(deckChip, "p-2")}>
            <svg viewBox="0 0 100 40" className="h-20 w-full" aria-label="Live trading chart">
              <defs>
                <linearGradient id="tradeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${pathD} L100,40 L0,40 Z`}
                fill="url(#tradeFill)"
                className="transition-all duration-500"
              />
              <path
                d={pathD}
                fill="none"
                stroke="#00FF87"
                strokeWidth="1.2"
                className="transition-all duration-500"
                style={{ filter: "drop-shadow(0 0 4px #00FF87)" }}
              />
            </svg>
          </div>
        </>
      ) : (
        <p className="text-[10px] text-zinc-600">
          Enable Auto-Pilot to stream simulated Karachi market logs and profit-lock targets.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTradingAutopilot(true)}
          className={cn(deckChip, "p-2 text-center transition-all hover:border-emerald-500/60")}
        >
          <TrendingUp className="mx-auto h-4 w-4 text-[#00FF87]" />
          <p className="text-lg font-bold text-[#00FF87]">90%</p>
          <p className="text-[9px] text-zinc-600">Reward / profit</p>
        </button>
        <button
          type="button"
          className={cn(deckChip, "p-2 text-center transition-all hover:border-emerald-500/60")}
        >
          <Shield className="mx-auto h-4 w-4 text-amber-400" />
          <p className="text-lg font-bold text-amber-400">10%</p>
          <p className="text-[9px] text-zinc-600">Risk stop-loss</p>
        </button>
      </div>

      <label className="block text-[9px] text-zinc-600">
        <Bell className="mb-1 inline h-3 w-3" /> Push notification trigger
        <input
          value={pushToken}
          onChange={(e) => setPushToken(e.target.value)}
          placeholder="device token / webhook URL"
          className={cn(deckInput, "mt-1")}
        />
      </label>
    </DeckShell>
  );
}
