"use client";

import type { ReactNode } from "react";
import { OmniMindCommandPalette } from "../ecosystem/OmniMindCommandPalette";
import { OmniMindKeyboardBindings } from "../ecosystem/OmniMindKeyboardBindings";
import { OmniMindNotificationStream } from "../ecosystem/OmniMindNotificationStream";
import { OmniMindQuickSearch } from "../ecosystem/OmniMindQuickSearch";
import { OmniMindMasterAgentBridge } from "./OmniMindMasterAgentBridge";
import { OmniMindBrainChrome } from "../brain/OmniMindBrainChrome";
import { OmniMindUnifiedSync } from "./OmniMindUnifiedSync";
import { OmniMindEcosystemChrome } from "../ecosystem/os/OmniMindEcosystemChrome";

/** Global OS overlays — palette, search, shortcuts, notifications. */
export function OmniMindOSGlobalChrome() {
  return (
    <>
      <OmniMindUnifiedSync />
      <OmniMindMasterAgentBridge />
      <OmniMindBrainChrome />
      <OmniMindKeyboardBindings />
      <OmniMindCommandPalette />
      <OmniMindQuickSearch />
      <OmniMindNotificationStream />
      <OmniMindEcosystemChrome />
    </>
  );
}

/** @deprecated Use root `Providers` + `OmniMindOSGlobalChrome` instead — not mounted in App Router. */
export function OmniMindOSRootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OmniMindOSGlobalChrome />
      {children}
    </>
  );
}
