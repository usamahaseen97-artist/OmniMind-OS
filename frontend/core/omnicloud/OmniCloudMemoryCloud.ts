import { omniAI } from "../ai/OmniAI";
import { omniCloudApiClient } from "./OmniCloudApiClient";
import type { MemoryCloudEntry } from "./types";

/** AI Memory Cloud — universal, project, workspace, agent memory + knowledge graph. */
export class OmniCloudMemoryCloud {
  entries: MemoryCloudEntry[] = [];
  graphEdges: { from: string; to: string; relation: string }[] = [];

  async load(scope?: MemoryCloudEntry["scope"]) {
    const remote = await omniCloudApiClient.listMemory(scope);
    if (remote?.ok) {
      this.entries = remote.entries;
      return this.entries;
    }
    const local = omniAI.memory.list().map((m) => ({
      id: m.id,
      scope: (m.scope as MemoryCloudEntry["scope"]) ?? "universal",
      key: m.key,
      value: typeof m.value === "string" ? m.value : JSON.stringify(m.value),
      toolSlug: m.toolSlug ?? null,
      encrypted: false,
      updatedAt: m.updatedAt ?? new Date().toISOString(),
    }));
    this.entries = scope ? local.filter((e) => e.scope === scope) : local;
    return this.entries;
  }

  async sync() {
    const entries = omniAI.memory.list().map((m) => ({
      id: m.id,
      scope: (m.scope as MemoryCloudEntry["scope"]) ?? "universal",
      key: m.key,
      value: typeof m.value === "string" ? m.value : JSON.stringify(m.value),
      toolSlug: m.toolSlug ?? null,
      encrypted: true,
      updatedAt: m.updatedAt ?? new Date().toISOString(),
    }));
    await omniCloudApiClient.saveMemory(entries);
    this.entries = entries;
    this.rebuildGraph();
    return entries;
  }

  rebuildGraph() {
    this.graphEdges = this.entries.slice(0, 50).map((e, i) => ({
      from: e.id,
      to: this.entries[(i + 1) % Math.max(this.entries.length, 1)]?.id ?? e.id,
      relation: "context",
    }));
  }

  sharedContext(keys: string[]) {
    return this.entries.filter((e) => keys.includes(e.key));
  }

  snapshot() {
    return { entryCount: this.entries.length, graphEdges: this.graphEdges.length };
  }
}

export const omniCloudMemoryCloud = new OmniCloudMemoryCloud();
