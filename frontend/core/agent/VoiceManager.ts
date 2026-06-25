import type { VoiceManagerContract, VoiceSessionState } from "./types";

/** Voice-ready stub — interfaces only; no speech recognition yet. */
export class VoiceManager implements VoiceManagerContract {
  readonly supported = false;
  private state: VoiceSessionState = "idle";

  getState(): VoiceSessionState {
    return this.state;
  }

  async startListening(): Promise<void> {
    this.state = "idle";
    throw new Error("Voice input is not enabled in V12 Phase 2");
  }

  async stopListening(): Promise<void> {
    this.state = "idle";
  }

  async synthesizeSpeech(_text: string): Promise<void> {
    this.state = "idle";
    throw new Error("Voice output is not enabled in V12 Phase 2");
  }
}
