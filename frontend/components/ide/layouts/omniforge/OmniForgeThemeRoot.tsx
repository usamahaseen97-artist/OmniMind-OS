"use client";

import type { ReactNode } from "react";
import { OF } from "./omniforge-theme";

export function OmniForgeThemeRoot({ children }: { children: ReactNode }) {
  return (
    <div
      className="omniforge-production-shell h-full min-h-0 flex-1 overflow-hidden"
      style={
        {
          "--omni-bg": OF.bg,
          "--omni-panel": OF.panel,
          "--omni-panel-alt": OF.panelAlt,
          "--omni-border": OF.border,
          "--omni-text": OF.text,
          "--omni-text-muted": OF.textMuted,
          "--omni-accent": OF.cyan,
          "--omni-accent-glow": OF.cyanGlow,
          "--omni-emerald": OF.terminalGreen,
          background: `radial-gradient(ellipse 120% 80% at 50% -20%, rgba(99,102,241,0.08), transparent), ${OF.bg}`,
          color: OF.text,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
