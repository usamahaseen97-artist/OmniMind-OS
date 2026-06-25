/** OmniCloud HTTP client — production API. */

import type {
  CloudAccount,
  CloudAdminDashboard,
  MemoryCloudEntry,
  ProjectCloudSnapshot,
  RemoteJob,
  RemoteJobKind,
  StorageBucket,
  SyncDomain,
} from "./types";

const BASE = "/api/v1/omnicore/omnicloud";

async function req<T>(method: string, path: string, body?: unknown): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const omniCloudApiClient = {
  getAccount() {
    return req<{ ok: boolean; account: CloudAccount }>("GET", "/account");
  },

  registerDevice(device: Omit<import("./types").CloudDevice, "id" | "lastSeenAt">) {
    return req<{ ok: boolean; device: import("./types").CloudDevice }>("POST", "/devices", device);
  },

  syncAll(domains?: SyncDomain[]) {
    return req<{ ok: boolean; results: import("./types").SyncResult[] }>("POST", "/sync", { domains });
  },

  syncDomain(domain: SyncDomain) {
    return req<{ ok: boolean; result: import("./types").SyncResult }>("POST", `/sync/${domain}`);
  },

  listProjectSnapshots(projectId: string) {
    return req<{ ok: boolean; snapshots: ProjectCloudSnapshot[] }>("GET", `/projects/${projectId}/snapshots`);
  },

  saveProjectSnapshot(projectId: string, label?: string) {
    return req<{ ok: boolean; snapshot: ProjectCloudSnapshot }>("POST", `/projects/${projectId}/snapshots`, { label });
  },

  restoreSnapshot(projectId: string, snapshotId: string) {
    return req<{ ok: boolean }>("POST", `/projects/${projectId}/snapshots/${snapshotId}/restore`);
  },

  listMemory(scope?: string) {
    const q = scope ? `?scope=${encodeURIComponent(scope)}` : "";
    return req<{ ok: boolean; entries: MemoryCloudEntry[] }>(`GET`, `/memory${q}`);
  },

  saveMemory(entries: MemoryCloudEntry[]) {
    return req<{ ok: boolean }>("PUT", "/memory", { entries });
  },

  enqueueRemote(kind: RemoteJobKind, label: string, payload?: Record<string, unknown>) {
    return req<{ ok: boolean; job: RemoteJob }>("POST", "/remote/jobs", { kind, label, payload });
  },

  listRemoteJobs() {
    return req<{ ok: boolean; jobs: RemoteJob[] }>("GET", "/remote/jobs");
  },

  getStorage() {
    return req<{ ok: boolean; buckets: StorageBucket[] }>("GET", "/storage");
  },

  getAdminDashboard() {
    return req<{ ok: boolean; dashboard: CloudAdminDashboard }>("GET", "/admin/dashboard");
  },

  pushOfflineQueue(item: Omit<import("./types").OfflineQueueItem, "id" | "queuedAt">) {
    return req<{ ok: boolean }>("POST", "/offline/queue", item);
  },

  resolveConflict(domain: SyncDomain, resolution: import("./types").ConflictResolution) {
    return req<{ ok: boolean }>("POST", "/sync/conflicts/resolve", { domain, resolution });
  },
};
