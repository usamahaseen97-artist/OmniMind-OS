"use client";

import { useEffect } from "react";
import { useMedicalEnterprise } from "../../../lib/medical-enterprise/context";
import { LEFT_NAV_ITEMS } from "../../../lib/medical-enterprise/constants";

export function MedicalCommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveNav, setThemeMode } = useMedicalEnterprise();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "Escape") setCommandPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const commands = [
    ...LEFT_NAV_ITEMS.map((n) => ({
      label: `Go to ${n.label}`,
      run: () => setActiveNav(n.id),
    })),
    { label: "Theme: Dark", run: () => setThemeMode("dark") },
    { label: "Theme: Light", run: () => setThemeMode("light") },
    { label: "Theme: High Contrast", run: () => setThemeMode("high-contrast") },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-[15vh]"
      role="dialog"
      aria-label="Command palette"
    >
      <div className="w-full max-w-md rounded-xl border border-white/[0.1] bg-[#0f1419] shadow-2xl">
        <input
          autoFocus
          className="w-full border-b border-white/[0.08] bg-transparent px-4 py-3 text-[12px] text-slate-200 outline-none"
          placeholder="Type a command…"
          aria-label="Command search"
        />
        <ul className="max-h-[280px] overflow-y-auto py-1">
          {commands.map((cmd) => (
            <li key={cmd.label}>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-[11px] text-slate-300 hover:bg-white/[0.06]"
                onClick={() => {
                  cmd.run();
                  setCommandPaletteOpen(false);
                }}
              >
                {cmd.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
