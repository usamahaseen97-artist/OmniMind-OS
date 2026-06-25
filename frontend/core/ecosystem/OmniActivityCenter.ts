import { omniEventBus } from "../omnicore/OmniEventBus";
import { omniEcosystemApiClient } from "./OmniEcosystemApiClient";
import type { EcosystemActivity, EcosystemActivityKind } from "./types";

/** Global Activity Center — Windows Action Center for OmniMind OS. */
export class OmniActivityCenter {
  items: EcosystemActivity[] = [];
  private booted = false;

  async boot() {
    if (this.booted) return this;
    const remote = await omniEcosystemApiClient.listActivity();
    if (remote?.ok) this.items = remote.items;
    this.booted = true;
    return this;
  }

  push(
    kind: EcosystemActivityKind,
    title: string,
    detail?: string,
    opts: Partial<Pick<EcosystemActivity, "progress" | "status" | "toolSlug">> = {},
  ) {
    const now = new Date().toISOString();
    const item: EcosystemActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind,
      title,
      detail,
      progress: opts.progress,
      status: opts.status ?? "running",
      toolSlug: opts.toolSlug ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.items.unshift(item);
    if (this.items.length > 200) this.items = this.items.slice(0, 200);
    omniEventBus.publish("activity:new", { id: item.id, kind: item.kind });
    void omniEcosystemApiClient.pushActivity({
      kind: item.kind,
      title: item.title,
      detail: item.detail,
      progress: item.progress,
      status: item.status,
      toolSlug: item.toolSlug,
    });
    return item;
  }

  update(id: string, patch: Partial<Pick<EcosystemActivity, "progress" | "status" | "detail">>) {
    const item = this.items.find((x) => x.id === id);
    if (!item) return null;
    Object.assign(item, patch, { updatedAt: new Date().toISOString() });
    return item;
  }

  byKind(kind: EcosystemActivityKind) {
    return this.items.filter((i) => i.kind === kind);
  }

  running() {
    return this.items.filter((i) => i.status === "running" || i.status === "queued");
  }

  errors() {
    return this.items.filter((i) => i.kind === "error" || i.status === "failed");
  }

  snapshot() {
    return {
      total: this.items.length,
      running: this.running().length,
      errors: this.errors().length,
      items: this.items.slice(0, 50),
    };
  }
}

export const omniActivityCenter = new OmniActivityCenter();
