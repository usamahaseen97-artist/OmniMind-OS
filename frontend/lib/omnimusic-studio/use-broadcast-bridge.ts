"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OmniMusicBroadcastContextSlice } from "./broadcast-context-types";
import type { OmniMusicProject } from "./types";
import type { BroadcastPanel, PodcastEpisode, SpatialMixState } from "./broadcast-types";
import {
  audioRestorationCore,
  broadcastAssistantCore,
  broadcastTemplatesCore,
  episodeManagerCore,
  liveStreamingCore,
  omnimusicBroadcastApi,
  remoteRecordingCore,
  soundLibraryCore,
  spatialAudioCore,
  transcriptStudioCore,
  voiceOverCore,
} from "./broadcast";

type Deps = { project: OmniMusicProject };

export function useOmniMusicBroadcastBridge({ project }: Deps): OmniMusicBroadcastContextSlice {
  const [broadcastPanel, setBroadcastPanel] = useState<BroadcastPanel>("podcast");
  const [podcastEpisodes, setPodcastEpisodes] = useState(episodeManagerCore.episodes);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(episodeManagerCore.episodes[0]?.id ?? null);
  const [remoteGuests, setRemoteGuests] = useState(remoteRecordingCore.list());
  const [voiceOverProjects, setVoiceOverProjects] = useState(voiceOverCore.projects);
  const [spatialMix, setSpatialMix] = useState<SpatialMixState>({ ...spatialAudioCore.state, objects: [...spatialAudioCore.state.objects] });
  const [streamingSession, setStreamingSession] = useState(liveStreamingCore.session);
  const [transcript, setTranscript] = useState(transcriptStudioCore.documents[0] ?? null);
  const [restorationProfiles] = useState(audioRestorationCore.listProfiles());
  const [activeRestorationProfile, setActiveRestorationProfile] = useState(audioRestorationCore.active());
  const [noiseProfiles, setNoiseProfiles] = useState(audioRestorationCore.noiseProfiles);
  const [soundLibrary] = useState(soundLibraryCore.list());
  const [soundCollections] = useState(soundLibraryCore.listCollections());
  const broadcastTemplates = broadcastTemplatesCore.all();
  const streamingPlatforms = liveStreamingCore.platforms();

  const podcastSeries = episodeManagerCore.listSeries();

  useEffect(() => {
    void omnimusicBroadcastApi.listEpisodes(project.id).then((r) => {
      if (r.episodes?.length) {
        episodeManagerCore.episodes = r.episodes;
        setPodcastEpisodes([...r.episodes]);
        setActiveEpisodeId(r.episodes[0]!.id);
      }
    }).catch(() => undefined);
  }, [project.id]);

  const persistEpisodes = useCallback(() => {
    void omnimusicBroadcastApi.saveEpisodes(project.id, {
      episodes: episodeManagerCore.episodes,
      activeEpisodeId,
    }).catch(() => undefined);
  }, [project.id, activeEpisodeId]);

  const activeEpisode = useMemo(
    () => podcastEpisodes.find((e) => e.id === activeEpisodeId) ?? null,
    [podcastEpisodes, activeEpisodeId],
  );

  const broadcastSuggestions = useMemo(
    () => broadcastAssistantCore.suggest(activeEpisode),
    [activeEpisode],
  );

  const createEpisode = useCallback((seriesId: string, title: string) => {
    const ep = episodeManagerCore.createEpisode(seriesId, title);
    setPodcastEpisodes([...episodeManagerCore.episodes]);
    setActiveEpisodeId(ep.id);
    persistEpisodes();
  }, [persistEpisodes]);

  const updateEpisode = useCallback((id: string, patch: Partial<PodcastEpisode>) => {
    episodeManagerCore.updateEpisode(id, patch);
    setPodcastEpisodes([...episodeManagerCore.episodes]);
    persistEpisodes();
  }, [persistEpisodes]);

  const addPodcastTrack = useCallback((episodeId: string, name: string, role: PodcastEpisode["tracks"][0]["role"]) => {
    episodeManagerCore.addTrack(episodeId, name, role);
    setPodcastEpisodes([...episodeManagerCore.episodes]);
    persistEpisodes();
  }, [persistEpisodes]);

  const addChapter = useCallback((episodeId: string, title: string, startSec: number) => {
    episodeManagerCore.addChapter(episodeId, title, startSec);
    setPodcastEpisodes([...episodeManagerCore.episodes]);
    persistEpisodes();
  }, [persistEpisodes]);

  return useMemo(
    () => ({
      broadcastPanel,
      setBroadcastPanel,
      podcastSeries,
      podcastEpisodes,
      activeEpisodeId,
      setActiveEpisodeId,
      activeEpisode,
      createEpisode,
      updateEpisode,
      addPodcastTrack,
      addChapter,
      remoteGuests,
      inviteRemoteGuest: (name, email) => {
        remoteRecordingCore.invite(name, email);
        setRemoteGuests([...remoteRecordingCore.list()]);
      },
      connectRemoteGuest: (id) => {
        remoteRecordingCore.connect(id);
        setRemoteGuests([...remoteRecordingCore.list()]);
      },
      voiceOverProjects,
      createVoiceOver: (title, category, script) => {
        voiceOverCore.create(title, category, script);
        setVoiceOverProjects([...voiceOverCore.projects]);
      },
      spatialMix,
      setSpatialFormat: (format) => {
        spatialAudioCore.setFormat(format);
        setSpatialMix({ ...spatialAudioCore.state, objects: [...spatialAudioCore.state.objects] });
        void omnimusicBroadcastApi.saveSpatial(project.id, spatialAudioCore.state).catch(() => undefined);
      },
      updateSpatialObject: (id, patch) => {
        spatialAudioCore.updateObject(id, patch);
        setSpatialMix({ ...spatialAudioCore.state, objects: [...spatialAudioCore.state.objects] });
      },
      streamingSession,
      streamingPlatforms,
      setStreamingPlatform: (platform) => {
        liveStreamingCore.setPlatform(platform);
        setStreamingSession({ ...liveStreamingCore.session, scenes: [...liveStreamingCore.session.scenes] });
        void omnimusicBroadcastApi.saveStreaming(project.id, liveStreamingCore.session).catch(() => undefined);
      },
      goLive: () => {
        liveStreamingCore.goLive();
        setStreamingSession({ ...liveStreamingCore.session, scenes: [...liveStreamingCore.session.scenes] });
        void omnimusicBroadcastApi.saveStreaming(project.id, liveStreamingCore.session).catch(() => undefined);
      },
      stopStream: () => {
        liveStreamingCore.stop();
        setStreamingSession({ ...liveStreamingCore.session, scenes: [...liveStreamingCore.session.scenes] });
      },
      switchStreamScene: (sceneId) => {
        liveStreamingCore.switchScene(sceneId);
        setStreamingSession({ ...liveStreamingCore.session, scenes: [...liveStreamingCore.session.scenes] });
      },
      transcript,
      generateTranscript: (episodeId) => {
        const doc = transcriptStudioCore.create(episodeId);
        setTranscript(doc);
        void omnimusicBroadcastApi.saveTranscript(project.id, doc).catch(() => undefined);
      },
      exportSubtitles: (format) => (transcript ? transcriptStudioCore.exportSubtitle(transcript.id, format) : ""),
      restorationProfiles,
      activeRestorationProfile,
      selectRestorationProfile: (id) => {
        const p = audioRestorationCore.selectProfile(id);
        setActiveRestorationProfile({ ...p });
      },
      noiseProfiles,
      captureNoiseProfile: (name, sampleSec) => {
        audioRestorationCore.captureNoiseProfile(name, sampleSec);
        setNoiseProfiles([...audioRestorationCore.noiseProfiles]);
        void omnimusicBroadcastApi.saveRestorationProfile(activeRestorationProfile).catch(() => undefined);
      },
      soundLibrary,
      soundCollections,
      searchSoundLibrary: (query) => soundLibraryCore.search(query),
      toggleSoundFavorite: (id) => {
        soundLibraryCore.toggleFavorite(id);
      },
      broadcastTemplates,
      broadcastSuggestions,
    }),
    [
      broadcastPanel,
      podcastSeries,
      podcastEpisodes,
      activeEpisodeId,
      activeEpisode,
      createEpisode,
      updateEpisode,
      addPodcastTrack,
      addChapter,
      remoteGuests,
      voiceOverProjects,
      spatialMix,
      streamingSession,
      streamingPlatforms,
      transcript,
      restorationProfiles,
      activeRestorationProfile,
      noiseProfiles,
      soundLibrary,
      soundCollections,
      broadcastTemplates,
      broadcastSuggestions,
      project.id,
    ],
  );
}
