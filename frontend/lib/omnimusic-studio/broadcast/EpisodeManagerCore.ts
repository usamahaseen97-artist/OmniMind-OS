import type { EpisodeChapter, PodcastEpisode, PodcastSeries, PodcastTrack } from "../broadcast-types";
import { EPISODE_SEED, PODCAST_SERIES_SEED } from "./constants";

export class EpisodeManagerCore {
  series: PodcastSeries[] = [...PODCAST_SERIES_SEED];
  episodes: PodcastEpisode[] = [{ ...EPISODE_SEED }];

  listSeries() {
    return this.series;
  }

  listEpisodes(seriesId?: string) {
    return seriesId ? this.episodes.filter((e) => e.seriesId === seriesId) : this.episodes;
  }

  getEpisode(id: string) {
    return this.episodes.find((e) => e.id === id) ?? null;
  }

  createEpisode(seriesId: string, title: string): PodcastEpisode {
    const ep: PodcastEpisode = {
      id: `ep-${Date.now()}`,
      seriesId,
      title,
      description: "",
      status: "draft",
      durationSec: 0,
      notes: "",
      chapters: [],
      segments: [],
      tracks: [
        { id: `pt-${Date.now()}`, episodeId: "", name: "Host", role: "host", muted: false, gain: 0.85, remote: false, guestId: null },
      ],
      keywords: [],
      createdAt: new Date().toISOString(),
    };
    ep.tracks[0]!.episodeId = ep.id;
    this.episodes.unshift(ep);
    const series = this.series.find((s) => s.id === seriesId);
    if (series) series.episodeIds.unshift(ep.id);
    return ep;
  }

  updateEpisode(id: string, patch: Partial<PodcastEpisode>) {
    const idx = this.episodes.findIndex((e) => e.id === id);
    if (idx < 0) return null;
    this.episodes[idx] = { ...this.episodes[idx]!, ...patch };
    return this.episodes[idx]!;
  }

  addTrack(episodeId: string, name: string, role: PodcastTrack["role"]): PodcastTrack | null {
    const ep = this.getEpisode(episodeId);
    if (!ep) return null;
    const track: PodcastTrack = {
      id: `pt-${Date.now()}`,
      episodeId,
      name,
      role,
      muted: false,
      gain: 0.8,
      remote: role === "remote-guest",
      guestId: null,
    };
    ep.tracks.push(track);
    return track;
  }

  addChapter(episodeId: string, title: string, startSec: number): EpisodeChapter | null {
    const ep = this.getEpisode(episodeId);
    if (!ep) return null;
    const ch: EpisodeChapter = { id: `ch-${Date.now()}`, title, startSec, endSec: null, notes: "" };
    ep.chapters.push(ch);
    return ch;
  }
}

export const episodeManagerCore = new EpisodeManagerCore();
