import { PromptProcessor } from "./PromptProcessor";
import { modelRouter } from "./ModelRouter";
import { generationQueue } from "./GenerationQueue";
import { generationHistory } from "./GenerationHistory";
import { promptOptimizer } from "./PromptOptimizer";
import { promptTemplates } from "./PromptTemplates";
import { assetManager } from "./AssetManager";
import { jobScheduler } from "./JobScheduler";
import { inferenceManager } from "./InferenceManager";
import { cloudAssetSync } from "./CloudAssetSync";
import { PromptProcessor as PP } from "./PromptProcessor";
import type {
  BrandKit,
  GenerationJob,
  GenerationPriority,
  GenerationRecord,
  PromptDraft,
  VisionaryAIProject,
  VisionaryAsset,
} from "./types";
import type { AIWorkflowKind } from "./types";
import { visionaryAiApi } from "./visionary-ai-api";

/** Facade orchestrating the Visionary AI Creative Engine (Phase 2). */
export class VisionaryAIEngine {
  readonly promptProcessor = new PromptProcessor();
  readonly modelRouter = modelRouter;
  readonly queue = generationQueue;
  readonly history = generationHistory;
  readonly optimizer = promptOptimizer;
  readonly templates = promptTemplates;
  readonly assets = assetManager;
  readonly scheduler = jobScheduler;
  readonly inference = inferenceManager;
  readonly cloudSync = cloudAssetSync;

  async submitGeneration(params: {
    draft: PromptDraft;
    projectId: string;
    priority?: GenerationPriority;
    cloudRender?: boolean;
  }): Promise<{ job: GenerationJob; warnings: string[]; errors: string[] }> {
    const errors = this.promptProcessor.validateForWorkflow(params.draft);
    const { resolved, warnings } = this.promptProcessor.process(params.draft);
    if (errors.length > 0) return { job: null as unknown as GenerationJob, warnings, errors };

    const route = this.modelRouter.resolve(params.draft.workflow);
    const job: GenerationJob = {
      id: `job-${Date.now()}`,
      projectId: params.projectId,
      workflow: params.draft.workflow,
      prompt: { ...params.draft, positive: resolved },
      providerId: route.providerId,
      status: "queued",
      priority: params.priority ?? "normal",
      progress: 0,
      estimatedSecondsRemaining: null,
      cloudRender: params.cloudRender ?? false,
      gpuSlot: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      outputAssetId: null,
    };

    this.scheduler.plan(job);
    this.inference.assign(job.id, route.providerId, job.cloudRender);
    this.queue.enqueue(job);

    void visionaryAiApi.enqueueJob(job).catch(() => undefined);

    const unsub = this.queue.subscribe((jobs) => {
      const completed = jobs.find((j) => j.id === job.id && j.status === "completed");
      if (completed) {
        this.onJobCompleted(completed);
        unsub();
        this.inference.release(job.id);
      }
    });

    return { job, warnings, errors: [] };
  }

  private onJobCompleted(job: GenerationJob) {
    const outputKind = PP.workflowOutputKind(job.workflow);
    const kind = outputKind === "video" ? "video" : outputKind === "3d" ? "3d" : "image";
    const asset = this.assets.fromGeneration({
      id: job.outputAssetId ?? `asset-${job.id}`,
      projectId: job.projectId,
      name: `${job.workflow} output`,
      kind,
      workflow: job.workflow,
    });

    const record: GenerationRecord = {
      id: `hist-${job.id}`,
      jobId: job.id,
      projectId: job.projectId,
      workflow: job.workflow,
      promptSummary: job.prompt.positive.slice(0, 120),
      providerId: job.providerId,
      thumbnailUrl: null,
      assetId: asset.id,
      createdAt: new Date().toISOString(),
      tags: [job.workflow, job.providerId],
    };
    this.history.add(record);
    void visionaryAiApi.recordHistory(record).catch(() => undefined);
    this.cloudSync.markPendingUpload(1);
  }

  async loadFromBackend(projectId: string) {
    try {
      const [historyRes, assetsRes] = await Promise.all([
        visionaryAiApi.fetchHistory(projectId),
        visionaryAiApi.fetchAssets(projectId),
      ]);
      if (historyRes.records) this.history.seed(historyRes.records);
      if (assetsRes.assets) this.assets.seed(assetsRes.assets);
    } catch {
      // offline — local state only
    }
  }
}

export const visionaryAIEngine = new VisionaryAIEngine();
