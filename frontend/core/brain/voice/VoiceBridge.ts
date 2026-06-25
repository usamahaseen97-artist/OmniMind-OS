import type { VoiceManagerContract } from "../../agent/types";
import type { VoiceManager } from "../../agent/VoiceManager";

/** Voice-ready bridge over Master Agent voice manager. */
export class VoiceBridge implements VoiceManagerContract {
  constructor(private voice: VoiceManager) {}

  get supported() {
    return this.voice.supported;
  }

  getState() {
    return this.voice.getState();
  }

  startListening() {
    return this.voice.startListening();
  }

  stopListening() {
    return this.voice.stopListening();
  }

  synthesizeSpeech(text: string) {
    return this.voice.synthesizeSpeech(text);
  }
}
