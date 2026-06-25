import type { ContextSlice } from "./types";
import { omniMemory } from "./OmniMemory";

/** Assembles tool + project + workspace context for inference. */
export class OmniContextEngine {
  private stack: ContextSlice[] = [];

  push(slice: ContextSlice) {
    this.stack.push(slice);
    omniMemory.set("tool-context", "active-slice", slice, {
      toolSlug: slice.toolSlug,
      projectId: slice.projectId,
    });
    return slice;
  }

  pop() {
    return this.stack.pop() ?? null;
  }

  current(): ContextSlice | null {
    return this.stack[this.stack.length - 1] ?? null;
  }

  buildSystemContext(): string {
    const cur = this.current();
    if (!cur) return "";
    const prefs = omniMemory.get("user-prefs", "style", cur.toolSlug);
    return [
      `Tool: ${cur.toolSlug}`,
      cur.projectId ? `Project: ${cur.projectId}` : null,
      prefs ? `Preferences: ${JSON.stringify(prefs.value)}` : null,
      ...Object.entries(cur.metadata).map(([k, v]) => `${k}: ${v}`),
    ].filter(Boolean).join("\n");
  }
}

export const omniContextEngine = new OmniContextEngine();
