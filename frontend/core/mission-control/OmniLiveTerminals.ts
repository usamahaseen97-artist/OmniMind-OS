import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import type { TerminalKind, TerminalLine } from "./types";

/** Live terminals — backend, frontend, SDK, docker, cloud, DB, AI, gateway. */
export class OmniLiveTerminals {
  lines: TerminalLine[] = [];
  activeTerminal: TerminalKind = "backend";

  async refresh() {
    const remote = await omniMissionControlApiClient.fetchTerminals();
    if (remote?.ok) this.lines = remote.lines;
    return this.lines;
  }

  byTerminal(kind: TerminalKind) {
    return this.lines.filter((l) => l.terminal === kind);
  }

  append(kind: TerminalKind, text: string, level: TerminalLine["level"] = "info") {
    const line: TerminalLine = {
      id: `term-${Date.now()}`,
      terminal: kind,
      text,
      level,
      at: new Date().toISOString(),
    };
    this.lines.unshift(line);
    if (this.lines.length > 500) this.lines.length = 500;
    void omniMissionControlApiClient.appendLog({ source: kind === "ai" ? "ai" : "backend", level, message: text });
    return line;
  }

  snapshot() {
    return { active: this.activeTerminal, lineCount: this.lines.length };
  }
}

export const omniLiveTerminals = new OmniLiveTerminals();
