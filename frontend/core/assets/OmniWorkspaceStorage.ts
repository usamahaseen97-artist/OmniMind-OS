import type { StorageKey } from "./types";
import { omniLocalStorage } from "./OmniLocalStorage";

/** Workspace-scoped storage — per project / tool. */
export class OmniWorkspaceStorage {
  private scopeKey(toolSlug: string, projectId: string | null) {
    return `ws:${toolSlug}:${projectId ?? "global"}`;
  }

  save(toolSlug: string, projectId: string | null, data: Record<string, unknown>) {
    const key = this.scopeKey(toolSlug, projectId);
    omniLocalStorage.set(key, { ...omniLocalStorage.get<Record<string, unknown>>(key, {}), ...data });
    return data;
  }

  load(toolSlug: string, projectId: string | null): Record<string, unknown> {
    return omniLocalStorage.get(this.scopeKey(toolSlug, projectId), {});
  }

  clear(toolSlug: string, projectId: string | null) {
    omniLocalStorage.remove(this.scopeKey(toolSlug, projectId));
  }
}

export const omniWorkspaceStorage = new OmniWorkspaceStorage();
