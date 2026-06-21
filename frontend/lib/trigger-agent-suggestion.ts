"use client";

import { beginWorkbenchStream, endWorkbenchStream, pushWorkbenchDesignPrompt } from "./workbench-live-store";

const STREAM_MS = 2800;

/** Google AI Studio style chip → token stream in adjacent panels */
export function triggerAgentSuggestion(routeId: string, prompt: string, options?: { design?: boolean }) {
  if (options?.design) {
    pushWorkbenchDesignPrompt(prompt);
  }

  beginWorkbenchStream(routeId, prompt);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("omnimind:agent-suggestion", { detail: { routeId, prompt } }),
    );
  }

  window.setTimeout(() => endWorkbenchStream(routeId), STREAM_MS);
}
