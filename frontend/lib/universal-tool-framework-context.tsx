"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  getToolExecutionEngine,
  getToolFrameworkStore,
  getUniversalTool,
  type ToolExecuteRequest,
  type ToolFrameworkState,
  type UniversalToolDefinition,
} from "../core/tool-framework";
import { useOmniMindBrain } from "./omnimind-brain-context";

type UniversalToolFrameworkContextValue = {
  tool: UniversalToolDefinition | null;
  state: ToolFrameworkState;
  execute: (request: Partial<ToolExecuteRequest> & { actionId?: string; prompt?: string }) => Promise<void>;
  undo: () => void;
  redo: () => void;
  exportWorkspace: () => void;
  importWorkspace: () => void;
  dismissNotification: (id: string) => void;
  runSuggestion: (text: string) => void;
};

const UniversalToolFrameworkContext = createContext<UniversalToolFrameworkContextValue | null>(null);

export function UniversalToolFrameworkProvider({
  toolId,
  children,
}: {
  toolId: string;
  children: ReactNode;
}) {
  const brain = useOmniMindBrain();
  const store = useMemo(() => getToolFrameworkStore(), []);
  const engine = useMemo(() => getToolExecutionEngine(), []);
  const [state, setState] = useState<ToolFrameworkState>(store.getState());
  const tool = useMemo(() => getUniversalTool(toolId) ?? null, [toolId]);

  useEffect(() => {
    const unsub = store.subscribe(setState);
    return () => {
      unsub();
    };
  }, [store]);

  useEffect(() => {
    store.reset();
    if (tool) {
      brain.brain.globalMemory.rememberTool(tool.toolId);
      store.pushMemoryContext(`Active tool: ${tool.title}`);
      store.pushSuggestion(`Ask AI to ${tool.aiPrompts[0]?.label.toLowerCase() ?? "analyze"} this workspace`);
    }
  }, [toolId, tool, store, brain.brain.globalMemory]);

  const execute = useCallback(
    async (request: Partial<ToolExecuteRequest> & { actionId?: string; prompt?: string }) => {
      if (!tool) return;
      const taskId = store.pushTask(request.actionId ?? request.prompt?.slice(0, 40) ?? "Run action", "running");
      store.setLoading(true);
      store.setError(null);
      store.setProgress(0);

      const result = await engine.run(
        { toolId: tool.toolId, ...request },
        async () => {
          const mem = brain.brain.globalMemory.getBrainSlice();
          const notes = mem.pinnedNotes.slice(-3).join(" · ");
          const conv = mem.recentConversations[0]?.text;
          return notes || conv || `Workspace context for ${tool.title}`;
        },
        async (ctx) => {
          if (request.prompt) {
            const res = await brain.processRequest(request.prompt, {
              activeToolId: tool.toolId,
              routeId: tool.routeId,
            });
            return res;
          }
          return { ctx, actionId: request.actionId };
        },
        {
          onStage: (stages) => store.setStages(stages),
          onProgress: (pct) => store.setProgress(pct),
        },
      );

      store.setLoading(false);
      if (result.ok) {
        store.updateTask(taskId, { status: "completed", progress: 100 });
        store.snapshot(request.actionId ?? "execute", result.output);
        store.pushMemoryContext(`Last result: ${tool.title}`);
        store.pushNotification("Action completed", "info");
        if (request.prompt) brain.pinNote(request.prompt.slice(0, 120));
      } else {
        store.updateTask(taskId, { status: "failed", progress: 100, error: result.error });
        store.setError(result.error ?? "Execution failed");
        store.pushNotification(result.error ?? "Execution failed", "error");
      }
    },
    [brain, engine, store, tool],
  );

  const undo = useCallback(() => {
    const snap = store.undo();
    if (snap) store.pushNotification(`Undid: ${snap.label}`, "info");
  }, [store]);

  const redo = useCallback(() => {
    const snap = store.redo();
    if (snap) store.pushNotification(`Redid: ${snap.label}`, "info");
  }, [store]);

  const exportWorkspace = useCallback(() => {
    if (!tool) return;
    const blob = new Blob(
      [JSON.stringify({ toolId: tool.toolId, exportedAt: new Date().toISOString(), state }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool.toolId}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    store.pushNotification("Export downloaded", "info");
  }, [state, store, tool]);

  const importWorkspace = useCallback(() => {
    store.pushNotification("Import ready — drop a .json export in workspace", "info");
  }, [store]);

  const dismissNotification = useCallback(
    (id: string) => {
      store.removeNotification(id);
    },
    [store],
  );

  const runSuggestion = useCallback(
    (text: string) => {
      void execute({ prompt: text });
    },
    [execute],
  );

  const value = useMemo(
    () => ({
      tool,
      state,
      execute,
      undo,
      redo,
      exportWorkspace,
      importWorkspace,
      dismissNotification,
      runSuggestion,
    }),
    [tool, state, execute, undo, redo, exportWorkspace, importWorkspace, dismissNotification, runSuggestion],
  );

  return (
    <UniversalToolFrameworkContext.Provider value={value}>{children}</UniversalToolFrameworkContext.Provider>
  );
}

/** Resolves toolId from pathname when not passed explicitly. @deprecated Unused — use UniversalToolFrameworkProvider with explicit toolId. */
export function UniversalToolFrameworkRootProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const toolId = pathname?.split("/").filter(Boolean).pop() ?? "omniforge-engine";
  return <UniversalToolFrameworkProvider toolId={toolId}>{children}</UniversalToolFrameworkProvider>;
}

export function useUniversalToolFramework() {
  const ctx = useContext(UniversalToolFrameworkContext);
  if (!ctx) throw new Error("useUniversalToolFramework must be used within UniversalToolFrameworkProvider");
  return ctx;
}

export function useUniversalToolFrameworkOptional() {
  return useContext(UniversalToolFrameworkContext);
}

/** Boot core tool plugins once on client. */
export function useToolFrameworkPlugins() {
  useEffect(() => {
    void (async () => {
      const { registerCorePlugins } = await import("../core/plugins/register");
      await registerCorePlugins();
      const { registerCoreToolPlugins } = await import("../core/tool-framework/plugins/register-core");
      registerCoreToolPlugins();
    })();
  }, []);
}
