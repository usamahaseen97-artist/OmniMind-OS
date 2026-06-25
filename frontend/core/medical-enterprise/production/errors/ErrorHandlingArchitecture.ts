import type { ErrorRecord, RetryPolicy, OfflineQueueItem, StructuredLogEntry } from "../types";

const DEFAULT_RETRY: RetryPolicy = { maxAttempts: 3, backoffMs: 500, jitter: true };

/** Unified error handling — retries, degradation, offline queue, logging */
export class ErrorHandlingArchitecture {
  private errors: ErrorRecord[] = [];
  private offlineQueue: OfflineQueueItem[] = [];
  private logs: StructuredLogEntry[] = [];

  log(level: StructuredLogEntry["level"], service: string, message: string, metadata?: Record<string, unknown>) {
    const entry: StructuredLogEntry = {
      level,
      service,
      message,
      timestamp: new Date().toISOString(),
      correlationId: `corr-${Date.now()}`,
      metadata,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 5000) this.logs.pop();
    return entry;
  }

  recordError(service: string, code: string, message: string, severity: ErrorRecord["severity"] = "medium") {
    const record: ErrorRecord = {
      id: `err-${Date.now()}`,
      timestamp: new Date().toISOString(),
      service,
      code,
      message,
      severity,
      recovered: false,
      retryCount: 0,
    };
    this.errors.unshift(record);
    this.log("error", service, message, { code, severity });
    return record;
  }

  async withRetry<T>(fn: () => Promise<T>, policy: RetryPolicy = DEFAULT_RETRY, service = "unknown"): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < policy.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (e) {
        lastError = e;
        const backoff = policy.backoffMs * 2 ** attempt * (policy.jitter ? 0.8 + Math.random() * 0.4 : 1);
        await new Promise((r) => setTimeout(r, backoff));
        this.recordError(service, "RETRY", `Attempt ${attempt + 1} failed`, "low");
      }
    }
    throw lastError;
  }

  enqueueOffline(action: string, payload: Record<string, unknown>) {
    const item: OfflineQueueItem = {
      id: `off-${Date.now()}`,
      action,
      payload,
      queuedAt: new Date().toISOString(),
      attempts: 0,
    };
    this.offlineQueue.push(item);
    return item;
  }

  async flushOfflineQueue(processor: (item: OfflineQueueItem) => Promise<void>) {
    const pending = [...this.offlineQueue];
    this.offlineQueue = [];
    for (const item of pending) {
      try {
        await processor(item);
      } catch {
        item.attempts += 1;
        if (item.attempts < 5) this.offlineQueue.push(item);
      }
    }
  }

  getRecentErrors(limit = 50) {
    return this.errors.slice(0, limit);
  }

  getLogs(level?: StructuredLogEntry["level"], limit = 100) {
    let list = this.logs;
    if (level) list = list.filter((l) => l.level === level);
    return list.slice(0, limit);
  }
}

let arch: ErrorHandlingArchitecture | null = null;

export function getErrorHandlingArchitecture() {
  if (!arch) arch = new ErrorHandlingArchitecture();
  return arch;
}
