import type { AudioSettings, ExtendedTransportState, RecordingSessionState } from "../audio-types";
import type { DawTrack, OmniMusicProject, TimelineClip } from "../types";
import { audioCacheEngine } from "./AudioCache";
import { audioDeviceManagerEngine, DEFAULT_AUDIO_SETTINGS } from "./AudioDeviceManager";
import { clipProcessorEngine } from "./ClipProcessor";
import { latencyManagerEngine } from "./LatencyManager";
import { metronomeEngine } from "./MetronomeEngine";
import { playbackEngine } from "./PlaybackEngine";
import { projectRecoveryEngine } from "./ProjectRecovery";
import { recordingEngine } from "./RecordingEngine";
import { tempoManagerEngine } from "./TempoManager";
import { createDefaultTransport, transportEngine } from "./TransportEngine";
import { trackEngine } from "./TrackEngine";
import { undoHistoryEngine } from "./UndoHistory";

export class AudioSessionCoordinator {
  context: AudioContext | null = null;
  settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
  transport: ExtendedTransportState = createDefaultTransport();
  recording: RecordingSessionState = {
    active: false,
    sessionId: null,
    armedTrackIds: [],
    input: "mic",
    monitorInput: false,
    recordEnabled: true,
    punchIn: null,
    punchOut: null,
    countIn: 4,
    countInRemaining: 0,
    metronome: true,
    latencyMs: 0,
    takes: [],
  };

  async init(): Promise<AudioContext | null> {
    if (typeof window === "undefined") return null;
    try {
      this.context = new AudioContext({ sampleRate: this.settings.sampleRate });
      playbackEngine.attach(this.context);
      recordingEngine.attach(this.context);
      metronomeEngine.attach(this.context);
      this.transport.sampleRate = this.context.sampleRate;
      this.recording.latencyMs = latencyManagerEngine.measure(this.context);
      return this.context;
    } catch {
      return null;
    }
  }

  dispose(): void {
    playbackEngine.dispose();
    recordingEngine.dispose();
    metronomeEngine.dispose();
    void this.context?.close();
    this.context = null;
  }

  seedWaveforms(clips: TimelineClip[], tempo: number): void {
    for (const clip of clips) {
      if (!clip.waveformId) continue;
      const durationSec = (clip.durationBeats * 60) / tempo;
      audioCacheEngine.seed(clip.id, clip.waveformId, durationSec, this.settings.sampleRate);
    }
  }

  play(clips: TimelineClip[]): ExtendedTransportState {
    this.transport = transportEngine.play(this.transport);
    metronomeEngine.setTempo(this.transport.tempo);
    metronomeEngine.start(this.recording.metronome && this.transport.recording);
    const playable = clips
      .filter((c) => c.waveformId)
      .map((c) => ({ waveformId: c.waveformId!, startBeat: c.startBeat, durationBeats: c.durationBeats }));
    playbackEngine.scheduleSession(playable, this.transport.tempo, this.transport.playheadBeat, this.transport.playbackSpeed);
    return this.transport;
  }

  pause(): ExtendedTransportState {
    this.transport = transportEngine.pause(this.transport);
    playbackEngine.stopAll();
    metronomeEngine.stop();
    return this.transport;
  }

  stop(): ExtendedTransportState {
    this.transport = transportEngine.stop(this.transport);
    playbackEngine.stopAll();
    metronomeEngine.stop();
    return this.transport;
  }

  async startRecording(tracks: DawTrack[], project: OmniMusicProject): Promise<ExtendedTransportState | null> {
    const armed = trackEngine.armedTracks(tracks);
    if (armed.length === 0) return null;
    const deviceId = this.settings.inputDeviceId;
    const ok = await recordingEngine.startInput(deviceId);
    if (!ok) return null;
    this.recording.active = true;
    this.recording.sessionId = `sess-${Date.now()}`;
    this.recording.armedTrackIds = armed.map((t) => t.id);
    this.transport = transportEngine.record(this.transport);
    metronomeEngine.setTempo(this.transport.tempo);
    metronomeEngine.start(this.recording.metronome);
    for (const t of trackEngine.monitoringTracks(tracks)) {
      recordingEngine.monitor(t.monitorInput);
    }
    return this.transport;
  }

  async stopRecording(
    tracks: DawTrack[],
    clips: TimelineClip[],
    tempo: number,
  ): Promise<{ transport: ExtendedTransportState; clips: TimelineClip[]; takes: RecordingSessionState["takes"] }> {
    const armed = trackEngine.armedTracks(tracks);
    const results: TimelineClip[] = [...clips];
    const takes = [...this.recording.takes];

    if (armed.length > 0) {
      const primary = armed[0]!;
      const clipId = `clip-rec-${Date.now()}`;
      const result = await recordingEngine.stopRecording(
        primary.id,
        clipId,
        this.transport.playheadBeat,
        tempo,
        this.settings.sampleRate,
      );
      if (result) {
        for (const track of armed) {
          const id = track.id === primary.id ? clipId : `clip-rec-${Date.now()}-${track.id}`;
          takes.unshift({ ...result.take, id: `take-${track.id}-${Date.now()}`, trackId: track.id, clipId: id });
          results.push({
            id,
            trackId: track.id,
            name: result.take.name,
            startBeat: this.transport.playheadBeat,
            durationBeats: result.durationBeats,
            color: track.color,
            loop: false,
            waveformId: result.waveformId,
            audioClipId: id,
          });
        }
      }
    } else {
      recordingEngine.dispose();
      await recordingEngine.startInput(null).catch(() => undefined);
    }

    this.recording.active = false;
    this.recording.sessionId = null;
    this.recording.armedTrackIds = [];
    this.transport = transportEngine.pause(this.transport);
    metronomeEngine.stop();
    this.recording.takes = takes;
    return { transport: this.transport, clips: results, takes };
  }

  setTempo(tempo: number): void {
    this.transport.tempo = tempoManagerEngine.setTempo(this.transport.tempo, tempo);
    metronomeEngine.setTempo(this.transport.tempo);
  }

  autosave(project: OmniMusicProject): void {
    projectRecoveryEngine.save(project, "autosave", `Autosave v${project.version}`);
  }

  snapshotUndo(label: string, project: OmniMusicProject, clips: TimelineClip[]): void {
    undoHistoryEngine.push(label, project, audioCacheEngine.all(), clips);
  }
}

export const audioSessionCoordinator = new AudioSessionCoordinator();
