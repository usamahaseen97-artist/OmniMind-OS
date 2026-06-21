"use client";

import {
  BatteryCharging,
  Bluetooth,
  CheckCircle2,
  Loader2,
  Nfc,
  Plus,
  Radio,
  Wallet,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchChargingSessionStatus,
  fetchStations,
  fetchWallet,
  OmniChargeError,
  payAndActivate,
  startChargingSession,
  topUpWallet,
  type ActivationResult,
  type ChargeTier,
  type ChargingSessionStatus,
  type ChargingStation,
  type Wallet as WalletType,
} from "../../lib/omnicharge-api";
import { cn } from "../../lib/utils";

type Phase = "idle" | "scanning" | "stations" | "charging";

function useUserId(): string {
  const [id] = useState(() => {
    if (typeof window === "undefined") return "omni-guest";
    const key = "omnimind_user_id";
    let value = window.localStorage.getItem(key);
    if (!value) {
      value = `omni_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(key, value);
    }
    return value;
  });
  return id;
}

function formatMoney(amount: number, currency: string): string {
  return `${currency === "PKR" ? "Rs " : ""}${amount.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}${currency !== "PKR" ? ` ${currency}` : ""}`;
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function OmniChargeView() {
  const userId = useUserId();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [selectedTier, setSelectedTier] = useState<ChargeTier | null>(null);
  const [activation, setActivation] = useState<ActivationResult | null>(null);
  const [sessionStatus, setSessionStatus] = useState<ChargingSessionStatus | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [chargePercent, setChargePercent] = useState(0);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const [toppingUp, setToppingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanTimer = useRef<number | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchWallet(userId, ctrl.signal).then(setWallet).catch(() => undefined);
    void fetchStations(ctrl.signal).then(setStations).catch(() => undefined);
    return () => ctrl.abort();
  }, [userId]);

  // Poll backend for real-time charge % (0 → 100).
  useEffect(() => {
    const sid = activation?.session_id;
    if (phase !== "charging" || !sid || sessionStatus?.status === "pending") return;

    const ctrl = new AbortController();
    const poll = () => {
      void fetchChargingSessionStatus(sid, ctrl.signal)
        .then((s) => {
          setSessionStatus(s);
          setChargePercent(s.percent);
          setRemaining(s.remaining_seconds);
        })
        .catch(() => undefined);
    };
    poll();
    const id = window.setInterval(poll, 800);
    return () => {
      ctrl.abort();
      window.clearInterval(id);
    };
  }, [phase, activation?.session_id, sessionStatus?.status]);

  useEffect(() => () => {
    if (scanTimer.current) window.clearTimeout(scanTimer.current);
  }, []);

  const startScan = useCallback(() => {
    setError(null);
    setPhase("scanning");
    scanTimer.current = window.setTimeout(() => {
      setPhase("stations");
      setSelectedStation((cur) => cur ?? stations[0] ?? null);
    }, 1900);
  }, [stations]);

  const handleTopUp = useCallback(
    async (amount: number) => {
      setToppingUp(true);
      setError(null);
      try {
        setWallet(await topUpWallet(userId, amount));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Top-up failed");
      } finally {
        setToppingUp(false);
      }
    },
    [userId],
  );

  const handlePay = useCallback(async () => {
    if (!selectedStation || !selectedTier) return;
    setBusy(true);
    setError(null);
    try {
      const result = await payAndActivate({
        userId,
        stationId: selectedStation.station_id,
        requestedMinutes: selectedTier.minutes,
      });
      setActivation(result);
      setWallet(result.wallet);
      setRemaining(result.charging_session.remaining_seconds);
      setChargePercent(0);
      setSessionStatus({
        session_id: result.session_id,
        user_id: userId,
        station_id: result.station.station_id,
        status: "pending",
        percent: 0,
        remaining_seconds: result.charging_session.remaining_seconds,
        duration_seconds: result.charging_session.remaining_seconds,
        watts: 0,
        hardware_status: "READY",
        started_at: null,
        ends_at: null,
      });
      setPhase("charging");
    } catch (err) {
      if (err instanceof OmniChargeError && err.status === 402) {
        setError("Insufficient balance — top up your wallet to charge.");
      } else {
        setError(err instanceof Error ? err.message : "Activation failed");
      }
    } finally {
      setBusy(false);
    }
  }, [selectedStation, selectedTier, userId]);

  const handleStartCharging = useCallback(async () => {
    const sid = activation?.session_id;
    if (!sid) return;
    setStarting(true);
    setError(null);
    try {
      const s = await startChargingSession(sid);
      setSessionStatus(s);
      setChargePercent(s.percent);
      setRemaining(s.remaining_seconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start charging");
    } finally {
      setStarting(false);
    }
  }, [activation?.session_id]);

  const reset = useCallback(() => {
    setPhase("idle");
    setActivation(null);
    setSessionStatus(null);
    setSelectedTier(null);
    setRemaining(0);
    setChargePercent(0);
    setError(null);
  }, []);

  const currency = wallet?.currency ?? "PKR";
  const sessionProgress = chargePercent;
  const isChargingActive = sessionStatus?.status === "charging";
  const isPendingStart = sessionStatus?.status === "pending";

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#070A12] text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.10),transparent_55%)]" />

      {/* Header + wallet */}
      <header className="relative z-10 shrink-0 border-b border-cyan-500/10 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-black shadow-[0_0_24px_rgba(34,211,238,0.5)]">
              <Zap className="h-5 w-5 fill-current" />
            </span>
            <div>
              <h1 className="text-lg font-black tracking-tight">
                OmniCharge <span className="text-cyan-400">Link</span>
              </h1>
              <p className="text-[11px] text-zinc-500">Wireless energy · Wallet · BLE/NFC ready</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-[#0C111C]/80 px-4 py-2.5 backdrop-blur">
            <Wallet className="h-4 w-4 text-cyan-400" />
            <div className="mr-2">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Balance</p>
              <p className="text-base font-bold leading-tight text-white">
                {wallet ? formatMoney(wallet.balance, currency) : "—"}
              </p>
            </div>
            <button
              type="button"
              disabled={toppingUp}
              onClick={() => void handleTopUp(500)}
              className="flex items-center gap-1 rounded-lg bg-cyan-500/15 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/25 disabled:opacity-50"
            >
              {toppingUp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Top Up
            </button>
          </div>
        </div>
      </header>

      <div className="history-scroll-hover relative z-10 min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {error ? (
          <div className="mx-auto mb-4 max-w-2xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
            {error}
            <button
              type="button"
              onClick={() => void handleTopUp(1000)}
              className="ml-3 rounded bg-amber-400/20 px-2 py-0.5 text-xs font-semibold text-amber-100 hover:bg-amber-400/30"
            >
              + Add Rs 1000
            </button>
          </div>
        ) : null}

        {/* IDLE — connect */}
        {phase === "idle" ? (
          <div className="mx-auto flex max-w-md flex-col items-center pt-8 text-center">
            <div className="relative mb-8 flex h-44 w-44 items-center justify-center">
              <span className="absolute inset-0 rounded-full border border-cyan-500/20" />
              <span className="absolute inset-4 rounded-full border border-cyan-500/15" />
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/20 to-emerald-500/10 text-cyan-300">
                <BatteryCharging className="h-9 w-9" />
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">Ready to charge wirelessly</h2>
            <p className="mt-1.5 text-sm text-zinc-500">
              Scan for nearby Omni-Hubs over Bluetooth / NFC, pay from your wallet, and power up
              instantly.
            </p>
            <button
              type="button"
              onClick={startScan}
              className="group mt-7 flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-500 px-7 py-3.5 text-sm font-bold text-black shadow-[0_0_30px_rgba(34,211,238,0.4)] transition hover:shadow-[0_0_44px_rgba(34,211,238,0.6)]"
            >
              <Bluetooth className="h-4 w-4" />
              Start · Connect &amp; Power Up
            </button>
          </div>
        ) : null}

        {/* SCANNING */}
        {phase === "scanning" ? (
          <div className="mx-auto flex max-w-md flex-col items-center pt-12 text-center">
            <div className="relative flex h-48 w-48 items-center justify-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="absolute inline-flex h-full w-full animate-ping rounded-full border border-cyan-400/40"
                  style={{ animationDelay: `${i * 0.5}s`, animationDuration: "1.8s" }}
                />
              ))}
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
                <Radio className="h-8 w-8 animate-pulse" />
              </span>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Nfc className="h-4 w-4" /> Scanning for nearby Omni-Hubs…
            </p>
          </div>
        ) : null}

        {/* STATIONS + price selector */}
        {phase === "stations" ? (
          <div className="mx-auto max-w-3xl">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              {stations.length} Omni-Hub{stations.length === 1 ? "" : "s"} found nearby
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {stations.map((station) => (
                <button
                  key={station.station_id}
                  type="button"
                  onClick={() => {
                    setSelectedStation(station);
                    setSelectedTier(null);
                  }}
                  className={cn(
                    "rounded-2xl border bg-[#0C111C]/80 p-4 text-left transition",
                    selectedStation?.station_id === station.station_id
                      ? "border-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.25)]"
                      : "border-white/10 hover:border-cyan-500/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Zap className="h-5 w-5 text-cyan-400" />
                    <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      online
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold text-white">{station.name}</p>
                  <p className="text-[11px] text-zinc-500">{station.location}</p>
                  <p className="mt-1 text-[11px] text-cyan-300/80">{station.connector}</p>
                </button>
              ))}
            </div>

            {selectedStation ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0C111C]/60 p-5">
                <p className="mb-3 text-sm font-semibold text-zinc-200">
                  Select charging time · <span className="text-cyan-400">{selectedStation.name}</span>
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {selectedStation.tiers.map((tier) => (
                    <button
                      key={tier.minutes}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      className={cn(
                        "rounded-xl border p-3 text-center transition",
                        selectedTier?.minutes === tier.minutes
                          ? "border-cyan-400 bg-cyan-500/10"
                          : "border-white/10 hover:border-cyan-500/40",
                      )}
                    >
                      <p className="text-lg font-black text-white">{tier.minutes}</p>
                      <p className="text-[10px] uppercase tracking-wide text-zinc-500">minutes</p>
                      <p className="mt-1 text-sm font-bold text-cyan-300">
                        {formatMoney(tier.price, selectedStation.currency)}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400 transition hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedTier || busy}
                    onClick={() => void handlePay()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-500 px-6 py-2.5 text-sm font-bold text-black shadow-[0_0_24px_rgba(34,211,238,0.4)] transition hover:shadow-[0_0_36px_rgba(34,211,238,0.6)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
                    {selectedTier
                      ? `Pay ${formatMoney(selectedTier.price, selectedStation.currency)} & Charge`
                      : "Pay & Charge"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* CHARGING — energy wave + countdown */}
        {phase === "charging" && activation ? (
          <div className="mx-auto flex max-w-md flex-col items-center pt-6 text-center">
            <div className="relative flex h-56 w-56 items-center justify-center">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full border",
                    isChargingActive ? "animate-ping border-cyan-400/40" : "border-zinc-700",
                  )}
                  style={{ animationDelay: `${i * 0.45}s`, animationDuration: "2s" }}
                />
              ))}
              <span
                className={cn(
                  "relative flex h-32 w-32 flex-col items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-500/20 text-cyan-200",
                  isChargingActive && "shadow-[0_0_50px_rgba(34,211,238,0.55)]",
                )}
              >
                <BatteryCharging className={cn("h-10 w-10", isChargingActive && "animate-pulse")} />
                <span className="mt-1 text-3xl font-black tabular-nums text-white">
                  {Math.round(sessionProgress)}%
                </span>
              </span>
            </div>

            {isPendingStart ? (
              <button
                type="button"
                disabled={starting}
                onClick={() => void handleStartCharging()}
                className="mt-6 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-500 px-8 py-3.5 text-sm font-bold text-black shadow-[0_0_30px_rgba(34,211,238,0.45)] disabled:opacity-50"
              >
                {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
                Start
              </button>
            ) : null}

            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
              {(sessionStatus?.hardware_status ?? activation.hardware_status).replace(/_/g, " ")}
              {activation.mode === "offline" ? " · offline" : ""}
              {sessionStatus?.watts ? ` · ${sessionStatus.watts}W` : ""}
            </p>
            <p className="mt-2 font-mono text-4xl font-black tabular-nums text-white">
              {formatClock(remaining)}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {isChargingActive
                ? "Charging on "
                : sessionStatus?.status === "completed"
                  ? "Session complete · "
                  : "Ready on "}
              <span className="text-cyan-300">{activation.station.name}</span>
            </p>

            <div className="mt-5 h-3 w-full max-w-xs overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-500 ease-linear"
                style={{ width: `${Math.min(100, sessionProgress)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-600">Battery level · synced from backend</p>

            <div className="mt-6 w-full max-w-xs rounded-xl border border-white/10 bg-[#0C111C]/60 p-3 text-left text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Transaction</span>
                <span className="font-mono text-zinc-300">{activation.transaction.transaction_id}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Paid</span>
                <span className="text-cyan-300">
                  {formatMoney(activation.transaction.amount_paid, activation.station.currency)}
                </span>
              </div>
              <div className="mt-1 flex justify-between">
                <span>Wallet balance</span>
                <span className="text-zinc-200">
                  {formatMoney(activation.wallet.balance, activation.wallet.currency)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-xl border border-cyan-500/30 px-6 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
            >
              {remaining > 0 ? "Charge another device" : "Done"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
