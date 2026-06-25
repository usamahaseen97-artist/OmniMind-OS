"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OmniMusicVocalContextSlice } from "./vocal-context-types";
import type { OmniMusicProject } from "./types";
import type { VocalPreset, VocalStudioPanel } from "./vocal-types";
import {
  autoTuneEngineCore,
  breathRemovalCore,
  deEsserCore,
  doubleTrackingCore,
  lyricsSyncEngine,
  omnimusicVocalApi,
  performanceMonitorCore,
  pronunciationEngine,
  smartRecordingEngine,
  vocalAssistantEngine,
  vocalHarmonyEngineCore,
  vocalLibraryEngine,
  vocalSessionCoordinator,
  vocalTakeManagerEngine,
  voiceAuthorizationEngine,
  voiceCleanerCore,
  choirGeneratorCore,
} from "./vocal";

type Deps = {
  project: OmniMusicProject;
  playheadBeat: number;
  latencyMs: number;
};

export function useOmniMusicVocalBridge({ project, playheadBeat, latencyMs }: Deps): OmniMusicVocalContextSlice {
  const [vocalPanel, setVocalPanel] = useState<VocalStudioPanel>("record");
  const [smartRecording, setSmartRecording] = useState(smartRecordingEngine.state);
  const [vocalTakes, setVocalTakes] = useState(vocalTakeManagerEngine.list());
  const [voiceAnalysis, setVoiceAnalysis] = useState(vocalSessionCoordinator.analysis);
  const [processingChain, setProcessingChain] = useState(vocalSessionCoordinator.processingChain);
  const [voiceProfiles, setVoiceProfiles] = useState(vocalLibraryEngine.profiles());
  const [vocalPresets] = useState(vocalLibraryEngine.presets());
  const [lyricsSync, setLyricsSync] = useState(() => lyricsSyncEngine.create("tr-vox"));
  const [performanceMonitor, setPerformanceMonitor] = useState(vocalSessionCoordinator.performance);
  const [vocalSuggestions] = useState(vocalAssistantEngine.suggestions());
  const choirLayers = choirGeneratorCore.layers();

  useEffect(() => {
    vocalSessionCoordinator.init();
    setVoiceProfiles(vocalLibraryEngine.profiles());
    void omnimusicVocalApi.listTakes(project.id).then((r) => {
      if (r.takes?.length) setVocalTakes(r.takes);
    }).catch(() => undefined);
  }, [project.id]);

  useEffect(() => {
    const iv = setInterval(() => {
      setPerformanceMonitor(performanceMonitorCore.sample(latencyMs));
    }, 500);
    return () => clearInterval(iv);
  }, [latencyMs]);

  const syncRecording = useCallback((patch: Partial<typeof smartRecording>) => {
    smartRecordingEngine.state = { ...smartRecordingEngine.state, ...patch };
    setSmartRecording({ ...smartRecordingEngine.state });
    void omnimusicVocalApi.saveSession(project.id, smartRecordingEngine.state).catch(() => undefined);
  }, [project.id]);

  const recordVocalTake = useCallback(
    (trackId: string) => {
      const take = smartRecordingEngine.recordTake(trackId, playheadBeat, 8);
      setVocalTakes(vocalTakeManagerEngine.list());
      void omnimusicVocalApi.saveTake(project.id, take).catch(() => undefined);
    },
    [playheadBeat, project.id],
  );

  const analyzeTake = useCallback(
    (takeId: string) => {
      const report = vocalSessionCoordinator.analyzeTake(takeId);
      setVoiceAnalysis(report);
      void omnimusicVocalApi.saveAnalysis(report).catch(() => undefined);
    },
    [],
  );

  const updateProcessingChain = useCallback((patch: Partial<typeof processingChain>) => {
    setProcessingChain((c) => {
      const next = { ...c, ...patch };
      vocalSessionCoordinator.processingChain = next;
      return next;
    });
  }, []);

  return useMemo(
    () => ({
      vocalPanel,
      setVocalPanel,
      smartRecording,
      updateSmartRecording: syncRecording,
      setRecordingMode: (mode) => syncRecording({ mode }),
      addSessionMarker: (beat, label, note) => {
        smartRecordingEngine.addMarker(beat, label, note);
        setSmartRecording({ ...smartRecordingEngine.state });
      },
      vocalTakes,
      recordVocalTake,
      starTake: (id) => { vocalTakeManagerEngine.star(id); setVocalTakes(vocalTakeManagerEngine.list()); },
      compTake: (id) => { vocalTakeManagerEngine.comp(id); setVocalTakes(vocalTakeManagerEngine.list()); },
      deleteTake: (id) => { vocalTakeManagerEngine.delete(id); setVocalTakes(vocalTakeManagerEngine.list()); },
      voiceAnalysis,
      analyzeTake,
      processingChain,
      updateProcessingChain,
      applyAutoTune: () => setProcessingChain(autoTuneEngineCore.apply(processingChain)),
      applyVoiceClean: () => setProcessingChain(voiceCleanerCore.clean(processingChain, 40)),
      applyDeEss: () => setProcessingChain(deEsserCore.apply(processingChain, -18, 6500)),
      applyDoubleTrack: () => setProcessingChain(doubleTrackingCore.enable(processingChain)),
      applyHarmony: () => setProcessingChain(vocalHarmonyEngineCore.generate(processingChain, [3, 5])),
      voiceProfiles,
      authorizeVoiceProfile: (profileId, consentId) => {
        voiceAuthorizationEngine.authorize(profileId, consentId);
        setVoiceProfiles(vocalLibraryEngine.profiles());
        void omnimusicVocalApi.authorizeProfile(profileId, consentId).catch(() => undefined);
      },
      canUseVoiceProfile: (id) => voiceAuthorizationEngine.canUse(id),
      vocalPresets,
      applyVocalPreset: (preset: VocalPreset) => {
        setProcessingChain((c) => ({ ...c, ...preset.chain }));
        void omnimusicVocalApi.savePreset(preset).catch(() => undefined);
      },
      lyricsSync,
      toggleKaraoke: () => setLyricsSync((d) => ({ ...d, karaokeMode: !d.karaokeMode })),
      addLyricLine: (text, startBeat, durationBeats) => {
        setLyricsSync((d) => {
          const next = lyricsSyncEngine.addLine(d, text, startBeat, durationBeats, "English");
          void omnimusicVocalApi.saveLyricsTiming(next).catch(() => undefined);
          return next;
        });
      },
      pronunciationGuide: (word) => {
        const e = pronunciationEngine.guide(word, "English");
        return { word: e.word, phonetic: e.phonetic, syllables: e.syllables };
      },
      performanceMonitor,
      vocalSuggestions,
      choirLayers,
    }),
    [
      vocalPanel,
      smartRecording,
      syncRecording,
      vocalTakes,
      recordVocalTake,
      voiceAnalysis,
      analyzeTake,
      processingChain,
      updateProcessingChain,
      voiceProfiles,
      vocalPresets,
      lyricsSync,
      performanceMonitor,
      vocalSuggestions,
      choirLayers,
    ],
  );
}
