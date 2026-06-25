import {
  WORKSPACE_SESSION_KEY,
  WORKSPACE_SESSION_VERSION,
  type WorkspaceEngineState,
  type WorkspaceSessionDocument,
} from "./types";
import { createInitialState, hydrateWorkspaceEngine, getWorkspaceEngineSnapshot } from "./store";

const SAVE_DEBOUNCE_MS = 800;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function captureSession(): WorkspaceSessionDocument {
  const snap = getWorkspaceEngineSnapshot();
  return {
    version: WORKSPACE_SESSION_VERSION,
    savedAt: new Date().toISOString(),
    ...snap,
  };
}

export function saveSessionNow() {
  if (typeof window === "undefined") return;
  try {
    const doc = captureSession();
    localStorage.setItem(WORKSPACE_SESSION_KEY, JSON.stringify(doc));
    window.dispatchEvent(new CustomEvent("omnimind:workspace-saved", { detail: doc }));
  } catch {
    /* quota */
  }
}

export function scheduleSessionSave() {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveSessionNow();
    saveTimer = null;
  }, SAVE_DEBOUNCE_MS);
}

export function loadSession(): WorkspaceEngineState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKSPACE_SESSION_KEY);
    if (!raw) return null;
    const doc = JSON.parse(raw) as WorkspaceSessionDocument;
    if (doc.version !== WORKSPACE_SESSION_VERSION) return null;
    const { version: _v, savedAt: _s, ...rest } = doc;
    return rest as WorkspaceEngineState;
  } catch {
    return null;
  }
}

export function restoreSession(): boolean {
  const loaded = loadSession();
  if (!loaded) return false;
  hydrateWorkspaceEngine(loaded);
  return true;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(WORKSPACE_SESSION_KEY);
  hydrateWorkspaceEngine(createInitialState());
}
