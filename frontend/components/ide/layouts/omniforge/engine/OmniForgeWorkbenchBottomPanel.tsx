"use client";

import { useOmniForgeShell } from "../../../../../lib/omniforge-shell-context";
import { OmniForgeTerminal } from "../OmniForgeTerminal";

/** Bottom panel with VS-style tabs — replaces log-only terminal block. */
export function OmniForgeWorkbenchBottomPanel() {
  const { terminalOpen } = useOmniForgeShell();
  if (!terminalOpen) return null;
  return (
    <div className="flex h-[28%] min-h-[100px] shrink-0 flex-col border-t border-white/[0.06] bg-[#0a0b10]">
      <OmniForgeTerminal />
    </div>
  );
}
