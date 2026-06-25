/** Minimal fetch helpers for core API clients — real backend only. */

let accessTokenProvider: (() => string | null) | undefined;

export function setAccessTokenProvider(fn: () => string | null) {
  accessTokenProvider = fn;
}

function buildHeaders(init?: RequestInit): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  const token = accessTokenProvider?.();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function apiPost<T>(url: string, body: unknown, init?: RequestInit): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(url, {
      ...init,
      method: "POST",
      headers: buildHeaders(init),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function apiGet<T>(url: string, init?: RequestInit): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(url, { ...init, method: "GET", headers: buildHeaders(init) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function apiPut<T>(url: string, body: unknown, init?: RequestInit): Promise<T | null> {
  if (typeof fetch === "undefined") return null;
  try {
    const res = await fetch(url, {
      ...init,
      method: "PUT",
      headers: buildHeaders(init),
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
