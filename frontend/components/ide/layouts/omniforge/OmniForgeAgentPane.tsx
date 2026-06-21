"use client";

import type { OmniForgeForgeControls } from "../../workspace/DevOmniChatConsole";
import { OmniForgeCommsConsole } from "./OmniForgeCommsConsole";
import { OmniForgeModeDock } from "./ui/OmniForgeModeDock";
import type { DevTrioSlug } from "../../../../lib/dev-trio";

type Props = OmniForgeForgeControls & {
  toolSlug: DevTrioSlug;
  modeHint: string;
  onModeChange: (m: OmniForgeForgeControls["mode"]) => void;
  onModelLayerChange: (v: string) => void;
  onGithubRepoChange: (v: string) => void;
  onProviderKeyChange: (v: string) => void;
};

/** AI Agent pane — chat + mode dock + stack profile */
export function OmniForgeAgentSection(props: Props) {
  const { toolSlug, modeHint, onModeChange, onModelLayerChange, onGithubRepoChange, onProviderKeyChange, ...forgeControls } = props;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <OmniForgeModeDock
        {...forgeControls}
        modeHint={modeHint}
        onModeChange={onModeChange}
        onModelLayerChange={onModelLayerChange}
        onGithubRepoChange={onGithubRepoChange}
        onProviderKeyChange={onProviderKeyChange}
      />
      <OmniForgeCommsConsole toolSlug={toolSlug} forgeControls={forgeControls} />
    </div>
  );
}
