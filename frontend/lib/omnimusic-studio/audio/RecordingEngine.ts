import type { RecordingTake } from "../audio-types";
import { audioCacheEngine } from "./AudioCache";
import { extractPeaks } from "./time-utils";

export type RecordingResult = {
  take: RecordingTake;
  waveformId: string;
  durationBeats: number;
};

export class RecordingEngine {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private monitorNode: GainNode | null = null;
  private context: AudioContext | null = null;

  attach(context: AudioContext): void {
    this.context = context;
  }

  async startInput(deviceId: string | null): Promise<boolean> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return false;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.chunks = [];
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.chunks.push(e.data);
      };
      this.mediaRecorder.start(100);
      return true;
    } catch {
      return false;
    }
  }

  monitor(enable: boolean): void {
    if (!this.context || !this.stream) return;
    if (enable) {
      const src = this.context.createMediaStreamSource(this.stream);
      this.monitorNode = this.context.createGain();
      this.monitorNode.gain.value = 0.8;
      src.connect(this.monitorNode);
      this.monitorNode.connect(this.context.destination);
    } else if (this.monitorNode) {
      this.monitorNode.disconnect();
      this.monitorNode = null;
    }
  }

  async stopRecording(
    trackId: string,
    clipId: string,
    startBeat: number,
    tempo: number,
    sampleRate: number,
  ): Promise<RecordingResult | null> {
    if (!this.mediaRecorder) return null;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        const blob = new Blob(this.chunks, { type: "audio/webm" });
        this.cleanupStream();
        const waveformId = `wf-${Date.now()}`;
        let durationSec = 2;
        let peaks = Array.from({ length: 128 }, () => 0.1);

        try {
          const arrayBuffer = await blob.arrayBuffer();
          if (this.context) {
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer.slice(0));
            durationSec = audioBuffer.duration;
            const channel = audioBuffer.getChannelData(0);
            const floatCopy = new Float32Array(channel);
            peaks = extractPeaks(floatCopy, 256);
            audioCacheEngine.set(
              {
                id: waveformId,
                clipId,
                peaks,
                sampleRate: audioBuffer.sampleRate,
                durationSec,
                channels: audioBuffer.numberOfChannels,
                normalized: false,
              },
              floatCopy,
            );
          }
        } catch {
          audioCacheEngine.set({
            id: waveformId,
            clipId,
            peaks,
            sampleRate,
            durationSec,
            channels: 1,
            normalized: false,
          });
        }

        const durationBeats = (durationSec * tempo) / 60;
        const take: RecordingTake = {
          id: `take-${Date.now()}`,
          trackId,
          clipId,
          name: `Take ${new Date().toLocaleTimeString()}`,
          startedAt: new Date().toISOString(),
          durationBeats,
          waveformId,
          selected: true,
        };
        resolve({ take, waveformId, durationBeats });
      };
      this.mediaRecorder!.stop();
      this.mediaRecorder = null;
    });
  }

  private cleanupStream(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.monitorNode) {
      this.monitorNode.disconnect();
      this.monitorNode = null;
    }
  }

  dispose(): void {
    if (this.mediaRecorder?.state === "recording") this.mediaRecorder.stop();
    this.cleanupStream();
    this.context = null;
  }
}

export const recordingEngine = new RecordingEngine();
