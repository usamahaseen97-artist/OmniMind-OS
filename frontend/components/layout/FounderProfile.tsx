"use client";

import { Crown } from "lucide-react";

export function FounderProfile() {
  return (
    <div className="border-t border-neon-green/10 p-4">
      <div className="flex items-center gap-3 rounded-xl border border-neon-green/20 bg-gradient-to-br from-neon-green/5 to-transparent p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-green/20 ring-2 ring-neon-green/40">
          <Crown className="h-5 w-5 text-neon-green" />
        </div>
        <div>
          <p className="text-xs font-bold tracking-wide text-white">USAMA HASEEN</p>
          <p className="text-[10px] font-semibold text-neon-green">FOUNDER</p>
          <p className="text-[9px] text-zinc-600">Sovereign Tier · Full Access</p>
        </div>
      </div>
    </div>
  );
}
