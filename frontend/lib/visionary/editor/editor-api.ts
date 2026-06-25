import type { EditorProject, ExportJob, MediaPoolItem } from "./types";

const BASE = "/api/v1/visionary/editor";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Visionary Editor API ${res.status}`);
  return res.json() as Promise<T>;
}

export const visionaryEditorApi = {
  loadProject(projectId: string) {
    return request<{ ok: boolean; project: EditorProject }>(`/projects/${projectId}`);
  },

  saveProject(project: EditorProject) {
    return request<{ ok: boolean; project: EditorProject }>(`/projects/${project.id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  },

  serializeTimeline(project: EditorProject) {
    return request<{ ok: boolean; serialized: string }>("/timeline/serialize", {
      method: "POST",
      body: JSON.stringify(project),
    });
  },

  listMedia(projectId: string) {
    return request<{ ok: boolean; media: MediaPoolItem[] }>(`/media?project_id=${encodeURIComponent(projectId)}`);
  },

  importMedia(projectId: string, meta: Partial<MediaPoolItem>) {
    return request<{ ok: boolean; media: MediaPoolItem }>("/media/import", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, ...meta }),
    });
  },

  queueExport(job: Partial<ExportJob>) {
    return request<{ ok: boolean; job: ExportJob }>("/export/queue", {
      method: "POST",
      body: JSON.stringify(job),
    });
  },

  listExportQueue() {
    return request<{ ok: boolean; jobs: ExportJob[] }>("/export/queue");
  },

  cancelExport(jobId: string) {
    return request<{ ok: boolean }>(`/export/queue/${jobId}/cancel`, { method: "POST" });
  },
};
