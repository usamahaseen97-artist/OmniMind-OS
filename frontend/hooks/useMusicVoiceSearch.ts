"use client";

import { useCallback, useRef, useState } from "react";

type SpeechRecognitionCtor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useMusicVoiceSearch(onTranscript: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    setError(null);
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      setError("Voice not supported — type the lyric line instead");
      return;
    }
    try {
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.onresult = (ev: SpeechRecognitionEvent) => {
        const text = ev.results[0]?.[0]?.transcript?.trim() ?? "";
        if (text) onTranscript(text);
        setListening(false);
      };
      rec.onerror = () => {
        setError("Could not hear — try again or type lyrics");
        setListening(false);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      setError("Microphone blocked — allow mic access");
      setListening(false);
    }
  }, [onTranscript]);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { listening, error, toggle, stop, supported: Boolean(getSpeechRecognition()) };
}
