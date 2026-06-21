import { resolveBackendUrl } from "./backend-url";

export type ChargeTier = { minutes: number; price: number };

export type ChargingStation = {
  station_id: string;
  name: string;
  location: string;
  rate_per_minute: number;
  currency: string;
  tiers: ChargeTier[];
  connector: string;
};

export type Wallet = {
  user_id: string;
  balance: number;
  currency: string;
  last_updated: string | null;
};

export type ChargingTransaction = {
  transaction_id: string;
  user_id: string;
  station_id: string;
  amount_paid: number;
  charging_duration_minutes: number;
  timestamp: string;
  status: string;
};

export type ActivationResult = {
  success: boolean;
  hardware_status: string;
  mode: "online" | "offline";
  station: ChargingStation;
  transaction: ChargingTransaction;
  wallet: Wallet;
  session_id: string;
  charging_session: {
    session_id: string;
    started_at: string | null;
    ends_at: string | null;
    duration_minutes: number;
    remaining_seconds: number;
    percent?: number;
    status?: string;
  };
};

export type ChargingSessionStatus = {
  session_id: string;
  user_id: string;
  station_id: string;
  status: "pending" | "charging" | "completed" | string;
  percent: number;
  remaining_seconds: number;
  duration_seconds: number;
  watts: number;
  hardware_status: string;
  started_at: string | null;
  ends_at: string | null;
};

export class OmniChargeError extends Error {
  status: number;
  detail: unknown;
  constructor(message: string, status: number, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function api(path: string): Promise<string> {
  const base = await resolveBackendUrl();
  return `${base}/api/v1/omnicharge${path}`;
}

async function parse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = (data && (data.detail ?? data)) as unknown;
    const message =
      typeof detail === "string"
        ? detail
        : (detail as { message?: string })?.message ?? `Request failed (${res.status})`;
    throw new OmniChargeError(message, res.status, detail);
  }
  return data as T;
}

export async function fetchStations(signal?: AbortSignal): Promise<ChargingStation[]> {
  const res = await fetch(await api("/stations"), { signal, cache: "no-store" });
  const data = await parse<{ stations: ChargingStation[] }>(res);
  return data.stations;
}

export async function fetchWallet(userId: string, signal?: AbortSignal): Promise<Wallet> {
  const res = await fetch(await api(`/wallet/${encodeURIComponent(userId)}`), {
    signal,
    cache: "no-store",
  });
  return parse<Wallet>(res);
}

export async function topUpWallet(userId: string, amount: number): Promise<Wallet> {
  const res = await fetch(await api("/wallet/topup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, amount }),
  });
  return parse<Wallet>(res);
}

export async function payAndActivate(params: {
  userId: string;
  stationId: string;
  requestedMinutes: number;
  localToken?: string;
}): Promise<ActivationResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (params.localToken) headers["X-Omni-Local-Token"] = params.localToken;
  const res = await fetch(await api("/pay-and-activate"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      user_id: params.userId,
      station_id: params.stationId,
      requested_minutes: params.requestedMinutes,
    }),
  });
  return parse<ActivationResult>(res);
}

export async function startChargingSession(sessionId: string): Promise<ChargingSessionStatus> {
  const res = await fetch(await api(`/session/${encodeURIComponent(sessionId)}/start`), {
    method: "POST",
  });
  return parse<ChargingSessionStatus>(res);
}

export async function fetchChargingSessionStatus(
  sessionId: string,
  signal?: AbortSignal,
): Promise<ChargingSessionStatus> {
  const res = await fetch(await api(`/session/${encodeURIComponent(sessionId)}/status`), {
    signal,
    cache: "no-store",
  });
  return parse<ChargingSessionStatus>(res);
}
