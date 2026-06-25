import type { WaveformData } from "../audio-types";
import { audioCacheEngine } from "./AudioCache";
import { beatsToSeconds } from "./time-utils";

export class PlaybackEngine {
  private context: AudioContext | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private startedAt = 0;
  private startBeat = 0;

  attach(context: AudioContext): void {
    this.context = context;
  }

  stopAll(): void {
    this.sources.forEach((s) => {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    });
    this.sources = [];
  }

  playClip(
    waveform: WaveformData,
    when: number,
    offsetSec = 0,
    durationSec?: number,
    playbackRate = 1,
  ): void {
    if (!this.context) return;
    const buffer = audioCacheEngine.getBuffer(waveform.id);
    if (!buffer) {
      this.playSynthetic(when, durationSec ?? waveform.durationSec, playbackRate);
      return;
    }
    const audioBuffer = this.context.createBuffer(1, buffer.length, waveform.sampleRate);
    audioBuffer.copyToChannel(buffer, 0);
    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    source.connect(this.context.destination);
    source.start(when, offsetSec, durationSec);
    this.sources.push(source);
  }

  private playSynthetic(when: number, durationSec: number, playbackRate: number): void {
    if (!this.context) return;
    const len = Math.floor(this.context.sampleRate * durationSec);
    const buffer = this.context.createBuffer(1, len, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = Math.sin((i / this.context.sampleRate) * 440 * 2 * Math.PI) * 0.05;
    }
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;
    source.connect(this.context.destination);
    source.start(when, 0, durationSec);
    this.sources.push(source);
  }

  scheduleSession(
    clips: { waveformId: string; startBeat: number; durationBeats: number }[],
    tempo: number,
    playheadBeat: number,
    playbackRate: number,
  ): void {
    if (!this.context) return;
    this.stopAll();
    const now = this.context.currentTime + 0.05;
    this.startedAt = now;
    this.startBeat = playheadBeat;

    for (const clip of clips) {
      const wf = audioCacheEngine.get(clip.waveformId);
      if (!wf) continue;
      const clipStartSec = beatsToSeconds(clip.startBeat, tempo);
      const playheadSec = beatsToSeconds(playheadBeat, tempo);
      const offset = Math.max(0, playheadSec - clipStartSec);
      const when = now + Math.max(0, clipStartSec - playheadSec);
      const dur = beatsToSeconds(clip.durationBeats, tempo) - offset;
      if (dur > 0) this.playClip(wf, when, offset, dur, playbackRate);
    }
  }

  dispose(): void {
    this.stopAll();
    this.context = null;
  }
}

export const playbackEngine = new PlaybackEngine();
