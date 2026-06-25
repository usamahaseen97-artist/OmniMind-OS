import { ApiError } from "../../lib/qa/api-error-handler";

/** Adapts core null-returning clients to lib createApiClient throw semantics. */
export async function requireApiResult<T>(promise: Promise<T | null>, label: string): Promise<T> {
  const data = await promise;
  if (data === null) {
    throw new ApiError(`${label} request failed`, { code: "network", retryable: true });
  }
  return data;
}

type CoreClientMethod = (...args: never[]) => Promise<unknown | null>;

/**
 * Wraps a core *ApiClient so lib facades share one delegation pattern
 * (canonical HTTP lives in core/shared/api-fetch via core clients only).
 */
export function createLibApiBridge<C extends Record<string, CoreClientMethod>>(
  coreClient: C,
  label: string,
): {
  [K in keyof C]: C[K] extends (...args: infer A) => Promise<infer R | null>
    ? (...args: A) => Promise<NonNullable<R>>
    : never;
} {
  const bridged = {} as {
    [K in keyof C]: C[K] extends (...args: infer A) => Promise<infer R | null>
      ? (...args: A) => Promise<NonNullable<R>>
      : never;
  };

  for (const key of Object.keys(coreClient) as (keyof C)[]) {
    const method = coreClient[key];
    bridged[key] = ((...args: never[]) =>
      requireApiResult(method(...args), label)) as (typeof bridged)[typeof key];
  }

  return bridged;
}
