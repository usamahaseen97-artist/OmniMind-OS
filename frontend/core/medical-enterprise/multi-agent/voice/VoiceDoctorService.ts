import type { VoiceDoctorConfig, VoiceTranscript } from "../types";
import { getOmniMindBrain } from "../../../brain/OmniMindBrain";

export type STTProvider = {
  transcribe: (audio: ArrayBuffer, config: VoiceDoctorConfig) => Promise<VoiceTranscript>;
};

export type TTSProvider = {
  synthesize: (text: string, config: VoiceDoctorConfig) => Promise<ArrayBuffer>;
};

/** Enterprise Voice Doctor architecture — STT/TTS hooks, medical terminology */
export class VoiceDoctorService {
  private sttProviders = new Map<string, STTProvider>();
  private ttsProviders = new Map<string, TTSProvider>();
  private noiseReductionHook?: (audio: ArrayBuffer) => Promise<ArrayBuffer>;
  private activeSessionId: string | null = null;
  private transcripts: VoiceTranscript[] = [];

  readonly defaultConfig: VoiceDoctorConfig = {
    language: "en-US",
    medicalTerminologyBoost: true,
    noiseReduction: true,
    speakerIdentification: false,
    dictationMode: "clinical",
    handsFreeNavigation: true,
  };

  registerSTT(id: string, provider: STTProvider) {
    this.sttProviders.set(id, provider);
  }

  registerTTS(id: string, provider: TTSProvider) {
    this.ttsProviders.set(id, provider);
  }

  registerNoiseReduction(hook: (audio: ArrayBuffer) => Promise<ArrayBuffer>) {
    this.noiseReductionHook = hook;
  }

  async startSession(sessionId: string, config?: Partial<VoiceDoctorConfig>) {
    this.activeSessionId = sessionId;
    const cfg = { ...this.defaultConfig, ...config };
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Voice Doctor session ${sessionId} started`);
    } catch { /* optional */ }
    return { sessionId, config: cfg, status: "ready" as const };
  }

  async processAudio(audio: ArrayBuffer, config: VoiceDoctorConfig = this.defaultConfig): Promise<VoiceTranscript> {
    let processed = audio;
    if (config.noiseReduction && this.noiseReductionHook) {
      processed = await this.noiseReductionHook(audio);
    }

    const provider = this.sttProviders.values().next().value;
    if (provider) {
      return provider.transcribe(processed, config);
    }

    const transcript: VoiceTranscript = {
      id: `vtx-${Date.now()}`,
      sessionId: this.activeSessionId ?? "unknown",
      text: "[Voice STT provider not connected — architecture ready]",
      confidence: 0,
      language: config.language,
      isFinal: true,
      timestamp: new Date().toISOString(),
    };
    this.transcripts.push(transcript);
    return transcript;
  }

  async speak(text: string, config: VoiceDoctorConfig = this.defaultConfig) {
    const provider = this.ttsProviders.values().next().value;
    if (provider) return provider.synthesize(text, config);
    return new ArrayBuffer(0);
  }

  parseVoiceCommand(transcript: string): { command: string; args: string } | null {
    const lower = transcript.toLowerCase().trim();
    if (lower.startsWith("navigate to ")) return { command: "navigate", args: lower.slice(12) };
    if (lower.startsWith("summarize")) return { command: "summarize", args: "" };
    if (lower.startsWith("dictate ")) return { command: "dictate", args: lower.slice(8) };
    if (lower === "run analysis" || lower === "analyze") return { command: "analyze", args: "" };
    return null;
  }

  getTranscripts(sessionId?: string) {
    return sessionId ? this.transcripts.filter((t) => t.sessionId === sessionId) : this.transcripts;
  }

  get supported() {
    return this.sttProviders.size > 0 || this.ttsProviders.size > 0;
  }
}

let service: VoiceDoctorService | null = null;

export function getVoiceDoctorService() {
  if (!service) service = new VoiceDoctorService();
  return service;
}
