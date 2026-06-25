"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  AudioDeviceInfo,
  AudioRegion,
  AudioSettings,
  ExtendedTransportState,
  InputSource,
  ProjectRecoverySnapshot,
  RecordingSessionState,
  TimeDisplayMode,
  WaveformData,
  WaveformEditOp,
  WaveformSelection,
  WaveformViewState,
} from "./audio-types";
import type { OmniMusicAudioContextSlice } from "./audio-context-types";
import type { DawTrack, OmniMusicProject, TimelineClip } from "./types";
import {
  audioCacheEngine,
  audioDeviceManagerEngine,
  audioSessionCoordinator,
  clipProcessorEngine,
  createDefaultTransport,
  formatTransportTime,
  projectRecoveryEngine,
  tempoManagerEngine,
  trackEngine,
  transportEngine,
  undoHistoryEngine,
} from "./audio";
import { omnimusicStudioApi } from "./studio-api";

type BridgeDeps = {
  project: OmniMusicProject;
  setProject: Dispatch<SetStateAction<OmniMusicProject>>;
  commit: (updater: (p: OmniMusicProject) => OmniMusicProject, undoLabel?: string) => void;
};

export function useOmniMusicAudioBridge({ project, setProject, commit }: BridgeDeps): OmniMusicAudioContextSlice {
  const sessionRef = useRef(audioSessionCoordinator);
  const [audioReady, setAudioReady] = useState(false);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(sessionRef.current.settings);
  const [audioDevices, setAudioDevices] = useState<AudioDeviceInfo[]>([]);
  const [transport, setTransport] = useState<ExtendedTransportState>(() => ({
    ...createDefaultTransport(),
    tempo: project.tempo,
    timeSignature: project.timeSignature,
  }));
  const [recording, setRecording] = useState<RecordingSessionState>(sessionRef.current.recording);
  const [waveforms, setWaveforms] = useState<Record<string, WaveformData>>({});
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [waveformView, setWaveformView] = useState<WaveformViewState>({
    zoom: 1,
    snapEnabled: true,
    snapDivision: 16,
    selection: null,
    regions: [],
  });
  const [recoverySnapshots, setRecoverySnapshots] = useState<ProjectRecoverySnapshot[]>([]);
  const [undoLabels, setUndoLabels] = useState<string[]>([]);

  const refreshWaveforms = useCallback(() => {
    setWaveforms({ ...audioCacheEngine.all() });
  }, []);

  const refreshDevices = useCallback(async () => {
    const devices = await audioDeviceManagerEngine.enumerate();
    setAudioDevices(devices);
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      await sessionRef.current.init();
      if (!mounted) return;
      setAudioReady(!!sessionRef.current.context);
      sessionRef.current.seedWaveforms(project.clips, project.tempo);
      refreshWaveforms();
      setRecoverySnapshots(projectRecoveryEngine.list(project.id));
      await refreshDevices();
    })();
    const autosave = setInterval(() => {
      sessionRef.current.autosave(project);
      void omnimusicStudioApi.saveRecoverySnapshot(project, "autosave").catch(() => undefined);
      setRecoverySnapshots(projectRecoveryEngine.list(project.id));
    }, 30000);
    return () => {
      mounted = false;
      clearInterval(autosave);
      sessionRef.current.dispose();
    };
  }, [project.id, refreshDevices, refreshWaveforms]);

  useEffect(() => {
    sessionRef.current.seedWaveforms(project.clips, project.tempo);
    refreshWaveforms();
  }, [project.clips, project.tempo, refreshWaveforms]);

  useEffect(() => {
    if (transport.status !== "playing" && transport.status !== "recording") return;
    const iv = setInterval(() => {
      setTransport((t) => {
        const next = transportEngine.advance(t, 0.25);
        if (recording.punchOut !== null && next.playheadBeat >= recording.punchOut && t.recording) {
          void stopRecordingRef.current?.();
        }
        return next;
      });
    }, 125);
    return () => clearInterval(iv);
  }, [transport.status, transport.loopEnabled, transport.loopStart, transport.loopEnd, transport.playbackSpeed, recording.punchOut]);

  const stopRecordingRef = useRef<(() => Promise<void>) | null>(null);

  const syncTransportToProject = useCallback(
    (t: ExtendedTransportState) => {
      setProject((p) => ({ ...p, tempo: t.tempo, timeSignature: t.timeSignature }));
      void omnimusicStudioApi.saveTransport(project.id, t).catch(() => undefined);
    },
    [project.id, setProject],
  );

  const play = useCallback(() => {
    const t = sessionRef.current.play(project.clips);
    setTransport(t);
    syncTransportToProject(t);
  }, [project.clips, syncTransportToProject]);

  const pause = useCallback(() => {
    const t = sessionRef.current.pause();
    setTransport(t);
  }, []);

  const stop = useCallback(() => {
    const t = sessionRef.current.stop();
    setTransport(t);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (transport.playing) pause();
    else play();
  }, [transport.playing, play, pause]);

  const stopRecording = useCallback(async () => {
    const result = await sessionRef.current.stopRecording(project.tracks, project.clips, transport.tempo);
    setTransport(result.transport);
    setRecording((r) => ({ ...r, ...sessionRef.current.recording, takes: result.takes, active: false }));
    commit((p) => ({ ...p, clips: result.clips }), "Record take");
    refreshWaveforms();
    void omnimusicStudioApi.saveRecordingSession(project.id, result.takes).catch(() => undefined);
  }, [project, transport.tempo, commit, refreshWaveforms]);

  stopRecordingRef.current = stopRecording;

  const toggleRecord = useCallback(async () => {
    if (transport.recording || recording.active) {
      await stopRecording();
      return;
    }
    if (recording.countIn > 0) {
      setRecording((r) => ({ ...r, countInRemaining: recording.countIn }));
      let remaining = recording.countIn;
      const countIv = setInterval(() => {
        remaining -= 1;
        setRecording((r) => ({ ...r, countInRemaining: remaining }));
        if (remaining <= 0) {
          clearInterval(countIv);
          void sessionRef.current.startRecording(project.tracks, project).then((t) => {
            if (t) {
              setTransport(t);
              setRecording((r) => ({ ...r, active: true, sessionId: sessionRef.current.recording.sessionId }));
            }
          });
        }
      }, (60 / transport.tempo) * 1000);
      return;
    }
    const t = await sessionRef.current.startRecording(project.tracks, project);
    if (t) {
      setTransport(t);
      setRecording((r) => ({ ...r, active: true, sessionId: sessionRef.current.recording.sessionId }));
    }
  }, [transport.recording, transport.tempo, recording, project, stopRecording]);

  const setPlayhead = useCallback((beat: number) => {
    setTransport((t) => transportEngine.seek(t, beat));
  }, []);

  const rewind = useCallback((beats = 1) => {
    setTransport((t) => transportEngine.rewind(t, beats));
  }, []);

  const fastForward = useCallback((beats = 1) => {
    setTransport((t) => transportEngine.fastForward(t, beats));
  }, []);

  const frameStep = useCallback((direction: 1 | -1) => {
    setTransport((t) => transportEngine.frameStep(t, direction));
  }, []);

  const setTempo = useCallback(
    (tempo: number) => {
      sessionRef.current.setTempo(tempo);
      setTransport((t) => ({ ...t, tempo: tempoManagerEngine.clampTempo(tempo) }));
      commit((p) => ({ ...p, tempo }), "Tempo change");
    },
    [commit],
  );

  const setTimeSignature = useCallback(
    (sig: [number, number]) => {
      const valid = tempoManagerEngine.setTimeSignature(sig);
      setTransport((t) => ({ ...t, timeSignature: valid }));
      commit((p) => ({ ...p, timeSignature: valid }), "Time signature");
    },
    [commit],
  );

  const updateAudioSettings = useCallback((patch: Partial<AudioSettings>) => {
    setAudioSettings((s) => {
      const next = audioDeviceManagerEngine.applySettings({ ...s, ...patch });
      sessionRef.current.settings = next;
      return next;
    });
  }, []);

  const updateRecording = useCallback((patch: Partial<RecordingSessionState>) => {
    setRecording((r) => {
      const next = { ...r, ...patch };
      sessionRef.current.recording = { ...sessionRef.current.recording, ...patch };
      return next;
    });
  }, []);

  const setInputSource = useCallback(
    (input: InputSource) => {
      updateRecording({ input });
    },
    [updateRecording],
  );

  const armTrack = useCallback(
    (trackId: string, armed?: boolean) => {
      commit((p) => {
        const tracks = trackEngine.arm(
          p.tracks,
          trackId,
          armed ?? !p.tracks.find((t) => t.id === trackId)?.armed,
        );
        return { ...p, tracks };
      }, "Arm track");
    },
    [commit],
  );

  const setTrackMonitor = useCallback(
    (trackId: string, on: boolean) => {
      commit((p) => ({ ...p, tracks: trackEngine.setMonitor(p.tracks, trackId, on) }), "Monitor input");
    },
    [commit],
  );

  const setTrackRecordEnabled = useCallback(
    (trackId: string, on: boolean) => {
      commit((p) => ({ ...p, tracks: trackEngine.setRecordEnabled(p.tracks, trackId, on) }), "Record enable");
    },
    [commit],
  );

  const getSelectedWaveformId = useCallback((): string | null => {
    if (!selectedClipId) return null;
    const clip = project.clips.find((c) => c.id === selectedClipId);
    return clip?.waveformId ?? null;
  }, [selectedClipId, project.clips]);

  const applyWaveformEdit = useCallback(
    (op: WaveformEditOp) => {
      const wfId = getSelectedWaveformId();
      if (!wfId) return;
      sessionRef.current.snapshotUndo(`Waveform ${op}`, project, project.clips);
      switch (op) {
        case "normalize":
          clipProcessorEngine.normalize(wfId);
          break;
        case "reverse":
          clipProcessorEngine.reverse(wfId);
          break;
        case "fadeIn":
          clipProcessorEngine.fadeIn(wfId);
          break;
        case "fadeOut":
          clipProcessorEngine.fadeOut(wfId);
          break;
        case "silence":
          clipProcessorEngine.silence(wfId);
          break;
        case "duplicate":
          clipProcessorEngine.duplicatePeaks(wfId);
          break;
        default:
          break;
      }
      refreshWaveforms();
      setUndoLabels(undoHistoryEngine.history().undo);
      void omnimusicStudioApi.cacheWaveform(wfId, audioCacheEngine.get(wfId)!).catch(() => undefined);
    },
    [getSelectedWaveformId, project, refreshWaveforms],
  );

  const addRegion = useCallback((region: Omit<AudioRegion, "id">) => {
    setWaveformView((v) => ({
      ...v,
      regions: [...v.regions, { ...region, id: `reg-${Date.now()}` }],
    }));
  }, []);

  const undo = useCallback(() => {
    const entry = undoHistoryEngine.undo();
    if (!entry) return;
    setProject(entry.project);
    Object.entries(entry.waveforms).forEach(([id, wf]) => audioCacheEngine.set(wf, audioCacheEngine.getBuffer(id)));
    refreshWaveforms();
    setUndoLabels(undoHistoryEngine.history().undo);
  }, [setProject, refreshWaveforms]);

  const redo = useCallback(() => {
    const entry = undoHistoryEngine.redo();
    if (!entry) return;
    setProject(entry.project);
    refreshWaveforms();
    setUndoLabels(undoHistoryEngine.history().undo);
  }, [setProject, refreshWaveforms]);

  const restoreSnapshot = useCallback(
    (id: string) => {
      const snap = projectRecoveryEngine.get(id);
      if (!snap) return;
      setProject(snap.project);
    },
    [setProject],
  );

  const saveRecoverySnapshot = useCallback(
    (reason: ProjectRecoverySnapshot["reason"] = "manual") => {
      const snap = projectRecoveryEngine.save(project, reason, `Snapshot v${project.version}`);
      void omnimusicStudioApi.saveRecoverySnapshot(project, reason).catch(() => undefined);
      setRecoverySnapshots([snap, ...recoverySnapshots].slice(0, 12));
    },
    [project, recoverySnapshots],
  );

  const formatTime = useCallback(
    (beat?: number) =>
      formatTransportTime(
        beat ?? transport.playheadBeat,
        transport.tempo,
        transport.timeSignature,
        transport.sampleRate,
        transport.displayMode,
      ),
    [transport],
  );

  return useMemo(
    () => ({
      audioReady,
      audioSettings,
      audioDevices,
      refreshDevices,
      updateAudioSettings,
      transport,
      setTransport,
      play,
      pause,
      stop,
      togglePlayPause,
      toggleRecord,
      rewind,
      fastForward,
      frameStep,
      setPlayhead,
      setTempo,
      setTimeSignature,
      setDisplayMode: (mode: TimeDisplayMode) => setTransport((t) => ({ ...t, displayMode: mode })),
      setPlaybackSpeed: (speed: number) =>
        setTransport((t) => ({ ...t, playbackSpeed: Math.min(4, Math.max(0.25, speed)) })),
      setCycleRegion: (start: number, end: number) =>
        setTransport((t) => transportEngine.setCycle(t, start, end)),
      clearCycleRegion: () => setTransport((t) => transportEngine.clearCycle(t)),
      setLocator: (left: number | null, right: number | null) =>
        setTransport((t) => ({ ...t, locatorLeft: left, locatorRight: right })),
      recording,
      updateRecording,
      setInputSource,
      armTrack,
      setTrackMonitor,
      setTrackRecordEnabled,
      waveforms,
      selectedClipId,
      setSelectedClipId,
      waveformView,
      setWaveformZoom: (zoom: number) => setWaveformView((v) => ({ ...v, zoom: Math.min(8, Math.max(0.25, zoom)) })),
      setWaveformSelection: (sel: WaveformSelection) => setWaveformView((v) => ({ ...v, selection: sel })),
      applyWaveformEdit,
      addRegion,
      canUndo: undoHistoryEngine.canUndo(),
      canRedo: undoHistoryEngine.canRedo(),
      undo,
      redo,
      undoLabels,
      recoverySnapshots,
      restoreSnapshot,
      saveRecoverySnapshot,
      formatTime,
    }),
    [
      audioReady,
      audioSettings,
      audioDevices,
      refreshDevices,
      updateAudioSettings,
      transport,
      play,
      pause,
      stop,
      togglePlayPause,
      toggleRecord,
      rewind,
      fastForward,
      frameStep,
      setPlayhead,
      setTempo,
      setTimeSignature,
      recording,
      updateRecording,
      setInputSource,
      armTrack,
      setTrackMonitor,
      setTrackRecordEnabled,
      waveforms,
      selectedClipId,
      waveformView,
      applyWaveformEdit,
      addRegion,
      undo,
      redo,
      undoLabels,
      recoverySnapshots,
      restoreSnapshot,
      saveRecoverySnapshot,
      formatTime,
    ],
  );
}
