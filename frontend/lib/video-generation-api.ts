import { resolveBackendUrl } from "./backend-url";
import type { ToolDispatchPayload, ToolDispatchResult } from "./omni-tools-api";

export type VideoJobStatus = {
  job_id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  message: string;
  video_url?: string;
  error?: string;
  result?: ToolDispatchResult;
};

export async function fetchVideoJob(
  jobId: string,
  signal?: AbortSignal,
): Promise<VideoJobStatus> {
  const base = await resolveBackendUrl();
  const res = await fetch(`${base}/api/v1/tools/video/jobs/${jobId}`, { signal });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<VideoJobStatus>;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Queue free Wan 2.1 job, poll until MP4 is ready (LM Studio + HF — up to 15 min). */
export async function generateVideoWithPolling(
  payload: ToolDispatchPayload,
  onProgress?: (message: string, progress: number) => void,
): Promise<ToolDispatchResult> {
  const base = await resolveBackendUrl();
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 600_000);

  try {
    const startRes = await fetch(`${base}/api/v1/tools/video/generate/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!startRes.ok) {
      const err = await startRes.text();
      return { success: false, error: err || startRes.statusText };
    }
    const started = (await startRes.json()) as VideoJobStatus;
    const jobId = started.job_id;
    onProgress?.(started.message || "Free video queued (Wan 2.1)…", started.progress ?? 2);

    for (let i = 0; i < 300; i++) {
      await sleep(2000);
      const st = await fetchVideoJob(jobId, ctrl.signal);
      onProgress?.(st.message, st.progress);
      if (st.status === "completed" && st.result) {
        return { ...st.result, job_id: jobId } as ToolDispatchResult & { job_id?: string };
      }
      if (st.status === "failed") {
        return { success: false, error: st.error || "Video generation failed" };
      }
    }
    return { success: false, error: "Video generation timed out after 15 minutes" };
  } finally {
    window.clearTimeout(timer);
  }
}
