"use client";

import { OmniForgeTerminal } from "./OmniForgeTerminal";
import { OF } from "./omniforge-theme";

/** Pane 3 — Live build terminal logs */
export function OmniForgeTerminalPane() {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: OF.bgDeep, borderRight: `1px solid ${OF.border}` }}>
      <OmniForgeTerminal />
    </section>
  );
}
