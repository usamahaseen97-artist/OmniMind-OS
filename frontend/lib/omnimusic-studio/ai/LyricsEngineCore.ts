import type { LyricSection, LyricSectionKind, LyricsDocument } from "../ai-types";

function countSyllables(line: string): number {
  return line.split(/\s+/).filter(Boolean).length * 2;
}

export class LyricsEngineCore {
  create(title: string, language: string): LyricsDocument {
    return {
      id: `lyr-${Date.now()}`,
      title,
      language,
      mode: "rhyme",
      sections: [],
      updatedAt: new Date().toISOString(),
    };
  }

  addSection(doc: LyricsDocument, kind: LyricSectionKind, lines: string[]): LyricsDocument {
    const section: LyricSection = {
      id: `sec-${Date.now()}`,
      kind,
      title: kind.charAt(0).toUpperCase() + kind.slice(1),
      lines,
      syllableCount: lines.reduce((n, l) => n + countSyllables(l), 0),
    };
    return {
      ...doc,
      sections: [...doc.sections, section],
      updatedAt: new Date().toISOString(),
    };
  }

  rhymeSuggest(word: string): string[] {
    return [`${word} flow`, `${word} glow`, `${word} show`];
  }
}

export const lyricsEngineCore = new LyricsEngineCore();
