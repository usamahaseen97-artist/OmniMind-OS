/** Structured API errors for consistent handling and retry decisions. */

export type ApiErrorCode =
  | "network"
  | "timeout"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "rate_limit"
  | "server"
  | "unknown";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly retryable: boolean;
  readonly details?: unknown;

  constructor(message: string, opts: { code?: ApiErrorCode; status?: number; retryable?: boolean; details?: unknown } = {}) {
    super(message);
    this.name = "ApiError";
    this.code = opts.code ?? "unknown";
    this.status = opts.status ?? 0;
    this.retryable = opts.retryable ?? false;
    this.details = opts.details;
  }

  static fromResponse(status: number, body?: unknown, label = "API") {
    const retryable = status === 429 || status >= 500;
    let code: ApiErrorCode = "unknown";
    if (status === 401) code = "unauthorized";
    else if (status === 403) code = "forbidden";
    else if (status === 404) code = "not_found";
    else if (status === 422 || status === 400) code = "validation";
    else if (status === 429) code = "rate_limit";
    else if (status >= 500) code = "server";
    return new ApiError(`OmniMind ${label} ${status}`, { code, status, retryable, details: body });
  }

  static isRetryable(err: unknown) {
    return err instanceof ApiError ? err.retryable : err instanceof TypeError;
  }
}

export async function withApiErrorHandling<T>(fn: () => Promise<T>, fallback?: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (fallback !== undefined && ApiError.isRetryable(err)) return fallback;
    throw err;
  }
}
