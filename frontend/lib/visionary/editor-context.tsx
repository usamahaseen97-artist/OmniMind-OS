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
import {
  AI_EDIT_ACTIONS,
  DEFAULT_COLOR_GRADE,
  EDITOR_TRACK_COLORS,
  EXPORT_PRESETS,
  SEED_MEDIA,
  autoSaveManager,
  clipManager,
  timelineEngine,
  trackManager,
  visionaryEditorApi,
} from "./editor";
import type {
  AIEditAction,
  AIEditTask,
  AudioMix,
  AutoSaveState,
  ColorGrade,
  EditTool,
  EditorClip,
  EditorHistoryEntry,
  EditorInspectorTab,
  EditorProject,
  EditorTimelineMarker,
  EditorTimelineRegion,
  EditorTrackType,
  ExportJob,
  Keyframe,
  MediaPoolItem,
  PlaybackSettings,
  SubtitleCue,
  TextLayer,
  TimelineViewState,
} from "./editor/types";

function buildSeedProject(): EditorProject {
  let tracks = trackManager.addTrack([], "video");
  tracks = trackManager.addTrack(tracks, "video");
  tracks = trackManager.addTrack(tracks, "audio");
  tracks = trackManager.addTrack(tracks, "subtitle");
  tracks = trackManager.addTrack(tracks, "overlay");
  tracks = trackManager.addTrack(tracks, "adjustment");

  tracks = clipManager.addClip(tracks, tracks[0]!.id, SEED_MEDIA[0]!, 0);
  tracks = clipManager.addClip(tracks, tracks[2]!.id, SEED_MEDIA[1]!, 0);
  tracks = clipManager.addClip(tracks, tracks[4]!.id, SEED_MEDIA[3]!, 120);

  return {
    id: "proj-visionary-001",
    name: "Untitled Sequence",
    resolution: { width: 3840, height: 2160 },
    fps: 30,
    durationFrames: 1800,
    tracks,
    markers: [
      { id: "mk-1", frame: 0, label: "Intro", color: "#38bdf8" },
      { id: "mk-2", frame: 300, label: "Scene 2", color: "#f472b6" },
    ],
    regions: [{ id: "rg-1", startFrame: 0, endFrame: 300, label: "Act I", color: "#a78bfa33" }],
    nestedSequences: [],
    mediaIds: SEED_MEDIA.map((m) => m.id),
    modifiedAt: new Date().toISOString(),
    savedAt: null,
    version: 1,
  };
}

function buildSeedMedia(): MediaPoolItem[] {
  return SEED_MEDIA.map((m) => ({
    id: m.id,
    name: m.name,
    kind: m.kind,
    durationFrames: m.durationFrames,
    fps: 30,
    width: 1920,
    height: 1080,
    sizeBytes: 12_000_000,
    tags: m.kind === "brand" ? ["brand"] : [],
    favorite: m.id === "med-1",
    collectionId: null,
    importedAt: new Date().toISOString(),
    thumbnailColor: m.color,
  }));
}

export type VisionaryEditorContextValue = {
  project: EditorProject;
  timelineView: TimelineViewState;
  setTimelineView: React.Dispatch<React.SetStateAction<TimelineViewState>>;
  playback: PlaybackSettings;
  setPlayback: React.Dispatch<React.SetStateAction<PlaybackSettings>>;
  editTool: EditTool;
  setEditTool: (t: EditTool) => void;
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  inspectorTab: EditorInspectorTab;
  setInspectorTab: (t: EditorInspectorTab) => void;
  mediaPool: MediaPoolItem[];
  mediaSearch: string;
  setMediaSearch: (q: string) => void;
  importMedia: (kind: MediaPoolItem["kind"]) => void;
  toggleFavorite: (id: string) => void;
  addTrack: (type: EditorTrackType) => void;
  removeTrack: (trackId: string) => void;
  addClipFromMedia: (mediaId: string, trackId?: string) => void;
  splitAtPlayhead: () => void;
  deleteSelectedClip: () => void;
  joinSelectedWithNext: () => void;
  movePlayhead: (frame: number) => void;
  stepFrame: (delta: number) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  addMarker: (label?: string) => void;
  addRegion: (label: string) => void;
  applyEffect: (effectId: string) => void;
  applyTransition: (transitionId: string, edge: "in" | "out") => void;
  colorGrade: ColorGrade;
  setColorGrade: React.Dispatch<React.SetStateAction<ColorGrade>>;
  audioMix: AudioMix | null;
  setAudioMix: React.Dispatch<React.SetStateAction<AudioMix | null>>;
  textLayers: TextLayer[];
  addTextLayer: (templateId: string) => void;
  subtitles: SubtitleCue[];
  addSubtitle: () => void;
  keyframes: Keyframe[];
  addKeyframe: (property: string, value: number) => void;
  exportJobs: ExportJob[];
  queueExport: (presetId: string) => void;
  cancelExport: (jobId: string) => void;
  aiTasks: AIEditTask[];
  runAIAction: (action: AIEditAction) => void;
  editorHistory: EditorHistoryEntry[];
  pushHistory: (label: string) => void;
  undo: () => void;
  redo: () => void;
  autoSave: AutoSaveState;
  timecode: (frame: number) => string;
  selectedClip: EditorClip | null;
};

const VisionaryEditorContext = createContext<VisionaryEditorContextValue | null>(null);

export function VisionaryEditorProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<EditorProject>(buildSeedProject);
  const [timelineView, setTimelineView] = useState<TimelineViewState>({
    playheadFrame: 0,
    zoom: 100,
    scrollX: 0,
    snapEnabled: true,
    magneticEnabled: true,
    loopEnabled: false,
    inPoint: null,
    outPoint: null,
  });
  const [playback, setPlayback] = useState<PlaybackSettings>({
    state: "stopped",
    speed: 1,
    quality: "half",
    showSafeMargins: true,
    showGrid: false,
    fullscreen: false,
  });
  const [editTool, setEditTool] = useState<EditTool>("select");
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<EditorInspectorTab>("clip");
  const [mediaPool, setMediaPool] = useState<MediaPoolItem[]>(buildSeedMedia);
  const [mediaSearch, setMediaSearch] = useState("");
  const [colorGrade, setColorGrade] = useState<ColorGrade>(DEFAULT_COLOR_GRADE);
  const [audioMix, setAudioMix] = useState<AudioMix | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([
    { id: "sub-1", startFrame: 30, endFrame: 90, text: "Welcome to Visionary Studio", speaker: null },
  ]);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [aiTasks, setAITasks] = useState<AIEditTask[]>([]);
  const [editorHistory, setEditorHistory] = useState<EditorHistoryEntry[]>([
    { id: "eh-0", label: "Project opened", timestamp: new Date().toISOString(), snapshotId: null },
  ]);
  const [undoStack, setUndoStack] = useState<EditorProject[]>([]);
  const [redoStack, setRedoStack] = useState<EditorProject[]>([]);
  const [autoSave, setAutoSave] = useState<AutoSaveState>(autoSaveManager.getState());
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pushHistory = useCallback((label: string) => {
    setEditorHistory((prev) => [
      { id: `eh-${Date.now()}`, label, timestamp: new Date().toISOString(), snapshotId: null },
      ...prev,
    ].slice(0, 100));
  }, []);

  const commitProject = useCallback(
    (updater: (p: EditorProject) => EditorProject, label: string) => {
      setProject((prev) => {
        setUndoStack((u) => [prev, ...u].slice(0, 30));
        setRedoStack([]);
        const next = updater(prev);
        const version = next.version + 1;
        const updated = { ...next, version, modifiedAt: new Date().toISOString() };
        autoSaveManager.markDirty(version);
        void visionaryEditorApi.saveProject(updated).catch(() => undefined);
        return updated;
      });
      pushHistory(label);
    },
    [pushHistory],
  );

  const undo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const [head, ...rest] = u;
      setProject((cur) => {
        setRedoStack((r) => [cur, ...r]);
        return head!;
      });
      pushHistory("Undo");
      return rest;
    });
  }, [pushHistory]);

  const redo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const [head, ...rest] = r;
      setProject((cur) => {
        setUndoStack((u) => [cur, ...u]);
        return head!;
      });
      pushHistory("Redo");
      return rest;
    });
  }, [pushHistory]);

  useEffect(() => {
    const unsub = autoSaveManager.subscribe(setAutoSave);
    void visionaryEditorApi.loadProject(project.id).catch(() => undefined);
    return () => {
      unsub();
    };
  }, [project.id]);

  useEffect(() => {
    if (playback.state !== "playing") {
      if (playRef.current) clearInterval(playRef.current);
      return;
    }
    const interval = 1000 / (project.fps * playback.speed);
    playRef.current = setInterval(() => {
      setTimelineView((v) => {
        const max = timelineEngine.computeDuration(project.tracks);
        let next = v.playheadFrame + 1;
        if (next >= max) {
          if (v.loopEnabled) next = 0;
          else {
            setPlayback((p) => ({ ...p, state: "paused" }));
            return v;
          }
        }
        return { ...v, playheadFrame: next };
      });
    }, interval);
    return () => {
      if (playRef.current) clearInterval(playRef.current);
    };
  }, [playback.state, playback.speed, project.fps, project.tracks, timelineView.loopEnabled]);

  useEffect(() => {
    const clip = selectedClipId ? clipManager.getClip(project.tracks, selectedClipId) : null;
    if (clip) {
      setAudioMix({
        clipId: clip.id,
        gainDb: 0,
        normalized: false,
        noiseReduction: false,
        fadeInFrames: 0,
        fadeOutFrames: 0,
        eqEnabled: false,
        compressionEnabled: false,
        voiceEnhanceEnabled: false,
      });
    }
  }, [selectedClipId, project.tracks]);

  const selectedClip = selectedClipId
    ? clipManager.getClip(project.tracks, selectedClipId) ?? null
    : null;

  const addTrack = useCallback(
    (type: EditorTrackType) => {
      commitProject((p) => ({ ...p, tracks: trackManager.addTrack(p.tracks, type) }), `Add ${type} track`);
    },
    [commitProject],
  );

  const addClipFromMedia = useCallback(
    (mediaId: string, trackId?: string) => {
      const media = mediaPool.find((m) => m.id === mediaId);
      if (!media) return;
      const typeMap: Record<string, EditorTrackType> = {
        video: "video",
        audio: "audio",
        image: "overlay",
        gif: "overlay",
        png: "overlay",
        psd: "overlay",
        svg: "overlay",
        "3d": "overlay",
        brand: "overlay",
      };
      const trackType = typeMap[media.kind] ?? "video";
      commitProject((p) => {
        let tracks = p.tracks;
        let tid = trackId;
        if (!tid) {
          const existing = tracks.find((t) => t.type === trackType && !t.locked);
          tid = existing?.id;
          if (!tid) {
            tracks = trackManager.addTrack(tracks, trackType);
            tid = tracks[tracks.length - 1]!.id;
          }
        }
        tracks = clipManager.addClip(tracks, tid!, media, timelineView.playheadFrame);
        return { ...p, tracks, durationFrames: timelineEngine.computeDuration(tracks) };
      }, `Insert ${media.name}`);
      setSelectedClipId(null);
    },
    [commitProject, mediaPool, timelineView.playheadFrame],
  );

  const splitAtPlayhead = useCallback(() => {
    if (!selectedClipId) return;
    const clip = clipManager.getClip(project.tracks, selectedClipId);
    if (!clip) return;
    const frame = timelineView.playheadFrame;
    if (frame <= clip.startFrame || frame >= clip.startFrame + clip.durationFrames) return;
    commitProject(
      (p) => ({ ...p, tracks: clipManager.splitClip(p.tracks, selectedClipId, frame) }),
      "Split clip",
    );
  }, [commitProject, project.tracks, selectedClipId, timelineView.playheadFrame]);

  const deleteSelectedClip = useCallback(() => {
    if (!selectedClipId) return;
    commitProject(
      (p) => ({ ...p, tracks: clipManager.removeClip(p.tracks, selectedClipId) }),
      "Delete clip",
    );
    setSelectedClipId(null);
  }, [commitProject, selectedClipId]);

  const joinSelectedWithNext = useCallback(() => {
    if (!selectedClipId) return;
    const track = project.tracks.find((t) => t.clips.some((c) => c.id === selectedClipId));
    if (!track) return;
    const idx = track.clips.findIndex((c) => c.id === selectedClipId);
    const next = track.clips[idx + 1];
    if (!next) return;
    commitProject(
      (p) => ({ ...p, tracks: clipManager.joinClips(p.tracks, selectedClipId, next.id) }),
      "Join clips",
    );
  }, [commitProject, project.tracks, selectedClipId]);

  const movePlayhead = useCallback(
    (frame: number) => {
      const snapped = timelineEngine.snapFrame(frame, timelineView.snapEnabled, project.fps);
      setTimelineView((v) => ({ ...v, playheadFrame: Math.max(0, snapped) }));
    },
    [project.fps, timelineView.snapEnabled],
  );

  const stepFrame = useCallback((delta: number) => {
    setTimelineView((v) => ({ ...v, playheadFrame: Math.max(0, v.playheadFrame + delta) }));
  }, []);

  const play = useCallback(() => setPlayback((p) => ({ ...p, state: "playing" })), []);
  const pause = useCallback(() => setPlayback((p) => ({ ...p, state: "paused" })), []);
  const stop = useCallback(() => {
    setPlayback((p) => ({ ...p, state: "stopped" }));
    setTimelineView((v) => ({ ...v, playheadFrame: 0 }));
  }, []);

  const addMarker = useCallback(
    (label = "Marker") => {
      commitProject(
        (p) => timelineEngine.addMarker(p, timelineView.playheadFrame, label),
        `Add marker: ${label}`,
      );
    },
    [commitProject, timelineView.playheadFrame],
  );

  const addRegion = useCallback(
    (label: string) => {
      commitProject(
        (p) =>
          timelineEngine.addRegion(p, timelineView.playheadFrame, timelineView.playheadFrame + project.fps * 5, label),
        `Add region: ${label}`,
      );
    },
    [commitProject, project.fps, timelineView.playheadFrame],
  );

  const applyEffect = useCallback(
    (effectId: string) => {
      if (!selectedClipId) return;
      commitProject(
        (p) => ({ ...p, tracks: clipManager.applyEffect(p.tracks, selectedClipId, effectId) }),
        `Apply effect`,
      );
    },
    [commitProject, selectedClipId],
  );

  const applyTransition = useCallback(
    (transitionId: string, edge: "in" | "out") => {
      if (!selectedClipId) return;
      commitProject((p) => ({
        ...p,
        tracks: p.tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === selectedClipId
              ? edge === "in"
                ? { ...c, transitionInId: transitionId }
                : { ...c, transitionOutId: transitionId }
              : c,
          ),
        })),
      }), `Apply transition`);
    },
    [commitProject, selectedClipId],
  );

  const importMedia = useCallback((kind: MediaPoolItem["kind"]) => {
    const id = `med-${Date.now()}`;
    const item: MediaPoolItem = {
      id,
      name: `Import_${kind}_${id.slice(-4)}`,
      kind,
      durationFrames: kind === "audio" ? 600 : 150,
      fps: 30,
      width: 1920,
      height: 1080,
      sizeBytes: 5_000_000,
      tags: [],
      favorite: false,
      collectionId: null,
      importedAt: new Date().toISOString(),
      thumbnailColor: EDITOR_TRACK_COLORS[kind === "audio" ? "audio" : "video"] ?? "#64748b",
    };
    setMediaPool((prev) => [item, ...prev]);
    void visionaryEditorApi.importMedia(project.id, item);
    pushHistory(`Import ${kind}`);
  }, [project.id, pushHistory]);

  const toggleFavorite = useCallback((id: string) => {
    setMediaPool((prev) => prev.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m)));
  }, []);

  const removeTrack = useCallback(
    (trackId: string) => {
      commitProject((p) => ({ ...p, tracks: trackManager.removeTrack(p.tracks, trackId) }), "Remove track");
    },
    [commitProject],
  );

  const addTextLayer = useCallback(
    (templateId: string) => {
      const layer: TextLayer = {
        id: `txt-${Date.now()}`,
        clipId: selectedClipId ?? "",
        content: "Your Title Here",
        templateId,
        fontFamily: "Inter",
        fontSize: 48,
        color: "#ffffff",
        alignment: "center",
        animated: templateId === "tt-kinetic",
        lowerThird: templateId === "tt-lower",
      };
      setTextLayers((prev) => [...prev, layer]);
      pushHistory("Add text layer");
    },
    [pushHistory, selectedClipId],
  );

  const addSubtitle = useCallback(() => {
    setSubtitles((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        startFrame: timelineView.playheadFrame,
        endFrame: timelineView.playheadFrame + project.fps * 3,
        text: "New caption",
        speaker: null,
      },
    ]);
    pushHistory("Add subtitle");
  }, [project.fps, pushHistory, timelineView.playheadFrame]);

  const addKeyframe = useCallback(
    (property: string, value: number) => {
      if (!selectedClipId) return;
      setKeyframes((prev) => [
        ...prev,
        {
          id: `kf-${Date.now()}`,
          clipId: selectedClipId,
          property,
          frame: timelineView.playheadFrame,
          value,
          easing: "bezier",
        },
      ]);
      pushHistory(`Keyframe ${property}`);
    },
    [pushHistory, selectedClipId, timelineView.playheadFrame],
  );

  const queueExport = useCallback(
    (presetId: string) => {
      const preset = EXPORT_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;
      const job: ExportJob = {
        id: `exp-${Date.now()}`,
        projectId: project.id,
        presetId,
        platform: preset.platform,
        resolution: preset.resolution,
        hdr: preset.hdr,
        status: "queued",
        progress: 0,
        createdAt: new Date().toISOString(),
        estimatedSeconds: 120,
      };
      setExportJobs((prev) => [job, ...prev]);
      void visionaryEditorApi.queueExport(job);
      pushHistory(`Queue export: ${preset.label}`);
    },
    [project.id, pushHistory],
  );

  const cancelExport = useCallback((jobId: string) => {
    setExportJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "cancelled" as const } : j)),
    );
    void visionaryEditorApi.cancelExport(jobId);
  }, []);

  const runAIAction = useCallback(
    (action: AIEditAction) => {
      const task: AIEditTask = {
        id: `ai-${Date.now()}`,
        action,
        status: "running",
        progress: 0,
        resultSummary: null,
      };
      setAITasks((prev) => [task, ...prev]);
      const actionMeta = AI_EDIT_ACTIONS.find((a) => a.id === action);
      let progress = 0;
      const t = setInterval(() => {
        progress += 25;
        if (progress >= 100) {
          clearInterval(t);
          setAITasks((prev) =>
            prev.map((x) =>
              x.id === task.id
                ? {
                    ...x,
                    status: "completed",
                    progress: 100,
                    resultSummary: `${actionMeta?.label} — architecture stub complete`,
                  }
                : x,
            ),
          );
          if (action === "auto-captions") addSubtitle();
          if (action === "chapter-detection") addMarker("Chapter");
          pushHistory(`AI: ${actionMeta?.label}`);
        } else {
          setAITasks((prev) =>
            prev.map((x) => (x.id === task.id ? { ...x, progress } : x)),
          );
        }
      }, 400);
    },
    [addMarker, addSubtitle, pushHistory],
  );

  const timecode = useCallback(
    (frame: number) => timelineEngine.frameToTimecode(frame, project.fps),
    [project.fps],
  );

  const value = useMemo<VisionaryEditorContextValue>(
    () => ({
      project,
      timelineView,
      setTimelineView,
      playback,
      setPlayback,
      editTool,
      setEditTool,
      selectedClipId,
      setSelectedClipId,
      inspectorTab,
      setInspectorTab,
      mediaPool,
      mediaSearch,
      setMediaSearch,
      importMedia,
      toggleFavorite,
      addTrack,
      removeTrack,
      addClipFromMedia,
      splitAtPlayhead,
      deleteSelectedClip,
      joinSelectedWithNext,
      movePlayhead,
      stepFrame,
      play,
      pause,
      stop,
      addMarker,
      addRegion,
      applyEffect,
      applyTransition,
      colorGrade,
      setColorGrade,
      audioMix,
      setAudioMix,
      textLayers,
      addTextLayer,
      subtitles,
      addSubtitle,
      keyframes,
      addKeyframe,
      exportJobs,
      queueExport,
      cancelExport,
      aiTasks,
      runAIAction,
      editorHistory,
      pushHistory,
      undo,
      redo,
      autoSave,
      timecode,
      selectedClip,
    }),
    [
      project,
      timelineView,
      playback,
      editTool,
      selectedClipId,
      inspectorTab,
      mediaPool,
      mediaSearch,
      importMedia,
      toggleFavorite,
      addTrack,
      removeTrack,
      addClipFromMedia,
      splitAtPlayhead,
      deleteSelectedClip,
      joinSelectedWithNext,
      movePlayhead,
      stepFrame,
      play,
      pause,
      stop,
      addMarker,
      addRegion,
      applyEffect,
      applyTransition,
      colorGrade,
      audioMix,
      textLayers,
      addTextLayer,
      subtitles,
      addSubtitle,
      keyframes,
      addKeyframe,
      exportJobs,
      queueExport,
      cancelExport,
      aiTasks,
      runAIAction,
      editorHistory,
      pushHistory,
      undo,
      redo,
      autoSave,
      timecode,
      selectedClip,
    ],
  );

  return <VisionaryEditorContext.Provider value={value}>{children}</VisionaryEditorContext.Provider>;
}

export function useVisionaryEditor() {
  const ctx = useContext(VisionaryEditorContext);
  if (!ctx) throw new Error("useVisionaryEditor must be used within VisionaryEditorProvider");
  return ctx;
}
