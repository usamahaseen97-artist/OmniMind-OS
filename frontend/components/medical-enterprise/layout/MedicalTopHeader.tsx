"use client";

import {
  AlertTriangle,
  Bell,
  Command,
  Mic,
  Radio,
  Search,
  User,
  Wifi,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { MEDICAL_DISCLAIMER } from "../../../lib/medical-enterprise/constants";
import { useMedicalEnterprise } from "../../../lib/medical-enterprise/context";

export function MedicalTopHeader({ hidden }: { hidden?: boolean } = {}) {
  const {
    emergencyMode,
    setEmergencyMode,
    globalSearch,
    setGlobalSearch,
    patientSearch,
    setPatientSearch,
    aiStatus,
    currentUser,
    devices,
    setCommandPaletteOpen,
    themeMode,
  } = useMedicalEnterprise();

  const connectedCount = devices.filter((d) => d.status === "connected").length;

  if (hidden) return null;

  return (
    <header
      className={cn(
        "medical-enterprise-header flex shrink-0 flex-col border-b",
        emergencyMode ? "border-red-500/50 bg-red-950/40" : "border-white/[0.06] bg-[#070b12]",
        themeMode === "light" && !emergencyMode && "border-slate-200 bg-white",
      )}
    >
      {emergencyMode ? (
        <div className="flex items-center gap-2 bg-red-600/20 px-3 py-1 text-[10px] font-medium text-red-200">
          <AlertTriangle size={12} aria-hidden />
          Emergency mode active — expedited workflows enabled
        </div>
      ) : null}

      <div className="flex h-11 items-center gap-2 px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative max-w-[200px] flex-1">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="search"
              placeholder="Global search…"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="h-7 w-full rounded border border-white/[0.08] bg-black/30 pl-7 pr-2 text-[10px] text-slate-200 outline-none focus:border-emerald-500/40"
              aria-label="Global search"
            />
          </div>
          <div className="relative max-w-[160px] flex-1">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden />
            <input
              type="search"
              placeholder="Patient search…"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="h-7 w-full rounded border border-white/[0.08] bg-black/30 pl-7 pr-2 text-[10px] text-slate-200 outline-none focus:border-emerald-500/40"
              aria-label="Patient search"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setEmergencyMode(!emergencyMode)}
          className={cn(
            "rounded px-2 py-1 text-[9px] font-semibold uppercase tracking-wide transition-colors",
            emergencyMode ? "bg-red-600 text-white" : "bg-white/[0.06] text-slate-400 hover:text-red-300",
          )}
        >
          Emergency
        </button>

        <span
          className={cn(
            "flex items-center gap-1 rounded px-2 py-1 text-[9px]",
            aiStatus === "online" ? "text-emerald-400" : "text-amber-400",
          )}
          title="AI engine status"
        >
          <Radio size={10} aria-hidden />
          AI {aiStatus}
        </span>

        <span className="flex items-center gap-1 text-[9px] text-slate-500" title="Connected devices">
          <Wifi size={10} aria-hidden />
          {connectedCount}/{devices.length}
        </span>

        <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-white/[0.06]" aria-label="Notifications">
          <Bell size={14} />
        </button>

        <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-white/[0.06]" aria-label="Voice assistant">
          <Mic size={14} />
        </button>

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1 rounded border border-white/[0.08] px-2 py-1 text-[9px] text-slate-400 hover:bg-white/[0.06]"
        >
          <Command size={10} aria-hidden />
          ⌘K
        </button>

        <div className="ml-1 flex items-center gap-2 border-l border-white/[0.08] pl-2">
          <User size={14} className="text-emerald-400/80" aria-hidden />
          <div className="hidden text-[9px] leading-tight sm:block">
            <p className="font-medium text-slate-200">{currentUser.name}</p>
            <p className="text-slate-500">
              {currentUser.hospital} · {currentUser.department}
            </p>
          </div>
        </div>
      </div>

      <p className="border-t border-white/[0.04] px-3 py-1 text-[8px] text-slate-500">{MEDICAL_DISCLAIMER}</p>
    </header>
  );
}
