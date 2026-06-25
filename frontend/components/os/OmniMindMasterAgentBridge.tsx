"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSovereignTool } from "../../lib/sovereign-tool-registry";
import { useOmniMindMasterAgentOptional } from "../../lib/omnimind-master-agent-context";
import { useOmniMindBrainOptional } from "../../lib/omnimind-brain-context";

/**
 * Bridges legacy chat prompt events to the Master Agent without replacing OmniChatShell.
 * High-confidence intents auto-route; others pass through to existing chat handlers.
 */
export function OmniMindMasterAgentBridge() {
  const master = useOmniMindMasterAgentOptional();
  const brain = useOmniMindBrainOptional();
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (!master) return;

    const onFill = (e: Event) => {
      const detail = (e as CustomEvent<{ text?: string; mode?: string }>).detail;
      const text = detail?.text?.trim();
      if (!text || detail?.mode === "replace-silent") return;

      const slug = pathname.split("/").filter(Boolean)[0];
      const tool = slug ? getSovereignTool(slug) : undefined;
      const intent = master?.resolveIntent(text);

      if (intent && intent.confidence >= 0.82 && intent.toolId !== tool?.slug) {
        e.stopImmediatePropagation();
        if (brain) {
          void brain.processRequest(text, { activeToolId: tool?.slug, pathname });
        } else {
          void master?.processMessage(text);
        }
      }
    };

    window.addEventListener("omnimind:fill-prompt", onFill, true);
    return () => window.removeEventListener("omnimind:fill-prompt", onFill, true);
  }, [brain, master, pathname]);

  return null;
}
