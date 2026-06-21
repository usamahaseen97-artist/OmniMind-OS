import { getBackendUrl } from "./backend-url";

export type TradingAgentResponse = {
  ok: boolean;
  job_id: string;
  assistant_reply?: string;
  volatility_alerts?: Array<{ symbol: string; change_pct: number; price: number }>;
  investment_guidance?: Array<{ symbol: string; action: string; note: string }>;
  risk_score?: number;
  ccxt_signals?: { mode?: string; ticks?: unknown[] };
};

export async function executeTrading(body?: {
  user_id?: string;
  symbols?: string[];
  stop_loss_pct?: number;
  take_profit_pct?: number;
  allocation_usd?: number;
  mode?: "MANUAL" | "AUTONOMOUS";
}): Promise<TradingAgentResponse & { execution_log?: string[] }> {
  const res = await fetch(`${getBackendUrl()}/api/v1/trading/execution`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: body?.user_id ?? "anonymous",
      symbols: body?.symbols ?? ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
      stop_loss_pct: body?.stop_loss_pct ?? 10,
      take_profit_pct: body?.take_profit_pct ?? 90,
      allocation_usd: body?.allocation_usd ?? 10000,
      command: "autopilot execute dummy test",
      mode: body?.mode ?? "AUTONOMOUS",
    }),
  });
  if (!res.ok) throw new Error(`trading execution failed (${res.status})`);
  return res.json() as Promise<TradingAgentResponse & { execution_log?: string[] }>;
}

export async function runTradingAgent(body?: {
  user_id?: string;
  symbols?: string[];
  stop_loss_pct?: number;
  take_profit_pct?: number;
  allocation_usd?: number;
}): Promise<TradingAgentResponse> {
  const res = await fetch(`${getBackendUrl()}/api/v1/trading/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: body?.user_id ?? "anonymous",
      symbols: body?.symbols ?? ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
      stop_loss_pct: body?.stop_loss_pct ?? 5,
      take_profit_pct: body?.take_profit_pct ?? 12,
      allocation_usd: body?.allocation_usd ?? 10000,
      command: "autopilot scan",
    }),
  });
  if (!res.ok) throw new Error(`trading agent failed (${res.status})`);
  return res.json() as Promise<TradingAgentResponse>;
}

export async function fetchMarketSignals(symbols?: string[]): Promise<Record<string, unknown>> {
  const q = symbols?.length ? `?symbols=${encodeURIComponent(symbols.join(","))}` : "";
  const res = await fetch(`${getBackendUrl()}/api/v1/finance/signals${q}`);
  if (!res.ok) throw new Error(`finance signals failed (${res.status})`);
  return res.json() as Promise<Record<string, unknown>>;
}
