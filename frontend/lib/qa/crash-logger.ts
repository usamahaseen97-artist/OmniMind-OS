/** Client crash log buffer — never includes secrets or tokens. */

export type CrashRecord = {
  id: string;
  message: string;
  stack: string | null;
  componentStack: string | null;
  url: string;
  timestamp: string;
};

const MAX_CRASHES = 50;
const crashes: CrashRecord[] = [];

export const crashLogger = {
  record(error: Error, componentStack?: string | null) {
    const record: CrashRecord = {
      id: `crash-${Date.now()}`,
      message: error.message,
      stack: error.stack ?? null,
      componentStack: componentStack ?? null,
      url: typeof window !== "undefined" ? window.location.href : "",
      timestamp: new Date().toISOString(),
    };
    crashes.unshift(record);
    if (crashes.length > MAX_CRASHES) crashes.pop();
    if (typeof window !== "undefined") {
      try {
        const key = "omnimind:crash-log";
        const existing = JSON.parse(sessionStorage.getItem(key) ?? "[]") as CrashRecord[];
        sessionStorage.setItem(key, JSON.stringify([record, ...existing].slice(0, MAX_CRASHES)));
      } catch {
        /* ignore storage errors */
      }
    }
    return record;
  },

  list() {
    return [...crashes];
  },

  clear() {
    crashes.length = 0;
    if (typeof window !== "undefined") sessionStorage.removeItem("omnimind:crash-log");
  },
};
