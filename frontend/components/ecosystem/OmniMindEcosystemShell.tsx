"use client";

import type { ReactNode } from "react";
import { OmniMindAgentPanelExtensions } from "./OmniMindAgentPanelExtensions";
import { OmniMindCommandPalette } from "./OmniMindCommandPalette";
import { OmniMindDatabaseConfirmHost } from "./OmniMindDatabaseConfirmPrompt";
import { OmniMindDiagnosticPanel } from "./OmniMindDiagnosticPanel";
import { OmniMindDropZone } from "./OmniMindDropZone";
import { OmniMindEcosystemTopBar } from "./OmniMindEcosystemTopBar";
import { OmniMindFloatingEditorMenu } from "./OmniMindFloatingEditorMenu";
import { OmniMindKeyboardBindings } from "./OmniMindKeyboardBindings";
import { OmniMindNotificationStream } from "./OmniMindNotificationStream";
import { OmniMindQuickSearch } from "./OmniMindQuickSearch";
import { OmniMindStatusBar } from "./OmniMindStatusBar";

export { OmniMindAgentPanelExtensions };

/** Wraps OmniForge shell with ecosystem navigation, palettes, status, drop zone. */
export function OmniMindEcosystemShell({ children }: { children: ReactNode }) {
  return (
    <>
      <OmniMindKeyboardBindings />
      <OmniMindCommandPalette />
      <OmniMindQuickSearch />
      <OmniMindFloatingEditorMenu />
      <OmniMindNotificationStream />
      <OmniMindDatabaseConfirmHost
        onFiles={(files) => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("omnimind:omniforge-files-loaded", { detail: { files, mode: "merge" } }),
            );
          }
        }}
      />
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#12141c]">
        <OmniMindEcosystemTopBar />
        <OmniMindDropZone>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
        </OmniMindDropZone>
        <OmniMindStatusBar />
      </div>
    </>
  );
}
