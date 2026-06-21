import { getBackendUrl } from "./backend-url";
import { languageForPath } from "./omnimind-ide-config";
import { apiTargetStack, type OmniForgeTargetStack } from "./omniforge-project-profile";
import { consumeSseStream } from "./omniforge-sse";

export const OMNIFORGE_API_BASE =
  process.env.NEXT_PUBLIC_OMNIFORGE_API_URL ?? "http://localhost:8080";

export const OMNIFORGE_TERMINAL_WS =
  process.env.NEXT_PUBLIC_OMNIFORGE_TERMINAL_WS_URL ??
  "ws://localhost:8090/ws/terminal";

const ACCESS_KEY = "omniforge_access_token";
const REFRESH_KEY = "omniforge_refresh_token";
const PROJECT_KEY = "omniforge_active_project_id";
const GUEST_EMAIL_KEY = "omniforge_guest_email";

export type OmniForgeProject = { id: string; name: string; description?: string };
export type OmniForgeFile = { id?: string; path: string; content: string; language?: string };

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getActiveProjectId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PROJECT_KEY);
}

export function setActiveProjectId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROJECT_KEY, id);
}

export function setTokens(access: string, refresh?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function apiFetch(path: string, init: RequestInit = {}, retry = true): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");

  const res = await fetch(`${OMNIFORGE_API_BASE}${path}`, { ...init, headers });
  if (res.status === 401 && retry && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiFetch(path, init, false);
  }
  return res;
}

export async function probeOmniforgeGateway(): Promise<boolean> {
  try {
    const res = await fetch(`${OMNIFORGE_API_BASE}/healthz`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  const res = await fetch(`${OMNIFORGE_API_BASE}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) {
    clearTokens();
    return false;
  }
  const data = (await res.json()) as { access_token: string; refresh_token?: string };
  setTokens(data.access_token, data.refresh_token);
  return true;
}

export async function signup(email: string, password: string) {
  const res = await fetch(`${OMNIFORGE_API_BASE}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { access_token: string; refresh_token?: string };
  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${OMNIFORGE_API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { access_token: string; refresh_token?: string };
  setTokens(data.access_token, data.refresh_token);
  return data;
}

/** Real guest account on backend-fastapi — not a mock session. */
export async function ensureGuestSession(): Promise<boolean> {
  if (getAccessToken()) return true;
  if (!(await probeOmniforgeGateway())) return false;

  let email = typeof window !== "undefined" ? localStorage.getItem(GUEST_EMAIL_KEY) : null;
  if (!email) {
    email = `guest-${crypto.randomUUID().slice(0, 8)}@example.com`;
    localStorage.setItem(GUEST_EMAIL_KEY, email);
  }
  const password = `OmniForge-${email.slice(6, 14)}!9`;

  try {
    await signup(email, password);
    return true;
  } catch {
    try {
      await login(email, password);
      return true;
    } catch {
      return false;
    }
  }
}

export async function getGitHubLoginUrl(): Promise<string> {
  const res = await fetch(`${OMNIFORGE_API_BASE}/api/v1/auth/github/login`);
  if (!res.ok) throw new Error("GitHub OAuth unavailable");
  const data = (await res.json()) as { auth_url: string };
  return data.auth_url;
}

export async function listProjects(): Promise<{ items: OmniForgeProject[] }> {
  const res = await apiFetch("/api/v1/projects");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createProject(name: string, description = ""): Promise<OmniForgeProject> {
  const res = await apiFetch("/api/v1/projects", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function ensureActiveProject(name = "OmniForge Workspace"): Promise<string> {
  const existing = getActiveProjectId();
  if (existing) return existing;

  const { items } = await listProjects();
  const match = items.find((p) => p.name === name) ?? items[0];
  if (match) {
    setActiveProjectId(match.id);
    return match.id;
  }

  const created = await createProject(name, "OmniForge Engine project");
  setActiveProjectId(created.id);
  return created.id;
}

export async function listProjectFiles(projectId: string): Promise<OmniForgeFile[]> {
  const res = await apiFetch(`/api/v1/files/${projectId}`);
  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { items: OmniForgeFile[] };
  return data.items ?? [];
}

export async function upsertProjectFile(
  projectId: string,
  path: string,
  content: string,
  language?: string,
) {
  const res = await apiFetch(`/api/v1/files/${projectId}`, {
    method: "POST",
    body: JSON.stringify({
      path,
      content,
      language: language ?? languageForPath(path),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendChat(
  projectId: string,
  message: string,
  providerHint?: string,
  useFreePipeline?: boolean,
) {
  const res = await apiFetch("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify({
      project_id: projectId,
      message,
      provider_hint: providerHint,
      use_free_pipeline: Boolean(useFreePipeline),
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    assistant: string;
    provider: string;
    routing?: string;
    chain?: string[];
  }>;
}

export type ChatStreamHandlers = {
  onStart?: (provider: string) => void;
  onToken: (token: string) => void;
  onDone: (meta: { provider: string; routing?: string }) => void;
  onError?: (message: string) => void;
};

/** Live SSE chat stream — tokens arrive incrementally from backend-fastapi. */
export async function streamChat(
  projectId: string,
  message: string,
  handlers: ChatStreamHandlers,
  providerHint?: string,
  signal?: AbortSignal,
  useFreePipeline?: boolean,
): Promise<void> {
  const headers: Record<string, string> = {};
  if (useFreePipeline) headers["X-OmniForge-Free-Pipeline"] = "1";

  const res = await apiFetch(
    "/api/v1/chat/stream",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        project_id: projectId,
        message,
        provider_hint: providerHint,
        use_free_pipeline: Boolean(useFreePipeline),
      }),
      signal,
    },
    true,
  );

  await consumeSseStream(
    res,
    (evt) => {
      const type = String(evt.type ?? "");
      if (type === "start") {
        handlers.onStart?.(String(evt.provider ?? "router"));
        return;
      }
      if (type === "token") {
        handlers.onToken(String(evt.token ?? ""));
        return;
      }
      if (type === "done") {
        handlers.onDone({
          provider: String(evt.provider ?? "router"),
          routing: evt.routing ? String(evt.routing) : undefined,
        });
        return;
      }
      if (evt.error) handlers.onError?.(String(evt.error));
    },
    signal,
  );
}

export type FileWatchHandlers = {
  onFiles: (files: OmniForgeFile[], revision?: string) => void;
  onError?: (message: string) => void;
};

/** SSE file-watcher — re-emits whenever the project file store changes. */
export function subscribeProjectFileWatch(
  projectId: string,
  handlers: FileWatchHandlers,
  signal?: AbortSignal,
): Promise<void> {
  return apiFetch(`/api/v1/files/${projectId}/watch`, { signal }, true).then((res) =>
    consumeSseStream(
      res,
      (evt) => {
        if (evt.error) {
          handlers.onError?.(String(evt.error));
          return;
        }
        const items = evt.items as OmniForgeFile[] | undefined;
        if (items) handlers.onFiles(items, evt.revision ? String(evt.revision) : undefined);
      },
      signal,
    ),
  );
}

export async function listChatHistory(projectId: string) {
  const res = await apiFetch(`/api/v1/chat/${projectId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    items: { role: string; content: string; provider: string }[];
  }>;
}

export async function executeTerminal(command: string) {
  const res = await apiFetch("/api/v1/terminal/execute", {
    method: "POST",
    body: JSON.stringify({ command }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ ok: boolean; code: number | null; stdout: string; stderr: string }>;
}

export type OmniForgeScaffoldResult = {
  ok: boolean;
  files?: { path: string; content: string }[];
  terminal_log?: string[];
  title?: string;
  error?: string;
};

export async function scaffoldOmniForge(payload: {
  prompt: string;
  email: string;
  userId: string;
  mode: "coding" | "terminal" | "vibe";
  modelLayer?: string;
  githubRepo?: string;
  targetStack?: OmniForgeTargetStack;
  files?: { path: string; content: string }[];
}): Promise<OmniForgeScaffoldResult> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/v1/build-engine/omniforge/scaffold`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: payload.prompt,
      email: payload.email,
      user_id: payload.userId,
      mode: payload.mode,
      model_layer: payload.modelLayer,
      github_repo: payload.githubRepo || undefined,
      target_stack: apiTargetStack(payload.targetStack ?? "polyglot"),
      api_key_hint: payload.modelLayer,
      files: payload.files ?? [],
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `scaffold failed (${res.status})` };
  }
  return res.json();
}

export type ScaffoldStreamHandlers = {
  onFile?: (file: { path: string; content: string; language?: string }, meta: { index: number; total: number }) => void;
  onWorkspace?: (payload: { files: string[]; title?: string }) => void;
  onArchitect?: (payload: { phase: string; analysis?: unknown; database?: unknown; plan?: unknown }) => void;
  onSwarm?: (payload: { agent: string; status: string; task: string; progress: number }) => void;
  onDiagnostic?: (payload: { id: string; text: string }) => void;
  onDone?: (payload: { title?: string; terminal_log?: string[]; total?: number }) => void;
  onError?: (message: string) => void;
};

/** Incremental SSE scaffold — foundational files first for live preview. */
export async function streamScaffoldOmniForge(
  payload: {
    prompt: string;
    email: string;
    userId: string;
    mode: "coding" | "terminal" | "vibe";
    modelLayer?: string;
    githubRepo?: string;
    targetStack?: OmniForgeTargetStack;
    files?: { path: string; content: string }[];
  },
  handlers: ScaffoldStreamHandlers,
  signal?: AbortSignal,
): Promise<OmniForgeScaffoldResult> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/v1/build-engine/omniforge/scaffold/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: payload.prompt,
      email: payload.email,
      user_id: payload.userId,
      mode: payload.mode,
      model_layer: payload.modelLayer,
      github_repo: payload.githubRepo || undefined,
      target_stack: apiTargetStack(payload.targetStack ?? "polyglot"),
      api_key_hint: payload.modelLayer,
      files: payload.files ?? [],
    }),
    signal,
  });

  const collected = new Map<string, { path: string; content: string; language?: string }>();
  let title: string | undefined;
  let terminal_log: string[] | undefined;
  let errored = false;

  await consumeSseStream(
    res,
    (evt) => {
      const type = String(evt.type ?? "");
      if (type === "architect") {
        const phase = String(evt.phase ?? "analysis");
        handlers.onArchitect?.({
          phase,
          analysis: evt.analysis,
          database: evt.database,
          plan: evt.plan,
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("omnimind:omniforge-architect", {
              detail: { phase, analysis: evt.analysis, database: evt.database, plan: evt.plan, prompt_roman: evt.prompt_roman },
            }),
          );
        }
      } else if (type === "swarm") {
        const payload = {
          agent: String(evt.agent ?? ""),
          status: String(evt.status ?? ""),
          task: String(evt.task ?? ""),
          progress: Number(evt.progress ?? 0),
        };
        handlers.onSwarm?.(payload);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("omnimind:omniforge-swarm", { detail: payload }));
        }
      } else if (type === "diagnostic") {
        const payload = { id: String(evt.id ?? ""), text: String(evt.text ?? "") };
        handlers.onDiagnostic?.(payload);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("omnimind:omniforge-diagnostic", { detail: payload }));
        }
      } else if (type === "file") {
        const file = {
          path: String(evt.path ?? ""),
          content: String(evt.content ?? ""),
          language: evt.language ? String(evt.language) : undefined,
        };
        collected.set(file.path, file);
        const list = Array.from(collected.values());
        handlers.onFile?.(file, {
          index: Number(evt.index ?? list.length - 1),
          total: Number(evt.total ?? list.length),
        });
      } else if (type === "workspace") {
        handlers.onWorkspace?.({
          files: Array.isArray(evt.files) ? evt.files.map(String) : [],
          title: evt.title ? String(evt.title) : undefined,
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("omnimind:omniforge-scaffold-layout", {
              detail: evt,
            }),
          );
        }
      } else if (type === "done") {
        title = evt.title ? String(evt.title) : undefined;
        terminal_log = Array.isArray(evt.terminal_log) ? evt.terminal_log.map(String) : undefined;
        handlers.onDone?.({ title, terminal_log, total: Number(evt.total ?? collected.size) });
      } else if (type === "error") {
        errored = true;
        handlers.onError?.(String(evt.error ?? "scaffold stream failed"));
      }
    },
    signal,
  );

  const files = Array.from(collected.values());
  if (errored || !files.length) {
    return { ok: false, error: "scaffold stream failed", files, title, terminal_log };
  }
  return { ok: true, files, title, terminal_log };
}
