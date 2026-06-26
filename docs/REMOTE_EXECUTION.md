# Remote Execution

OmniCloud Remote Execution runs heavy AI and media workloads in the cloud while surfacing queue status, progress, ETA, logs, and resource usage to every device.

## Job Kinds

| Kind | Use Case |
|------|----------|
| `render-image` | Image generation and compositing |
| `render-video` | Video rendering pipelines |
| `generate-code` | Large code generation jobs |
| `deploy-website` | Static and dynamic site deployment |
| `train-model` | AI model training |
| `marketing` | Campaign and content generation |
| `medical-analysis` | Clinical analysis workloads |
| `music-production` | Audio production pipelines |
| `large-file` | Bulk file processing |

## Architecture

```
Frontend                    API                         Executor
OmniCloudBackground  →  POST /remote/jobs  →  store.enqueue_job()
OmniCloudRemoteExecution    GET /remote/jobs      remote_executor.run_job()
                                                    ↓
                                              superapp_ai.complete_text()
```

## Job Lifecycle

1. **queued** — accepted, waiting for worker
2. **running** — executor active, progress updates
3. **completed** — success, logs attached
4. **failed** — error captured in logs
5. **cancelled** — user or system cancellation

## Job Schema

```typescript
type RemoteJob = {
  id: string;
  kind: RemoteJobKind;
  label: string;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  progress: number;        // 0–100
  etaSeconds: number | null;
  logs: string[];
  resourceUsage: { cpu: number | null; memoryMb: number | null };
  createdAt: string;
  updatedAt: string;
};
```

## API

- `POST /api/v1/omnicore/omnicloud/remote/jobs` — enqueue job
- `GET /api/v1/omnicore/omnicloud/remote/jobs` — list all jobs

## Client Usage

```typescript
// Via background facade
await omniCore.cloud.background.generateCode("API scaffold", { stack: "fastapi" });

// Direct remote API
await omniCore.cloud.remote.enqueue("render-video", "Launch trailer");
const jobs = await omniCore.cloud.remote.list();
```

## Background Tasks

FastAPI `BackgroundTasks` runs `run_job()` asynchronously after enqueue so the HTTP response returns immediately with `status: queued`.

## UI

The OmniCloud Workspace **Remote Jobs** tab shows:

- Queue and running jobs
- Progress bars and ETA
- CPU / memory usage when available
- Demo enqueue actions for image and code jobs
