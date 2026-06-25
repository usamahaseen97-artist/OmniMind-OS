import type { LyricLineTiming, LyricsSyncDocument, PronunciationEntry } from "../vocal-types";

export class LyricsSyncEngine {
  create(trackId: string): LyricsSyncDocument {
    return { id: `lsync-${Date.now()}`, trackId, lines: [], karaokeMode: false };
  }

  addLine(doc: LyricsSyncDocument, text: string, startBeat: number, durationBeats: number, language: string): LyricsSyncDocument {
    const words = text.split(/\s+/).filter(Boolean);
    const wordDur = durationBeats / Math.max(1, words.length);
    const line: LyricLineTiming = {
      id: `line-${Date.now()}`,
      text,
      startBeat,
      durationBeats,
      language,
      words: words.map((w, i) => ({ word: w, startBeat: startBeat + i * wordDur, durationBeats: wordDur })),
    };
    return { ...doc, lines: [...doc.lines, line] };
  }
}

export const lyricsSyncEngine = new LyricsSyncEngine();

export class PronunciationEngine {
  guide(word: string, language: string): PronunciationEntry {
    const syllables = word.match(/.{1,2}/g) ?? [word];
    return { word, phonetic: word.toUpperCase(), language, syllables };
  }

  alignSyllables(line: string): number {
    return line.split(/\s+/).reduce((n, w) => n + w.length, 0);
  }
}

export const pronunciationEngine = new PronunciationEngine();
