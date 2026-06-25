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
import { SAMPLE_LAYERS, SAMPLE_TRACKS } from "./constants";
import type {
  CanvasLayer,
  CanvasTool,
  CopilotMessage,
  HistoryEntry,
  InspectorTab,
  PanelDockState,
  SystemMetrics,
  TimelineMarker,
  TimelineTrack,
  VersionSnapshot,
  VisionaryProject,
  VisionarySidebarModule,
} from "./types";

export type VisionaryStudioContextValue = {
  project: VisionaryProject;
  setProjectName: (name: string) => void;
  activeModule: VisionarySidebarModule;
  setActiveModule: (m: VisionarySidebarModule) => void;
  inspectorTab: InspectorTab;
  setInspectorTab: (t: InspectorTab) => void;
  dock: PanelDockState;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleTimeline: () => void;
  setAssetDrawerOpen: (open: boolean) => void;
  canvasTool: CanvasTool;
  setCanvasTool: (t: CanvasTool) => void;
  canvasZoom: number;
  setCanvasZoom: React.Dispatch<React.SetStateAction<number>>;
  canvasPan: { x: number; y: number };
  setCanvasPan: (p: { x: number; y: number }) => void;
  snapGrid: boolean;
  setSnapGrid: (on: boolean) => void;
  showGuides: boolean;
  setShowGuides: (on: boolean) => void;
  layers: CanvasLayer[];
  selectedLayerIds: string[];
  setSelectedLayerIds: (ids: string[]) => void;
  toggleLayerVisibility: (id: string) => void;
  tracks: TimelineTrack[];
  playheadFrame: number;
  setPlayheadFrame: (f: number) => void;
  timelineZoom: number;
  setTimelineZoom: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  markers: TimelineMarker[];
  addMarker: (label: string) => void;
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  pushHistory: (label: string, kind?: HistoryEntry["kind"]) => void;
  undo: () => void;
  redo: () => void;
  versions: VersionSnapshot[];
  autoSaveStatus: "saved" | "saving" | "dirty";
  metrics: SystemMetrics;
  copilotOpen: boolean;
  setCopilotOpen: (open: boolean) => void;
  copilotMessages: CopilotMessage[];
  sendCopilotMessage: (content: string) => void;
  notifications: number;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
};

const VisionaryStudioContext = createContext<VisionaryStudioContextValue | null>(null);

const INITIAL_PROJECT: VisionaryProject = {
  id: "proj-visionary-001",
  name: "Untitled Creative Project",
  resolution: { width: 3840, height: 2160 },
  fps: 30,
  durationFrames: 900,
  modifiedAt: new Date().toISOString(),
  savedAt: null,
};

const INITIAL_METRICS: SystemMetrics = {
  gpuPct: 34,
  cpuPct: 22,
  memoryMb: 4820,
  memoryTotalMb: 16384,
  rendering: "idle",
  cloudSync: "synced",
  backgroundTasks: 2,
};

export function VisionaryStudioProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<VisionaryProject>(INITIAL_PROJECT);
  const [activeModule, setActiveModule] = useState<VisionarySidebarModule>("ai-creator");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("properties");
  const [dock, setDock] = useState<PanelDockState>({
    leftCollapsed: false,
    rightCollapsed: false,
    timelineCollapsed: false,
    assetDrawerOpen: false,
  });
  const [canvasTool, setCanvasTool] = useState<CanvasTool>("select");
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [snapGrid, setSnapGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [layers, setLayers] = useState<CanvasLayer[]>(SAMPLE_LAYERS);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>(["l-hero"]);
  const [tracks] = useState<TimelineTrack[]>(SAMPLE_TRACKS);
  const [playheadFrame, setPlayheadFrame] = useState(0);
  const [timelineZoom, setTimelineZoom] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markers, setMarkers] = useState<TimelineMarker[]>([
    { id: "m1", frame: 0, label: "Intro", color: "#38bdf8" },
    { id: "m2", frame: 300, label: "Beat Drop", color: "#f472b6" },
  ]);
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([
    { id: "h0", label: "Project initialized", timestamp: new Date().toISOString(), kind: "edit" },
  ]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  const [versions, setVersions] = useState<VersionSnapshot[]>([
    { id: "v1", label: "Initial composition", timestamp: new Date().toISOString(), auto: true },
  ]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "dirty">("saved");
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
    {
      id: "c0",
      role: "assistant",
      content:
        "Visionary Copilot online. I can navigate your timeline, explain tools, and prepare asset workflows — generation models connect in a future phase.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [globalSearch, setGlobalSearch] = useState("");
  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushHistory = useCallback((label: string, kind: HistoryEntry["kind"] = "edit") => {
    const entry: HistoryEntry = {
      id: `h-${Date.now()}`,
      label,
      timestamp: new Date().toISOString(),
      kind,
    };
    setUndoStack((prev) => [entry, ...prev].slice(0, 50));
    setRedoStack([]);
    setAutoSaveStatus("dirty");
    setProject((p) => ({ ...p, modifiedAt: new Date().toISOString() }));
  }, []);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length <= 1) return prev;
      const [head, ...rest] = prev;
      setRedoStack((r) => [head!, ...r]);
      return rest;
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const [head, ...rest] = prev;
      setUndoStack((u) => [head!, ...u]);
      return rest;
    });
  }, []);

  const setProjectName = useCallback((name: string) => {
    setProject((p) => ({ ...p, name, modifiedAt: new Date().toISOString() }));
    pushHistory(`Renamed project to "${name}"`);
  }, [pushHistory]);

  const toggleLeftPanel = useCallback(() => {
    setDock((d) => ({ ...d, leftCollapsed: !d.leftCollapsed }));
  }, []);

  const toggleRightPanel = useCallback(() => {
    setDock((d) => ({ ...d, rightCollapsed: !d.rightCollapsed }));
  }, []);

  const toggleTimeline = useCallback(() => {
    setDock((d) => ({ ...d, timelineCollapsed: !d.timelineCollapsed }));
  }, []);

  const setAssetDrawerOpen = useCallback((open: boolean) => {
    setDock((d) => ({ ...d, assetDrawerOpen: open }));
  }, []);

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    );
    pushHistory("Toggled layer visibility");
  }, [pushHistory]);

  const addMarker = useCallback(
    (label: string) => {
      setMarkers((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          frame: playheadFrame,
          label,
          color: "#67e8f9",
        },
      ]);
      pushHistory(`Added marker: ${label}`, "timeline");
    },
    [playheadFrame, pushHistory],
  );

  const sendCopilotMessage = useCallback((content: string) => {
    const userMsg: CopilotMessage = {
      id: `c-u-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    setCopilotMessages((prev) => [...prev, userMsg]);
    const reply: CopilotMessage = {
      id: `c-a-${Date.now()}`,
      role: "assistant",
      content: `Understood. "${content.slice(0, 80)}${content.length > 80 ? "…" : ""}" — I queued this for the ${activeModule.replace(/-/g, " ")} pipeline. Layer and timeline APIs are wired; generative models ship in Phase 2.`,
      timestamp: new Date().toISOString(),
    };
    setTimeout(() => {
      setCopilotMessages((prev) => [...prev, reply]);
    }, 400);
  }, [activeModule]);

  useEffect(() => {
    if (!isPlaying) {
      if (playInterval.current) clearInterval(playInterval.current);
      return;
    }
    playInterval.current = setInterval(() => {
      setPlayheadFrame((f) => {
        if (f >= project.durationFrames - 1) {
          setIsPlaying(false);
          return 0;
        }
        return f + 1;
      });
    }, 1000 / project.fps);
    return () => {
      if (playInterval.current) clearInterval(playInterval.current);
    };
  }, [isPlaying, project.durationFrames, project.fps]);

  useEffect(() => {
    if (autoSaveStatus !== "dirty") return;
    const t = setTimeout(() => {
      setAutoSaveStatus("saving");
      setTimeout(() => {
        setAutoSaveStatus("saved");
        setProject((p) => ({ ...p, savedAt: new Date().toISOString() }));
        setVersions((v) => [
          { id: `v-${Date.now()}`, label: "Auto-save snapshot", timestamp: new Date().toISOString(), auto: true },
          ...v,
        ].slice(0, 20));
      }, 600);
    }, 2000);
    return () => clearTimeout(t);
  }, [autoSaveStatus, project.modifiedAt]);

  useEffect(() => {
    const t = setInterval(() => {
      setMetrics((m) => ({
        ...m,
        gpuPct: Math.min(98, Math.max(8, m.gpuPct + (Math.random() > 0.5 ? 2 : -2))),
        cpuPct: Math.min(92, Math.max(12, m.cpuPct + (Math.random() > 0.5 ? 1 : -1))),
      }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const value = useMemo<VisionaryStudioContextValue>(
    () => ({
      project,
      setProjectName,
      activeModule,
      setActiveModule,
      inspectorTab,
      setInspectorTab,
      dock,
      toggleLeftPanel,
      toggleRightPanel,
      toggleTimeline,
      setAssetDrawerOpen,
      canvasTool,
      setCanvasTool,
      canvasZoom,
      setCanvasZoom,
      canvasPan,
      setCanvasPan,
      snapGrid,
      setSnapGrid,
      showGuides,
      setShowGuides,
      layers,
      selectedLayerIds,
      setSelectedLayerIds,
      toggleLayerVisibility,
      tracks,
      playheadFrame,
      setPlayheadFrame,
      timelineZoom,
      setTimelineZoom,
      isPlaying,
      setIsPlaying,
      markers,
      addMarker,
      undoStack,
      redoStack,
      pushHistory,
      undo,
      redo,
      versions,
      autoSaveStatus,
      metrics,
      copilotOpen,
      setCopilotOpen,
      copilotMessages,
      sendCopilotMessage,
      notifications: 3,
      globalSearch,
      setGlobalSearch,
    }),
    [
      project,
      setProjectName,
      activeModule,
      inspectorTab,
      dock,
      toggleLeftPanel,
      toggleRightPanel,
      toggleTimeline,
      setAssetDrawerOpen,
      canvasTool,
      canvasZoom,
      canvasPan,
      snapGrid,
      showGuides,
      layers,
      selectedLayerIds,
      toggleLayerVisibility,
      tracks,
      playheadFrame,
      timelineZoom,
      isPlaying,
      markers,
      addMarker,
      undoStack,
      redoStack,
      pushHistory,
      undo,
      redo,
      versions,
      autoSaveStatus,
      metrics,
      copilotOpen,
      copilotMessages,
      sendCopilotMessage,
      globalSearch,
    ],
  );

  return (
    <VisionaryStudioContext.Provider value={value}>{children}</VisionaryStudioContext.Provider>
  );
}

export function useVisionaryStudio() {
  const ctx = useContext(VisionaryStudioContext);
  if (!ctx) throw new Error("useVisionaryStudio must be used within VisionaryStudioProvider");
  return ctx;
}
