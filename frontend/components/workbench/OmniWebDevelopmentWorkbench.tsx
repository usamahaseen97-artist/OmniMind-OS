"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  FileCode2,
  FileJson2,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Loader2,
  MessageSquare,
  Monitor,
  Send,
  Smartphone,
} from "lucide-react";
import type { IDEProjectFile } from "../../lib/omnimind-ide-config";
import { OMNIFORGE_API_BASE, streamChat } from "../../lib/omniforge-api";
import {
  buildPreviewBlobUrlFromWorkspace,
  canComposePreview,
} from "../../lib/omniforge-preview-runtime";
import { fetchOmniForgeChatSeed, useOmniForgeWorkspaceOptional } from "../../lib/omniforge-workspace";
import { useOmniForgeShell } from "../../lib/omniforge-shell-context";
import { detectRomanLanguage, romanLanguageInstruction } from "../../lib/roman-language";
import { languageForPath } from "../../lib/omnimind-ide-config";
import type { ArchitectAnalysis, ArchitectPlan } from "../../lib/omniforge-architect-api";
import { useIDE } from "../ide/IDEProvider";
import { OmniForgeCopilotStrip } from "../ide/layouts/omniforge/engine/OmniForgeCopilotStrip";
import { OmniForgeDatabasePanel } from "../ide/layouts/omniforge/engine/OmniForgeDatabasePanel";
import { OmniForgeApiTesterPanel } from "../ide/layouts/omniforge/engine/OmniForgeApiTesterPanel";
import { OmniForgeExtensionsPanel } from "../ide/layouts/omniforge/engine/OmniForgeExtensionsPanel";
import { OmniForgeEngineToolbar } from "../ide/layouts/omniforge/engine/OmniForgeEngineToolbar";
import { OmniForgeExplorerActivityRail } from "../ide/layouts/omniforge/engine/OmniForgeExplorerActivityRail";
import { OmniForgeWorkbenchBottomPanel } from "../ide/layouts/omniforge/engine/OmniForgeWorkbenchBottomPanel";
import type { CopilotActionId } from "../../lib/omniforge-ide-modules";
import { OmniMindAgentPanelExtensions } from "../ecosystem/OmniMindAgentPanelExtensions";
import { OmniMindDeployStrip } from "../ecosystem/OmniMindDeployStrip";
import { OmniMindDiagnosticPanel } from "../ecosystem/OmniMindDiagnosticPanel";
import { OmniMindRecentProjectsPane } from "../ecosystem/OmniMindRecentProjectsPane";
import { useOmniMindEcosystemOptional } from "../../lib/omnimind-ecosystem-context";
import { OmniForgeEngineeringSuite } from "../omniforge/engineering/OmniForgeEngineeringSuite";
import { useOmniForgeEngineeringOptional } from "../../lib/omniforge-engineering-context";
import { useOmniForgeEnterpriseOptional } from "../../lib/omniforge-enterprise-context";
import { OmniForgeProjectBlueprintPanel } from "../omniforge/enterprise/OmniForgeProjectBlueprintPanel";
import { OmniForgeProjectHealthPanel } from "../omniforge/enterprise/OmniForgeProjectHealthPanel";
import { OmniForgeDeploymentPanel } from "../omniforge/enterprise/OmniForgeDeploymentPanel";
import { OmniForgeTestingPanel } from "../omniforge/enterprise/OmniForgeTestingPanel";
import { OmniForgeGitExplorerPanel } from "../omniforge/enterprise/OmniForgeGitExplorerPanel";
import { lintSource } from "../../lib/omniforge-syntax-validation";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-[10px] text-zinc-500">
      Loading editor…
    </div>
  ),
});

const QUICK_PROMPTS = [
  "Build a todo app website with React",
  "Add a landing page with hero section",
  "Create a product card e-commerce UI",
  "Scaffold FastAPI backend with health route",
] as const;

type PreviewFrame = "mobile" | "desktop";
type WorkspaceView = "code" | "browser";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

type ExplorerRow = {
  path: string;
  label: string;
  depth: number;
  isFolder: boolean;
};

const CODE_EXT = /\.(js|jsx|ts|tsx|py|css|json|html|md)$/i;

function uid() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function iconForPath(path: string, isFolder: boolean) {
  if (isFolder) return Folder;
  if (path.endsWith(".json")) return FileJson2;
  if (path.endsWith(".py")) return FileCode2;
  if (/\.(js|jsx|ts|tsx)$/.test(path)) return FileCode2;
  return FileText;
}

function buildExplorerRows(files: IDEProjectFile[]): ExplorerRow[] {
  const folderSet = new Set<string>();
  const filePaths: string[] = [];

  for (const f of files) {
    if (f.path.startsWith(".omniforge/")) continue;
    if (f.isFolder) {
      folderSet.add(f.path.replace(/\/$/, ""));
      continue;
    }
    filePaths.push(f.path);
    const parts = f.path.split("/");
    for (let i = 1; i < parts.length; i++) {
      folderSet.add(parts.slice(0, i).join("/"));
    }
  }

  const rows: ExplorerRow[] = [
    ...Array.from(folderSet).map((path) => ({
      path,
      label: path.split("/").pop() ?? path,
      depth: path.includes("/") ? path.split("/").length - 1 : 0,
      isFolder: true,
    })),
    ...filePaths.map((path) => ({
      path,
      label: path.split("/").pop() ?? path,
      depth: path.includes("/") ? path.split("/").length - 1 : 0,
      isFolder: false,
    })),
  ];

  rows.sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.path.localeCompare(b.path);
  });

  return rows;
}


function LivePreviewFrame({
  previewUrl,
  frame,
  compiling,
}: {
  previewUrl: string | null;
  frame: PreviewFrame;
  compiling: boolean;
}) {
  const hotReloadBadge = compiling && previewUrl ? (
    <div className="pointer-events-none absolute right-3 top-8 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-2 py-1 text-[8px] font-semibold uppercase tracking-wider text-cyan-300 ring-1 ring-cyan-400/30">
      <Loader2 className="h-3 w-3 animate-spin" />
      Hot reload
    </div>
  ) : null;

  if (!previewUrl) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        {compiling ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400/80" />
            <p className="text-[10px] text-zinc-500">Streaming scaffold — preview loads on first HTML/App file…</p>
          </>
        ) : (
          <>
            <Globe className="h-8 w-8 text-zinc-600" />
            <p className="text-[10px] text-zinc-500">Ask agent to scaffold — preview appears when index.html exists</p>
          </>
        )}
      </div>
    );
  }

  if (frame === "mobile") {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <div
          className="relative flex h-[min(520px,90%)] w-[250px] flex-col overflow-hidden rounded-[2rem] border-2 shadow-2xl"
          style={{ borderColor: "#2a2f3a", background: "#1a1d26" }}
        >
          {hotReloadBadge}
          <div className="flex h-6 shrink-0 items-center justify-center">
            <div className="h-1 w-16 rounded-full bg-zinc-700/80" />
          </div>
          <div className="mx-2 mb-2 flex flex-1 flex-col overflow-hidden rounded-2xl bg-white">
            <iframe title="omni-mobile-preview" src={previewUrl} className="h-full w-full border-0 bg-white" sandbox="allow-scripts allow-same-origin" />
          </div>
          <div className="h-4 shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <div
        className="relative flex h-[min(420px,88%)] w-full max-w-[340px] flex-col overflow-hidden rounded-lg border shadow-2xl"
        style={{ borderColor: "#2a2f3a", background: "#161920" }}
      >
        {hotReloadBadge}
        <div className="flex h-8 shrink-0 items-center gap-2 border-b border-white/5 px-3" style={{ background: "#1e222c" }}>
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <div className="ml-2 flex flex-1 items-center rounded-md border border-white/5 bg-[#12141c] px-2 py-0.5">
            <Globe className="mr-1 h-3 w-3 text-zinc-500" />
            <span className="truncate font-mono text-[9px] text-zinc-400">localhost:3000/omni-web-preview</span>
          </div>
        </div>
        <iframe title="omni-desktop-preview" src={previewUrl} className="min-h-0 flex-1 w-full border-0 bg-white" sandbox="allow-scripts allow-same-origin" />
      </div>
    </div>
  );
}

function PanelChrome({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex min-h-0 min-w-0 flex-col overflow-hidden border-r border-white/[0.06] bg-[#12141c] ${className}`}>
      {children}
    </div>
  );
}

function PanelHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center border-b border-white/[0.06] bg-[rgba(18,20,28,0.95)] px-3 py-2">
      {children}
    </div>
  );
}

/**
 * OMNI WEB DEVELOPMENT — 4-panel live workbench (backend-connected).
 * Explorer 15% · Preview 25% · Code+Terminal 40% · Agent 20%
 */
export function OmniWebDevelopmentWorkbench() {
  const omniforge = useOmniForgeWorkspaceOptional();
  const {
    targetStack,
    useFreeOpenSourcePipeline,
    setUseFreeOpenSourcePipeline,
    activeIdeModule,
    setActiveIdeModule,
    setArchitectAnalysis,
    setArchitectPlan,
    explorerView,
  } = useOmniForgeShell();
  const ecosystem = useOmniMindEcosystemOptional();
  const {
    projectFiles,
    selectedFile,
    openFile,
    updateFileContent,
    mergeGenerated,
    appendTerminal,
    clearTerminal,
  } = useIDE();
  const engineering = useOmniForgeEngineeringOptional();
  const enterprise = useOmniForgeEnterpriseOptional();

  const [previewFrame, setPreviewFrame] = useState<PreviewFrame>("mobile");
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("code");
  const [activePath, setActivePath] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const persistTimer = useRef<number | null>(null);
  const bootLogged = useRef(false);

  const live = omniforge?.status === "ready";
  const codeFiles = useMemo(
    () => projectFiles.filter((f) => !f.isFolder && CODE_EXT.test(f.path) && !f.path.startsWith(".omniforge/")),
    [projectFiles],
  );
  const fileSnapshots = useMemo(
    () => codeFiles.map((f) => ({ path: f.path, content: f.content ?? "" })),
    [codeFiles],
  );

  useEffect(() => {
    if (!enterprise || !fileSnapshots.length) return;
    enterprise.refreshHealth(fileSnapshots);
    enterprise.runAutoFixScan(fileSnapshots);
  }, [enterprise, fileSnapshots]);
  const explorerRows = useMemo(() => buildExplorerRows(projectFiles), [projectFiles]);
  const previewUrl = useMemo(() => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    const url = buildPreviewBlobUrlFromWorkspace(projectFiles);
    blobRef.current = url;
    return url;
  }, [projectFiles, refreshKey]);

  useEffect(() => {
    const onArchitect = (e: Event) => {
      const detail = (e as CustomEvent<{
        phase: string;
        analysis?: ArchitectAnalysis;
        plan?: ArchitectPlan;
      }>).detail;
      if (detail.analysis) setArchitectAnalysis(detail.analysis);
      if (detail.plan) setArchitectPlan(detail.plan);
    };
    window.addEventListener("omnimind:omniforge-architect", onArchitect);
    return () => window.removeEventListener("omnimind:omniforge-architect", onArchitect);
  }, [setArchitectAnalysis, setArchitectPlan]);

  useEffect(() => {
    const onSwarm = (e: Event) => {
      const d = (e as CustomEvent<{ agent: string; task: string; progress: number; status: string }>).detail;
      if (!d || !ecosystem) return;
      ecosystem.upsertProgressTask({
        id: d.agent,
        label: d.task,
        progress: d.progress,
        status: d.status === "done" ? "done" : "running",
      });
    };
    const onDiagnostic = (e: Event) => {
      const d = (e as CustomEvent<{ text: string }>).detail;
      if (d?.text) ecosystem?.pushAiSuggestion(d.text);
    };
    window.addEventListener("omnimind:omniforge-swarm", onSwarm);
    window.addEventListener("omnimind:omniforge-diagnostic", onDiagnostic);
    return () => {
      window.removeEventListener("omnimind:omniforge-swarm", onSwarm);
      window.removeEventListener("omnimind:omniforge-diagnostic", onDiagnostic);
    };
  }, [ecosystem]);

  useEffect(() => () => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onGatewayOnline = () => setRefreshKey((k) => k + 1);
    window.addEventListener("omnimind:omniforge-gateway-online", onGatewayOnline);
    return () => window.removeEventListener("omnimind:omniforge-gateway-online", onGatewayOnline);
  }, []);

  useEffect(() => {
    if (!compiling) return;
    const watchdog = window.setTimeout(() => {
      setCompiling(false);
      appendTerminal("⚠ scaffold preview watchdog — showing latest streamed state");
    }, 90_000);
    return () => window.clearTimeout(watchdog);
  }, [appendTerminal, compiling]);

  useEffect(() => {
    if (!live || bootLogged.current) return;
    bootLogged.current = true;
    appendTerminal(`[omni] workspace ready · project ${omniforge?.projectId?.slice(0, 8) ?? "—"}`);
    appendTerminal(`[omni] scaffold · :8001 · files/chat · :8003`);
  }, [appendTerminal, live, omniforge?.projectId]);

  useEffect(() => {
    if (!omniforge?.projectId || !live || historyLoaded) return;
    void (async () => {
      try {
        const items = await fetchOmniForgeChatSeed(omniforge.projectId!);
        if (items.length) {
          setMessages(
            items.map((m, i) => ({
              id: `hist-${i}`,
              role: m.role === "user" ? "user" : "assistant",
              content: m.content,
            })),
          );
        }
      } catch {
        /* empty */
      } finally {
        setHistoryLoaded(true);
      }
    })();
  }, [historyLoaded, live, omniforge?.projectId]);

  useEffect(() => {
    if (!codeFiles.length) {
      setActivePath(null);
      return;
    }
    if (!activePath || !codeFiles.some((f) => f.path === activePath)) {
      const prefer = codeFiles.find((f) => f.path.endsWith("main.js") || f.path.endsWith("server.py"));
      const next = prefer ?? codeFiles[0]!;
      setActivePath(next.path);
      openFile(next);
    }
  }, [activePath, codeFiles, openFile]);

  useEffect(() => {
    const onRefresh = () => setRefreshKey((k) => k + 1);
    const onFiles = () => setRefreshKey((k) => k + 1);
    const onFileStream = (e: Event) => {
      const detail = (e as CustomEvent<{ files: { path: string; content: string }[] }>).detail;
      if (detail?.files && canComposePreview(detail.files)) {
        setCompiling(false);
      }
      setRefreshKey((k) => k + 1);
    };
    const onScaffoldLog = (e: Event) => {
      const lines = (e as CustomEvent<{ lines: string[] }>).detail?.lines ?? [];
      for (const line of lines) appendTerminal(line);
    };
    const onScaffoldLayout = () => {
      setCompiling(false);
      setRefreshKey((k) => k + 1);
    };
    window.addEventListener("omnimind:omniforge-preview-refresh", onRefresh);
    window.addEventListener("omnimind:omniforge-files-loaded", onFiles);
    window.addEventListener("omnimind:omniforge-file-stream", onFileStream);
    window.addEventListener("omnimind:omniforge-scaffold-log", onScaffoldLog);
    window.addEventListener("omnimind:omniforge-scaffold-layout", onScaffoldLayout);
    return () => {
      window.removeEventListener("omnimind:omniforge-preview-refresh", onRefresh);
      window.removeEventListener("omnimind:omniforge-files-loaded", onFiles);
      window.removeEventListener("omnimind:omniforge-file-stream", onFileStream);
      window.removeEventListener("omnimind:omniforge-scaffold-log", onScaffoldLog);
      window.removeEventListener("omnimind:omniforge-scaffold-layout", onScaffoldLayout);
    };
  }, [appendTerminal]);

  useEffect(() => {
    if (!projectFiles.length) return;
    setRefreshKey((k) => k + 1);
  }, [projectFiles]);

  const activeFile = useMemo(
    () => codeFiles.find((f) => f.path === activePath) ?? selectedFile,
    [activePath, codeFiles, selectedFile],
  );

  useEffect(() => {
    const onSave = () => {
      if (activeFile?.content != null && activeFile.path) {
        void omniforge?.persistFile(activeFile.path, activeFile.content);
      }
    };
    const onRun = () => {
      setRefreshKey((k) => k + 1);
      window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
    };
    window.addEventListener("omnimind:ecosystem-save", onSave);
    window.addEventListener("omnimind:ecosystem-run", onRun);
    return () => {
      window.removeEventListener("omnimind:ecosystem-save", onSave);
      window.removeEventListener("omnimind:ecosystem-run", onRun);
    };
  }, [activeFile, omniforge]);

  const schedulePersist = useCallback(
    (path: string, content: string) => {
      updateFileContent(path, content);
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
      persistTimer.current = window.setTimeout(() => {
        void omniforge?.persistFile(path, content);
      }, 600);
    },
    [omniforge, updateFileContent],
  );

  const runScaffold = useCallback(
    async (text: string, assistantId: string) => {
      if (!omniforge || !live) throw new Error(`Offline — start backend-fastapi (${OMNIFORGE_API_BASE})`);
      ecosystem?.setLastScaffoldPrompt(text);
      setCompiling(true);
      ecosystem?.upsertProgressTask({ id: "scaffold", label: "Creating project scaffold…", progress: 8, status: "running" });
      ecosystem?.upsertProgressTask({ id: "backend", label: "Creating Backend…", progress: 0, status: "idle" });
      appendTerminal(`▸ scaffold · ${text.slice(0, 64)}…`);
      const files = await omniforge.runScaffold(text, {
        mode: "vibe",
        targetStack,
        onFile: (file, all, meta) => {
          const pct = Math.round(((meta.index + 1) / Math.max(meta.total, 1)) * 100);
          ecosystem?.upsertProgressTask({ id: "scaffold", label: `Streaming ${file.path}`, progress: pct, status: "running" });
          if (file.path.includes("backend")) {
            ecosystem?.upsertProgressTask({ id: "backend", label: "Creating Backend…", progress: pct, status: "running" });
          }
          if (canComposePreview(all)) setCompiling(false);
          appendTerminal(`  ↳ ${meta.index + 1}/${meta.total} · ${file.path}`);
          setRefreshKey((k) => k + 1);
        },
      });
      if (files.length) {
        mergeGenerated(files);
        if (canComposePreview(files)) setCompiling(false);
        appendTerminal(`✓ ${files.length} file(s) written`);
        setRefreshKey((k) => k + 1);
        window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
      }
      ecosystem?.upsertProgressTask({ id: "scaffold", label: "Scaffold complete", progress: 100, status: "done" });
      ecosystem?.upsertProgressTask({ id: "backend", label: "Backend ready", progress: 100, status: "done" });
      window.dispatchEvent(new CustomEvent("omnimind:omniforge-build-complete"));
      const docFiles = engineering?.injectDocumentation(files) ?? files;
      if (docFiles.length > files.length) mergeGenerated(docFiles.slice(files.length));
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: files.length
                  ? `Generated ${files.length} file(s):\n${files.map((f) => `· ${f.path}`).join("\n")}`
                  : "Scaffold returned no files.",
                streaming: false,
              }
            : m,
        ),
      );
    },
    [appendTerminal, ecosystem, engineering, live, mergeGenerated, omniforge, targetStack],
  );

  useEffect(() => {
    const onApproved = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string }>).detail;
      if (!detail?.prompt) return;
      const prompt = detail.prompt ?? "";
      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: prompt },
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);
      setSending(true);
      void runScaffold(prompt, assistantId).finally(() => setSending(false));
    };
    const onReject = (e: Event) => {
      const path = (e as CustomEvent<{ path?: string }>).detail?.path;
      if (!path) return;
      const remaining = projectFiles
        .filter((f) => f.path !== path)
        .map((f) => ({ path: f.path, content: f.content ?? "", language: f.language }));
      window.dispatchEvent(
        new CustomEvent("omnimind:omniforge-files-loaded", { detail: { files: remaining, mode: "replace" } }),
      );
    };
    const onAutoFix = (e: Event) => {
      const msg = (e as CustomEvent<{ error?: string }>).detail?.error;
      if (msg) engineering?.retryAutoFix(msg);
    };
    window.addEventListener("omnimind:omniforge-approved-build", onApproved);
    window.addEventListener("omnimind:omniforge-file-reject", onReject);
    window.addEventListener("omnimind:omniforge-auto-fix", onAutoFix);
    return () => {
      window.removeEventListener("omnimind:omniforge-approved-build", onApproved);
      window.removeEventListener("omnimind:omniforge-file-reject", onReject);
      window.removeEventListener("omnimind:omniforge-auto-fix", onAutoFix);
    };
  }, [engineering, projectFiles, runScaffold]);

  const runChat = useCallback(
    async (text: string, assistantId: string) => {
      if (!omniforge?.projectId || !live) throw new Error(`Offline — ${OMNIFORGE_API_BASE}`);
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const contextLine = activeFile ? `\n[Context: ${activeFile.path}]\n` : "";
      const roman = romanLanguageInstruction(detectRomanLanguage(text));
      const payload = `${roman ?? ""}${contextLine}${text}`;

      await streamChat(
        omniforge.projectId,
        payload,
        {
          onToken: (token) =>
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + token } : m)),
            ),
          onDone: () =>
            setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m))),
          onError: (message) =>
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: message, streaming: false } : m)),
            ),
        },
        useFreeOpenSourcePipeline ? "free" : "auto",
        ac.signal,
        useFreeOpenSourcePipeline,
      );
    },
    [activeFile, live, omniforge?.projectId, useFreeOpenSourcePipeline],
  );

  const handleAskAgentWithText = useCallback(
    async (text: string) => {
      if (!text.trim() || sending) return;
      ecosystem?.pushPromptHistory(text, ecosystem.activeAgent);
      const assistantId = uid();
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: text },
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);
      setChatInput("");
      setSending(true);
      try {
        const buildIntent = /build|bana|banani|banana|scaffold|create|website|app|todo|landing|mujhe|chahiye/i.test(text);
        if (buildIntent) await runScaffold(text, assistantId);
        else await runChat(text, assistantId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Request failed";
        appendTerminal(`✗ ${msg}`);
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: msg, streaming: false } : m)));
      } finally {
        setSending(false);
        setCompiling(false);
      }
    },
    [appendTerminal, ecosystem, runChat, runScaffold, sending],
  );

  useEffect(() => {
    const onAgentPrompt = (e: Event) => {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text;
      if (text) void handleAskAgentWithText(text);
    };
    window.addEventListener("omnimind:ecosystem-agent-prompt", onAgentPrompt);
    return () => window.removeEventListener("omnimind:ecosystem-agent-prompt", onAgentPrompt);
  }, [handleAskAgentWithText]);

  const handleCopilotAction = useCallback(
    (action: CopilotActionId, prompt: string) => {
      if (!prompt.trim()) return;
      setChatInput(prompt);
      if (action !== "autocomplete") void handleAskAgentWithText(prompt);
    },
    [handleAskAgentWithText],
  );

  const handleAskAgent = async () => {
    await handleAskAgentWithText(chatInput.trim());
  };

  const pillBtn = (active: boolean) =>
    `rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-wider transition ${
      active
        ? "bg-indigo-500/20 text-cyan-300 ring-1 ring-indigo-400/40"
        : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
    }`;

  const explorerSidePanel = () => {
    if (activeIdeModule === "database") {
      return <OmniForgeDatabasePanel onClose={() => setActiveIdeModule(null)} />;
    }
    if (activeIdeModule === "api_tester") return <OmniForgeApiTesterPanel />;
    if (activeIdeModule === "extensions") return <OmniForgeExtensionsPanel />;
    if (activeIdeModule === "enterprise_dashboard") {
      enterprise?.openDashboard();
      return <p className="p-3 text-[10px] text-zinc-500">Enterprise dashboard opened.</p>;
    }
    if (activeIdeModule === "project_health") return <OmniForgeProjectHealthPanel />;
    if (activeIdeModule === "deployment_center") return <OmniForgeDeploymentPanel />;
    if (activeIdeModule === "testing_center") return <OmniForgeTestingPanel files={fileSnapshots} />;
    if (activeIdeModule === "project_explorer" || activeIdeModule === "solution_explorer") {
      return <OmniForgeProjectBlueprintPanel />;
    }
    if (explorerView === "recent") return <OmniMindRecentProjectsPane />;
    if (explorerView === "git") return <OmniForgeGitExplorerPanel />;
    return null;
  };

  const showExplorer = ecosystem?.sidebarOpen !== false;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#12141c] text-zinc-100">
      <OmniForgeEngineeringSuite
        projectFiles={codeFiles.map((f) => ({ path: f.path, content: f.content ?? "", language: f.language }))}
      />
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[rgba(14,16,24,0.98)] px-4">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${live ? "animate-pulse bg-emerald-400" : "bg-amber-500"}`} />
          <h1 className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-100">OMNIFORGE ENGINE</h1>
        </div>
        <span className="font-mono text-[9px] text-zinc-500">
          {live ? `live · ${codeFiles.length} file(s)` : "offline · connect :8003 + :8001"}
        </span>
      </header>

      <OmniForgeEngineToolbar
        live={live}
        onBuild={() => appendTerminal("▸ build · compiling workspace…")}
        onRun={() => {
          appendTerminal("▸ run · live preview refresh");
          setRefreshKey((k) => k + 1);
          window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
        }}
      />

      <div className="flex min-h-0 flex-1">
        {/* PANEL 1 — FILE EXPLORER (15%) */}
        {showExplorer ? (
        <PanelChrome className="w-[15%]">
          <div className="flex min-h-0 flex-1">
            <OmniForgeExplorerActivityRail />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <PanelHeader>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {activeIdeModule ? activeIdeModule.replace("_", " ") : "📁 File Explorer"}
                </span>
              </PanelHeader>
              {explorerSidePanel() ?? (
                <nav className="min-h-0 flex-1 overflow-y-auto py-2">
            {explorerRows.length ? (
              explorerRows.map((row) => {
                const Icon = iconForPath(row.path, row.isFolder);
                const active = activePath === row.path;
                return (
                  <button
                    key={row.path}
                    type="button"
                    onClick={() => {
                      if (!row.isFolder) {
                        setActivePath(row.path);
                        const file = projectFiles.find((f) => f.path === row.path);
                        if (file) openFile(file);
                        setWorkspaceView("code");
                      }
                    }}
                    className={`flex w-full items-center gap-1.5 px-2 py-1 text-left text-[11px] transition ${
                      active ? "bg-indigo-500/10 text-cyan-200" : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                    }`}
                    style={{ paddingLeft: `${8 + row.depth * 14}px` }}
                  >
                    {row.isFolder ? (
                      <ChevronRight className="h-3 w-3 shrink-0 text-zinc-600" />
                    ) : (
                      <span className="w-3 shrink-0" />
                    )}
                    {row.isFolder ? (
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 text-cyan-400/80" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 shrink-0 text-amber-300/90" />
                    )}
                    <span className="truncate">{row.label}</span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-4 text-center text-[10px] leading-relaxed text-zinc-600">
                Empty workspace.
                <br />
                Ask agent to build an app.
              </p>
            )}
                </nav>
              )}
            </div>
          </div>
        </PanelChrome>
        ) : null}

        {/* PANEL 2 — LIVE PREVIEW (25%) */}
        <PanelChrome className="w-[25%]">
          <PanelHeader>
            <div className="flex w-full flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Live Runtime Preview</span>
                {previewUrl ? (
                  <span className="flex items-center gap-1 text-[8px] text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    Hot reload active
                  </span>
                ) : null}
              </div>
              <div className="flex w-full items-center rounded-lg border border-white/[0.06] bg-black/25 p-0.5">
              <button
                type="button"
                onClick={() => setPreviewFrame("mobile")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[9px] font-semibold uppercase tracking-wide transition ${
                  previewFrame === "mobile" ? "bg-cyan-500/15 text-cyan-300" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setPreviewFrame("desktop")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[9px] font-semibold uppercase tracking-wide transition ${
                  previewFrame === "desktop" ? "bg-cyan-500/15 text-cyan-300" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                Desktop
              </button>
            </div>
            </div>
          </PanelHeader>
          <div className="min-h-0 flex-1 overflow-hidden bg-[#0e1016]">
            <LivePreviewFrame previewUrl={previewUrl} frame={previewFrame} compiling={compiling} />
          </div>
        </PanelChrome>

        {/* PANEL 3 — CODE + TERMINAL (40%) */}
        <PanelChrome className="w-[40%]">
          <PanelHeader>
            <div className="flex w-full items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
                {codeFiles.length ? (
                  codeFiles.map((f) => {
                    const label = f.path.split("/").pop() ?? f.path;
                    const active = activePath === f.path && workspaceView === "code";
                    return (
                      <button
                        key={f.path}
                        type="button"
                        onClick={() => {
                          setActivePath(f.path);
                          openFile(f);
                          setWorkspaceView("code");
                        }}
                        className={`shrink-0 rounded-md px-2.5 py-1 font-mono text-[10px] transition ${
                          active ? "bg-[#1e222c] text-cyan-300 ring-1 ring-white/[0.08]" : "text-zinc-500 hover:bg-white/[0.04]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-[10px] text-zinc-600">No open files</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/[0.06] p-0.5">
                <button type="button" onClick={() => setWorkspaceView("code")} className={pillBtn(workspaceView === "code")}>
                  Code view
                </button>
                <button type="button" onClick={() => setWorkspaceView("browser")} className={pillBtn(workspaceView === "browser")}>
                  Browser View
                </button>
              </div>
            </div>
          </PanelHeader>

          <OmniForgeCopilotStrip onAction={handleCopilotAction} disabled={!live || sending} />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#0f1117]">
            {workspaceView === "code" ? (
              activeFile?.content != null ? (
                <MonacoEditor
                  key={activeFile.path}
                  height="100%"
                  language={languageForPath(activeFile.path)}
                  theme="vs-dark"
                  value={activeFile.content}
                  onChange={(val) => activeFile && schedulePersist(activeFile.path, val ?? "")}
                  onMount={(editor, monaco) => {
                    const model = editor.getModel();
                    if (!model || !activeFile) return;
                    const issues = lintSource(activeFile.path, model.getValue());
                    monaco.editor.setModelMarkers(
                      model,
                      "omniforge-lint",
                      issues.map((iss) => ({
                        startLineNumber: iss.line,
                        endLineNumber: iss.line,
                        startColumn: 1,
                        endColumn: 120,
                        message: iss.message,
                        severity: iss.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
                      })),
                    );
                  }}
                  options={{
                    fontSize: 12,
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 12 },
                    automaticLayout: true,
                  }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                  <FileCode2 className="h-8 w-8 text-zinc-700" />
                  <p className="text-[11px] text-zinc-500">Prompt agent: &quot;Build a todo app website&quot;</p>
                  <p className="text-[9px] text-zinc-600">Files appear here from backend scaffold</p>
                </div>
              )
            ) : previewUrl ? (
              <div className="flex h-full flex-col">
                <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#161920] px-3">
                  <Globe className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="font-mono text-[10px] text-zinc-400">localhost:3000/omni-web-preview</span>
                </div>
                <iframe title="omni-browser-view" src={previewUrl} className="min-h-0 flex-1 border-0 bg-white" sandbox="allow-scripts allow-same-origin" />
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.06] bg-[#161920] px-3">
                  <Globe className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="font-mono text-[10px] text-zinc-400">localhost:3000/omni-web-preview</span>
                </div>
                <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#0c0d12]">
                  <Loader2 className={`h-8 w-8 text-cyan-400/80 ${compiling ? "animate-spin" : ""}`} />
                  <p className="text-[11px] font-medium text-zinc-400">
                    {compiling ? "Live compiling canvas…" : "Waiting for scaffold output…"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <OmniForgeWorkbenchBottomPanel />
        </PanelChrome>

        {/* PANEL 4 — AI AGENT (20%) */}
        {ecosystem?.agentPanelOpen !== false ? (
        <PanelChrome className="w-[20%] border-r-0">
          <PanelHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-200">OmniMind AI Agent</span>
            </div>
          </PanelHeader>
          <div className="border-b border-white/[0.06] px-3 py-1.5">
            <label className="flex cursor-pointer items-center gap-2 text-[9px] text-cyan-300/90">
              <input
                type="checkbox"
                checked={useFreeOpenSourcePipeline}
                onChange={(e) => setUseFreeOpenSourcePipeline(e.target.checked)}
                className="accent-cyan-400"
              />
              Use Free/Open-Source Pipeline
            </label>
          </div>

          <OmniMindDeployStrip onLog={(line) => appendTerminal(line)} />
          <OmniMindDiagnosticPanel />

          <OmniMindAgentPanelExtensions onRestorePrompt={(text) => setChatInput(text)} />

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            <div className="mb-2 flex flex-wrap gap-1">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={!live || sending}
                  onClick={() => setChatInput(q)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[8px] text-zinc-400 transition hover:border-cyan-500/30 hover:text-cyan-300 disabled:opacity-40"
                >
                  {q.length > 28 ? `${q.slice(0, 28)}…` : q}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              {!messages.length ? (
                <div
                  className="mr-auto max-w-[95%] rounded-xl border border-white/[0.06] bg-white/[0.04] px-2.5 py-2 text-[10px] leading-relaxed text-zinc-400 backdrop-blur-md"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
                >
                  {live
                    ? "Agent ready. Try: Build a simple todo app website with React."
                    : `Connect backend at ${OMNIFORGE_API_BASE} then scaffold.`}
                </div>
              ) : null}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[95%] rounded-xl border px-2.5 py-2 text-[10px] leading-relaxed backdrop-blur-md ${
                    msg.role === "user"
                      ? "ml-auto border-indigo-500/25 bg-indigo-500/10 text-zinc-200"
                      : "mr-auto border-white/[0.06] bg-white/[0.04] text-zinc-300"
                  }`}
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
                >
                  {msg.content || (msg.streaming ? "…" : "")}
                  {msg.streaming ? <Loader2 className="mt-1 inline h-3 w-3 animate-spin" /> : null}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-white/[0.06] bg-[rgba(14,16,24,0.98)] p-2">
            <div className="flex flex-col gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleAskAgent();
                  }
                }}
                rows={3}
                placeholder={live ? "Build a website, fix code, explain…" : "Backend offline…"}
                disabled={!live || sending}
                className="w-full resize-none rounded-lg border border-white/[0.08] bg-[#0a0b10] px-2.5 py-2 text-[10px] text-zinc-200 outline-none ring-cyan-500/30 placeholder:text-zinc-600 focus:ring-1 disabled:opacity-50"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void handleAskAgent()}
                  disabled={!live || !chatInput.trim() || sending}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Ask Agent
                </button>
              </div>
            </div>
          </div>
        </PanelChrome>
        ) : null}
      </div>
    </div>
  );
}
