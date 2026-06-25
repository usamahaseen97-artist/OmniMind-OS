"use client";

import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function NotificationCenter({ compact = false }: { compact?: boolean }) {
  const { notifications, markNotificationRead } = useVisionaryAutomation();
  const unread = notifications.filter((n) => !n.read).length;

  if (compact) {
    return (
      <div className="border-t border-white/[0.06] p-2">
        <p className="text-[8px] uppercase text-slate-600">Notifications {unread > 0 ? `(${unread})` : ""}</p>
        {notifications.slice(0, 2).map((n) => (
          <button key={n.id} type="button" onClick={() => markNotificationRead(n.id)} className="block w-full truncate text-left text-[8px] text-slate-500">
            {n.title}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="mb-2 text-[9px] uppercase text-slate-600">Notifications</p>
      {notifications.map((n) => (
        <button key={n.id} type="button" onClick={() => markNotificationRead(n.id)} className={`mb-1 block w-full rounded px-2 py-1 text-left text-[9px] ${n.read ? "text-slate-600" : "bg-white/[0.03] text-slate-400"}`}>
          {n.title}
        </button>
      ))}
    </div>
  );
}
