"use client";

import { useEffect } from "react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { ToolSwitcher } from "../ide/ToolSwitcher";
import { ThemeHub } from "../theme/ThemeHub";
import { OmniMusicStudioProvider } from "../../lib/omnimusic-studio-context";
import { OmniMusicWorkspace } from "./OmniMusicWorkspace";
import { AudioEngine } from "./audio/AudioEngine";

export function OmniMusicStudioShell({
  tool,
  embeddedInAppShell,
}: {
  tool: SovereignToolDef;
  embeddedInAppShell?: boolean;
}) {
  useEffect(() => {
    document.title = `${tool.name} Studio · OmniMind`;
  }, [tool.name]);

  return (
    <OmniMusicStudioProvider>
      <AudioEngine>
        <div className="flex h-full min-h-0 flex-col">
          {!embeddedInAppShell ? (
          <div className="flex h-8 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#0a0e16] px-2">
            <ToolSwitcher tool={tool} />
            <ThemeHub />
          </div>
          ) : null}
          <div className="min-h-0 flex-1">
            <OmniMusicWorkspace />
          </div>
        </div>
      </AudioEngine>
    </OmniMusicStudioProvider>
  );
}
