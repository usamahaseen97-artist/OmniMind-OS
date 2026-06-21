/**
 * Voice Translator Matrix — manual language pairs vs auto-detect + audio chunk bridge.
 * Does not alter Sovereign chat stream or MongoDB listeners.
 */

export type TranslatorMatrixMode = "manual" | "auto";

export type LanguagePairPreset = {
  id: string;
  label: string;
  source: string;
  target: string;
};

export const TRANSLATOR_LANGUAGE_PAIRS: LanguagePairPreset[] = [
  { id: "ur-en", label: "Urdu ⇄ English", source: "ur", target: "en" },
  { id: "ur-zh", label: "Urdu ⇄ Chinese", source: "ur", target: "zh" },
  { id: "en-ar", label: "English ⇄ Arabic", source: "en", target: "ar" },
  { id: "en-fr", label: "English ⇄ French", source: "en", target: "fr" },
  { id: "auto-ur", label: "Auto-detect → Urdu", source: "auto", target: "ur" },
];

export type TranslatorBridgeState = {
  mode: TranslatorMatrixMode;
  sourceLang: string;
  targetLang: string;
  activePairId: string;
  audioChunks: number;
  lastBridgeAt: number | null;
};

let bridgeState: TranslatorBridgeState = {
  mode: "manual",
  sourceLang: "auto",
  targetLang: "ur",
  activePairId: "ur-en",
  audioChunks: 0,
  lastBridgeAt: null,
};

const bridgeListeners = new Set<() => void>();

export function getTranslatorBridgeState(): TranslatorBridgeState {
  return bridgeState;
}

export function subscribeTranslatorBridge(fn: () => void): () => void {
  bridgeListeners.add(fn);
  return () => bridgeListeners.delete(fn);
}

function emitBridge() {
  bridgeListeners.forEach((fn) => fn());
}

export function setTranslatorMatrixMode(mode: TranslatorMatrixMode) {
  bridgeState = {
    ...bridgeState,
    mode,
    sourceLang: mode === "auto" ? "auto" : bridgeState.sourceLang,
  };
  emitBridge();
  void syncTranslatorBridge();
}

export function applyLanguagePair(pair: LanguagePairPreset) {
  bridgeState = {
    ...bridgeState,
    activePairId: pair.id,
    sourceLang: pair.source,
    targetLang: pair.target,
    mode: pair.source === "auto" ? "auto" : "manual",
  };
  emitBridge();
  void syncTranslatorBridge();
}

export function setTranslatorLanguages(source: string, target: string) {
  bridgeState = { ...bridgeState, sourceLang: source, targetLang: target };
  emitBridge();
}

/** Register an incoming audio buffer chunk (base64) for auto-detect pipeline. */
export function pushAudioBufferChunk(chunkB64: string) {
  if (!chunkB64) return;
  bridgeState = {
    ...bridgeState,
    audioChunks: bridgeState.audioChunks + 1,
    lastBridgeAt: Date.now(),
  };
  emitBridge();
  void syncTranslatorBridge(chunkB64);
}

async function syncTranslatorBridge(audioChunkB64?: string) {
  try {
    const { postTranslatorBridge } = await import("./agent-pipeline-api");
    await postTranslatorBridge({
      mode: bridgeState.mode,
      source_lang: bridgeState.sourceLang,
      target_lang: bridgeState.targetLang,
      audio_chunk_b64: audioChunkB64,
    });
  } catch {
    /* bridge is best-effort; translate API remains primary */
  }
}

// Hook lives in hooks/useTranslatorBridgeState.ts to keep this module SSR-safe.
