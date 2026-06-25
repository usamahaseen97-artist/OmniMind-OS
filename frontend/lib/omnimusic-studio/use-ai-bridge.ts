"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OmniMusicAIContextSlice } from "./ai-context-types";
import type { OmniMusicProject } from "./types";
import {
  assetLibraryEngine,
  arrangementEngineCore,
  beatGeneratorEngine,
  chordEngineCore,
  composerEngine,
  generationQueueEngine,
  harmonyEngineCore,
  lyricsEngineCore,
  melodyEngineCore,
  musicModelRouter,
  omnimusicAiApi,
  promptEngine,
  rhythmEngineCore,
  MUSIC_TEMPLATES,
  WORKFLOW_LABELS,
} from "./ai";
import type {
  BeatTemplate,
  GenerationPriority,
  LyricSectionKind,
  MusicProviderId,
  MusicTemplate,
} from "./ai-types";

type Deps = { project: OmniMusicProject };

export function useOmniMusicAIBridge({ project }: Deps): OmniMusicAIContextSlice {
  const [aiPanel, setAiPanel] = useState<OmniMusicAIContextSlice["aiPanel"]>("composer");
  const [prompt, setPrompt] = useState(() => promptEngine.create());
  const [generationJobs, setGenerationJobs] = useState(generationQueueEngine.list());
  const [providers, setProviders] = useState(musicModelRouter.listProviders());
  const [preferredProvider, setPreferredState] = useState<MusicProviderId | "auto">("auto");
  const [lyrics, setLyrics] = useState(() => lyricsEngineCore.create("Untitled Song", "English"));
  const [melodySketch, setMelodySketch] = useState<ReturnType<typeof melodyEngineCore.sketch> | null>(null);
  const [chordProgressions, setChordProgressions] = useState(chordEngineCore.list());
  const [assets, setAssets] = useState(assetLibraryEngine.list());

  const promptErrors = useMemo(() => promptEngine.validate(prompt), [prompt]);

  useEffect(() => {
    void musicModelRouter.listWithStatus().then(setProviders);
    void omnimusicAiApi.listJobs(project.id).then((r) => {
      if (r.jobs?.length) setGenerationJobs(r.jobs);
    }).catch(() => undefined);
  }, [project.id]);

  useEffect(() => {
    const iv = setInterval(() => {
      const jobs = generationQueueEngine.tick();
      setGenerationJobs(jobs);
      const completed = jobs.filter((j) => j.status === "completed" && j.resultAssetId);
      for (const j of completed) {
        if (!assets.find((a) => a.id === j.resultAssetId)) {
          assetLibraryEngine.seedFromJob(j.id, WORKFLOW_LABELS[j.workflow], prompt.genre, j.workflow);
          setAssets(assetLibraryEngine.list());
        }
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [assets, prompt.genre]);

  const updatePrompt = useCallback((patch: Partial<typeof prompt>) => {
    setPrompt((p) => ({ ...p, ...patch }));
  }, []);

  const resetPrompt = useCallback(() => {
    setPrompt(promptEngine.create());
  }, []);

  const submitGeneration = useCallback(
    (priority: GenerationPriority = "normal") => {
      const result = composerEngine.compose(project.id, prompt);
      if (!result.ok || !result.job) return;
      void omnimusicAiApi.createJob({ ...result.job, prompt }).catch(() => undefined);
      void omnimusicAiApi.savePrompt(prompt).catch(() => undefined);
      setGenerationJobs(generationQueueEngine.list());
    },
    [project.id, prompt],
  );

  const pauseJob = useCallback((id: string) => {
    generationQueueEngine.pause(id);
    setGenerationJobs(generationQueueEngine.list());
    void omnimusicAiApi.updateJob(id, { status: "paused" }).catch(() => undefined);
  }, []);

  const resumeJob = useCallback((id: string) => {
    generationQueueEngine.resume(id);
    setGenerationJobs(generationQueueEngine.list());
    void omnimusicAiApi.updateJob(id, { status: "running" }).catch(() => undefined);
  }, []);

  const cancelJob = useCallback((id: string) => {
    generationQueueEngine.cancel(id);
    setGenerationJobs(generationQueueEngine.list());
    void omnimusicAiApi.updateJob(id, { status: "cancelled" }).catch(() => undefined);
  }, []);

  const retryJob = useCallback((id: string) => {
    generationQueueEngine.retry(id);
    setGenerationJobs(generationQueueEngine.list());
    void omnimusicAiApi.updateJob(id, { status: "queued", progress: 0 }).catch(() => undefined);
  }, []);

  const setPreferredProvider = useCallback((id: MusicProviderId | "auto") => {
    musicModelRouter.setPreferred(id);
    setPreferredState(id);
  }, []);

  const addLyricSection = useCallback((kind: LyricSectionKind, lines: string[]) => {
    setLyrics((doc) => {
      const next = lyricsEngineCore.addSection(doc, kind, lines);
      void omnimusicAiApi.saveLyrics(next).catch(() => undefined);
      return next;
    });
  }, []);

  const generateFromBeat = useCallback(
    (template: BeatTemplate) => {
      composerEngine.fromBeatTemplate(project.id, template);
      setGenerationJobs(generationQueueEngine.list());
    },
    [project.id],
  );

  const generateChords = useCallback(() => {
    const ch = chordEngineCore.generate(prompt.key, prompt.mood);
    harmonyEngineCore.voiceLead(ch);
    setChordProgressions((prev) => [ch, ...prev]);
  }, [prompt.key, prompt.mood]);

  const generateMelody = useCallback(() => {
    const sketch = melodyEngineCore.sketch(prompt.key, prompt.scale);
    rhythmEngineCore.pattern(prompt.genre, prompt.bpm);
    arrangementEngineCore.sections(prompt.workflow, prompt.songStructure);
    setMelodySketch(sketch);
  }, [prompt]);

  const applyTemplate = useCallback((template: MusicTemplate) => {
    setPrompt(promptEngine.create({ ...template.promptDefaults, workflow: template.workflow, genre: template.genre }));
    setAiPanel("prompt");
  }, []);

  const copilotSuggestions = useMemo(
    () => [
      `Try ${prompt.genre} at ${prompt.bpm} BPM in ${prompt.key} ${prompt.scale}`,
      `Structure: ${prompt.songStructure}`,
      `Workflow: ${WORKFLOW_LABELS[prompt.workflow]}`,
    ],
    [prompt],
  );

  return useMemo(
    () => ({
      aiPanel,
      setAiPanel,
      prompt,
      updatePrompt,
      resetPrompt,
      promptErrors,
      submitGeneration,
      generationJobs,
      generationHistory: generationQueueEngine.history(),
      pauseJob,
      resumeJob,
      cancelJob,
      retryJob,
      providers,
      preferredProvider,
      setPreferredProvider,
      lyrics,
      updateLyricsTitle: (title: string) => setLyrics((d) => ({ ...d, title })),
      addLyricSection,
      rhymeSuggestions: (word: string) => lyricsEngineCore.rhymeSuggest(word),
      beatTemplates: beatGeneratorEngine.templates(),
      generateFromBeat,
      chordProgressions,
      generateChords,
      melodySketch,
      generateMelody,
      musicTemplates: MUSIC_TEMPLATES,
      applyTemplate,
      assets,
      toggleAssetFavorite: (id: string) => {
        assetLibraryEngine.toggleFavorite(id);
        setAssets(assetLibraryEngine.list());
      },
      copilotSuggestions,
    }),
    [
      aiPanel,
      prompt,
      updatePrompt,
      resetPrompt,
      promptErrors,
      submitGeneration,
      generationJobs,
      pauseJob,
      resumeJob,
      cancelJob,
      retryJob,
      providers,
      preferredProvider,
      setPreferredProvider,
      lyrics,
      addLyricSection,
      generateFromBeat,
      chordProgressions,
      generateChords,
      melodySketch,
      generateMelody,
      applyTemplate,
      assets,
      copilotSuggestions,
    ],
  );
}
