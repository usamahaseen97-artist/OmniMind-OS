"use client";

import { useEffect } from "react";

export const SUPER_TOOL_PROMPT_EVENT = "omnimind-super-tool-prompt";

export type SuperToolPromptDetail = {
  toolId: string;
  text: string;
};

export function emitSuperToolPrompt(toolId: string, text: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SuperToolPromptDetail>(SUPER_TOOL_PROMPT_EVENT, {
      detail: { toolId, text },
    }),
  );
}

export function useSuperToolPromptListener(
  toolId: string,
  onPrompt: (text: string) => void,
): void {
  useEffect(() => {
    const fn = (e: Event) => {
      const ce = e as CustomEvent<SuperToolPromptDetail>;
      if (ce.detail?.toolId !== toolId) return;
      onPrompt(ce.detail.text);
    };
    window.addEventListener(SUPER_TOOL_PROMPT_EVENT, fn);
    return () => window.removeEventListener(SUPER_TOOL_PROMPT_EVENT, fn);
  }, [toolId, onPrompt]);
}
