"use client";

import { BrainActionCenter } from "./BrainActionCenter";
import { BrainPermissionPrompt } from "./BrainPermissionPrompt";
import { PluginPermissionPrompt } from "../plugins/PluginPermissionPrompt";
import { Brain2LiveThinkingPanel } from "./Brain2LiveThinkingPanel";

/** Global Brain overlays — action center + permission gate. */
export function OmniMindBrainChrome() {
  return (
    <>
      <BrainActionCenter />
      <Brain2LiveThinkingPanel />
      <BrainPermissionPrompt />
      <PluginPermissionPrompt />
    </>
  );
}
