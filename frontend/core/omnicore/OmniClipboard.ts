import type { ClipboardEntry, OmniToolSlug } from "./types";
import { omniEventBus } from "./OmniEventBus";

const MAX_CLIPBOARD = 20;

/** Cross-tool clipboard history. */
export class OmniClipboard {
  entries: ClipboardEntry[] = [];

  copy(text: string, mime = "text/plain", toolSlug: OmniToolSlug | null = null) {
    const entry: ClipboardEntry = {
      id: `clip-${Date.now()}`,
      mime,
      text,
      toolSlug,
      copiedAt: new Date().toISOString(),
    };
    this.entries.unshift(entry);
    if (this.entries.length > MAX_CLIPBOARD) this.entries.length = MAX_CLIPBOARD;
    omniEventBus.publish("clipboard:copy", { mime });
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).catch(() => undefined);
    }
    return entry;
  }

  latest() {
    return this.entries[0] ?? null;
  }

  list() {
    return [...this.entries];
  }

  clear() {
    this.entries = [];
  }
}

export const omniClipboard = new OmniClipboard();
