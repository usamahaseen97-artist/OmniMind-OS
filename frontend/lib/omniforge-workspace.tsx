"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { GeneratedFileAsset } from "./execution-preview";
import type { DevTrioSlug } from "./dev-trio";
import { languageForPath } from "./omnimind-ide-config";
import type { OmniForgeTargetStack } from "./omniforge-project-profile";
import {
  ensureActiveProject,
  ensureGuestSession,
  getAccessToken,
  listChatHistory,
  listProjectFiles,
  probeOmniforgeGateway,
  streamScaffoldOmniForge,
  subscribeProjectFileWatch,
  upsertProjectFile,
  type OmniForgeFile,
} from "./omniforge-api";

export type OmniForgeWorkspaceStatus =
  | "offline"
  | "connecting"
  | "ready"
  | "error";

type OmniForgeContextValue = {
  status: OmniForgeWorkspaceStatus;
  projectId: string | null;
  authenticated: boolean;
  error: string | null;
  initializeWorkspace: () => Promise<GeneratedFileAsset[]>;
  persistFile: (path: string, content: string) => Promise<void>;
  runScaffold: (prompt: string, opts?: ScaffoldOpts) => Promise<GeneratedFileAsset[]>;
  providerHint: string | null;
};

type ScaffoldOpts = {
  mode?: "coding" | "terminal" | "vibe";
  modelLayer?: string;
  githubRepo?: string;
  email?: string;
  targetStack?: OmniForgeTargetStack;
  onFile?: (file: GeneratedFileAsset, all: GeneratedFileAsset[], meta: { index: number; total: number }) => void;
};

const OmniForgeContext = createContext<OmniForgeContextValue | null>(null);

export function useOmniForgeWorkspace() {
  const ctx = useContext(OmniForgeContext);
  if (!ctx) throw new Error("useOmniForgeWorkspace must be used within OmniForgeWorkspaceProvider");
  return ctx;
}

export function useOmniForgeWorkspaceOptional() {
  return useContext(OmniForgeContext);
}

function toGenerated(files: OmniForgeFile[]): GeneratedFileAsset[] {
  return files.map((f) => ({
    path: f.path,
    content: f.content,
    language: f.language ?? languageForPath(f.path),
  }));
}

function dispatchLayoutMetadata(layout: Record<string, unknown>) {
  const marker: GeneratedFileAsset = {
    path: ".omniforge/workspace.json",
    content: JSON.stringify(
      {
        ...layout,
        updated_at: new Date().toISOString(),
      },
      null,
      2,
    ),
    language: "json",
  };
  window.dispatchEvent(
    new CustomEvent("omnimind:omniforge-files-loaded", {
      detail: { files: [marker], mode: "merge" as const },
    }),
  );
  window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
}

function dispatchIncrementalFile(
  file: GeneratedFileAsset,
  all: GeneratedFileAsset[],
  meta: { index: number; total: number },
) {
  window.dispatchEvent(
    new CustomEvent("omnimind:omniforge-file-stream", {
      detail: { file, files: all, index: meta.index, total: meta.total },
    }),
  );
  window.dispatchEvent(
    new CustomEvent("omnimind:omniforge-files-loaded", {
      detail: { files: all, mode: "merge" as const },
    }),
  );
  const workspaceMarker: GeneratedFileAsset = {
    path: ".omniforge/workspace.json",
    content: JSON.stringify(
      {
        streaming: meta.index + 1 < meta.total,
        file_count: all.length,
        paths: all.map((f) => f.path),
        layout: { panels: ["explorer", "preview", "code", "agent"] },
        updated_at: new Date().toISOString(),
      },
      null,
      2,
    ),
    language: "json",
  };
  window.dispatchEvent(
    new CustomEvent("omnimind:omniforge-files-loaded", {
      detail: { files: [workspaceMarker], mode: "merge" as const },
    }),
  );
  window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
}

function dispatchFilesLoaded(files: GeneratedFileAsset[], mode: "replace" | "merge" = "replace") {
  window.dispatchEvent(
    new CustomEvent("omnimind:omniforge-files-loaded", {
      detail: { files, mode },
    }),
  );
}

export function OmniForgeWorkspaceProvider({
  toolSlug,
  providerHint,
  children,
}: {
  toolSlug: DevTrioSlug;
  providerHint?: string | null;
  children: ReactNode;
}) {
  const [status, setStatus] = useState<OmniForgeWorkspaceStatus>("connecting");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const authenticated = Boolean(getAccessToken());
  const readyRef = useRef(false);

  const bootstrapWorkspace = useCallback(async () => {
    if (readyRef.current) return;

    setStatus("connecting");
    const online = await probeOmniforgeGateway();
    if (!online) {
      setStatus("offline");
      setError(null);
      return;
    }

    const authed = await ensureGuestSession();
    if (!authed) {
      setStatus("error");
      setError("Could not establish OmniForge session");
      return;
    }

    try {
      const pid = await ensureActiveProject();
      setProjectId(pid);
      setStatus("ready");
      setError(null);
      readyRef.current = true;
      dispatchLayoutMetadata({ connected: true, project_id: pid, mode: "live" });
      window.dispatchEvent(new CustomEvent("omnimind:omniforge-gateway-online"));
    } catch {
      const localId =
        typeof window !== "undefined"
          ? localStorage.getItem("omniforge_active_project_id") ?? `local-${crypto.randomUUID()}`
          : `local-${crypto.randomUUID()}`;
      if (typeof window !== "undefined") {
        localStorage.setItem("omniforge_active_project_id", localId);
      }
      setProjectId(localId);
      setStatus("ready");
      setError(null);
      readyRef.current = true;
      dispatchLayoutMetadata({ connected: true, project_id: localId, mode: "local_fallback" });
      window.dispatchEvent(new CustomEvent("omnimind:omniforge-gateway-online"));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (cancelled || readyRef.current) return;
      await bootstrapWorkspace();
    };

    void tick();
    const poll = window.setInterval(() => void tick(), 5000);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [bootstrapWorkspace]);

  const initializeWorkspace = useCallback(async (): Promise<GeneratedFileAsset[]> => {
    /** Empty project marker only — no pre-written app code until agent scaffold runs. */
    const marker: GeneratedFileAsset[] = [
      {
        path: ".omniforge/workspace.json",
        content: JSON.stringify(
          { slug: toolSlug, empty: true, initialized_at: new Date().toISOString(), version: 1 },
          null,
          2,
        ),
        language: "json",
      },
    ];
    if (status !== "ready" || !projectId) return marker;

    await upsertProjectFile(projectId, marker[0]!.path, marker[0]!.content, marker[0]!.language);
    return marker;
  }, [projectId, status, toolSlug]);

  const persistFile = useCallback(
    async (path: string, content: string) => {
      if (status !== "ready" || !projectId) return;
      await upsertProjectFile(projectId, path, content);
    },
    [projectId, status],
  );

  const runScaffold = useCallback(
    async (prompt: string, opts: ScaffoldOpts = {}): Promise<GeneratedFileAsset[]> => {
      const email =
        opts.email ??
        (typeof window !== "undefined"
          ? localStorage.getItem("omniforge_guest_email") ?? "builder@example.com"
          : "builder@example.com");

      const generated = new Map<string, GeneratedFileAsset>();

      const result = await streamScaffoldOmniForge(
        {
          prompt,
          email,
          userId: projectId ?? "anonymous",
          mode: opts.mode ?? "coding",
          modelLayer: opts.modelLayer,
          githubRepo: opts.githubRepo,
          targetStack: opts.targetStack,
        },
        {
          onWorkspace: (payload) => {
            dispatchLayoutMetadata({
              streaming: true,
              paths: payload.files,
              title: payload.title,
              file_count: payload.files.length,
            });
          },
          onArchitect: (payload) => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("omnimind:omniforge-architect", { detail: payload }),
              );
            }
          },
          onSwarm: (payload) => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("omnimind:omniforge-swarm", { detail: payload }));
            }
          },
          onDiagnostic: (payload) => {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("omnimind:omniforge-diagnostic", { detail: payload }));
            }
          },
          onFile: (file, meta) => {
            const asset: GeneratedFileAsset = {
              path: file.path,
              content: file.content,
              language: file.language ?? languageForPath(file.path),
            };
            generated.set(asset.path, asset);
            const all = Array.from(generated.values());
            dispatchIncrementalFile(asset, all, meta);
            opts.onFile?.(asset, all, meta);
          },
          onDone: (payload) => {
            if (payload.terminal_log?.length) {
              window.dispatchEvent(
                new CustomEvent("omnimind:omniforge-scaffold-log", {
                  detail: { lines: payload.terminal_log },
                }),
              );
            }
          },
          onError: (message) => {
            throw new Error(message);
          },
        },
      );

      const generatedList = Array.from(generated.values());

      if (!result.ok || !generatedList.length) {
        throw new Error(result.error ?? "Scaffold returned no files");
      }

      if (status === "ready" && projectId && !projectId.startsWith("local-")) {
        void Promise.all(
          generatedList.map((f) => upsertProjectFile(projectId, f.path, f.content, f.language)),
        ).catch(() => {
          /* local IDE state already updated via stream events */
        });
        const workspaceFinal: GeneratedFileAsset = {
          path: ".omniforge/workspace.json",
          content: JSON.stringify(
            {
              streaming: false,
              file_count: generatedList.length,
              paths: generatedList.map((f) => f.path),
              title: result.title,
              layout: { panels: ["explorer", "preview", "code", "agent"] },
              updated_at: new Date().toISOString(),
            },
            null,
            2,
          ),
          language: "json",
        };
        void upsertProjectFile(projectId, workspaceFinal.path, workspaceFinal.content, workspaceFinal.language);
      }

      dispatchFilesLoaded(generatedList, "replace");
      return generatedList;
    },
    [projectId, status],
  );

  const value = useMemo(
    () => ({
      status,
      projectId,
      authenticated,
      error,
      initializeWorkspace,
      persistFile,
      runScaffold,
      providerHint: providerHint ?? null,
    }),
    [
      authenticated,
      error,
      initializeWorkspace,
      persistFile,
      projectId,
      providerHint,
      runScaffold,
      status,
    ],
  );

  return <OmniForgeContext.Provider value={value}>{children}</OmniForgeContext.Provider>;
}

/** Live file sync — initial load, SSE watch stream, and empty-project bootstrap. */
export function OmniForgeIdeSync() {
  const omniforge = useOmniForgeWorkspaceOptional();

  useEffect(() => {
    if (!omniforge || omniforge.status !== "ready" || !omniforge.projectId) return;

    const projectId = omniforge.projectId;
    const ac = new AbortController();
    let cancelled = false;

    const applyFiles = (items: OmniForgeFile[]) => {
      if (cancelled) return;
      dispatchFilesLoaded(toGenerated(items), "replace");
    };

    void (async () => {
      try {
        const files = await listProjectFiles(projectId);
        if (cancelled) return;
        applyFiles(files);
      } catch {
        /* gateway may be restarting */
      }

      try {
        await subscribeProjectFileWatch(
          projectId,
          {
            onFiles: (items) => applyFiles(items),
            onError: (msg) => {
              window.dispatchEvent(
                new CustomEvent("omnimind:omniforge-sync-error", { detail: msg }),
              );
            },
          },
          ac.signal,
        );
      } catch {
        if (!cancelled) {
          const poll = window.setInterval(async () => {
            try {
              const items = await listProjectFiles(projectId);
              applyFiles(items);
            } catch {
              /* ignore */
            }
          }, 4000);
          ac.signal.addEventListener("abort", () => window.clearInterval(poll));
        }
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [omniforge, omniforge?.projectId, omniforge?.status]);

  return null;
}

export async function fetchOmniForgeChatSeed(projectId: string) {
  const data = await listChatHistory(projectId);
  return data.items ?? [];
}
