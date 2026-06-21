"use client";

import { Bell } from "lucide-react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";

export function OmniMindNotificationStream() {
  const { notifications } = useOmniMindEcosystem();
  if (!notifications.length) return null;

  return (
    <aside className="pointer-events-none fixed bottom-8 right-2 z-[100] flex max-w-[220px] flex-col gap-1">
      {notifications.slice(0, 3).map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto flex items-start gap-2 rounded-lg border border-white/[0.08] bg-[#12141c]/95 px-2 py-1.5 shadow-xl backdrop-blur-md"
        >
          <Bell
            className={`mt-0.5 h-3 w-3 shrink-0 ${
              n.level === "success" ? "text-emerald-400" : n.level === "warn" ? "text-amber-400" : "text-cyan-400"
            }`}
          />
          <p className="text-[9px] leading-snug text-zinc-300">{n.text}</p>
        </div>
      ))}
    </aside>
  );
}
