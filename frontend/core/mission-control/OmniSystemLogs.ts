import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import type { LogSource, SystemLogEntry } from "./types";
import { omniEventBus } from "../omnicore/OmniEventBus";

/** Centralized system logs — frontend, backend, AI, automation, plugins, cloud. */
export class OmniSystemLogs {
  entries: SystemLogEntry[] = [];

  async refresh(source?: LogSource) {
    const remote = await omniMissionControlApiClient.fetchLogs(source);
    if (remote?.ok) this.entries = remote.logs;
    return this.entries;
  }

  log(source: LogSource, message: string, level: SystemLogEntry["level"] = "info") {
    const entry: SystemLogEntry = {
      id: `log-${Date.now()}`,
      source,
      level,
      message,
      at: new Date().toISOString(),
    };
    this.entries.unshift(entry);
    void omniMissionControlApiClient.appendLog({ source, level, message });
    omniEventBus.publish("mission:log", { source, level });
    return entry;
  }

  filter(source?: LogSource) {
    return source ? this.entries.filter((e) => e.source === source) : this.entries;
  }
}

export const omniSystemLogs = new OmniSystemLogs();
