import { REMOTE_JOB_KINDS } from "./constants";
import { omniCloudRemoteExecution } from "./OmniCloudRemoteExecution";
import type { RemoteJobKind } from "./types";

/** Background Cloud — cloud execution for heavy AI and media workloads. */
export class OmniCloudBackground {
  readonly kinds = REMOTE_JOB_KINDS;

  async renderImage(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("render-image", label, payload);
  }

  async renderVideo(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("render-video", label, payload);
  }

  async generateCode(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("generate-code", label, payload);
  }

  async deployWebsite(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("deploy-website", label, payload);
  }

  async trainModel(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("train-model", label, payload);
  }

  async runMarketing(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("marketing", label, payload);
  }

  async runMedicalAnalysis(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("medical-analysis", label, payload);
  }

  async produceMusic(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("music-production", label, payload);
  }

  async processLargeFile(label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue("large-file", label, payload);
  }

  run(kind: RemoteJobKind, label: string, payload?: Record<string, unknown>) {
    return omniCloudRemoteExecution.enqueue(kind, label, payload);
  }

  list() {
    return omniCloudRemoteExecution.list();
  }

  snapshot() {
    return omniCloudRemoteExecution.snapshot();
  }
}

export const omniCloudBackground = new OmniCloudBackground();
