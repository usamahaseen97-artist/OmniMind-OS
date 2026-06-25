import type { TranscriptDocument, TranscriptWord } from "../broadcast-types";

export class TranscriptStudioCore {
  documents: TranscriptDocument[] = [];

  create(episodeId: string, language = "en"): TranscriptDocument {
    const doc: TranscriptDocument = {
      id: `tx-${Date.now()}`,
      episodeId,
      language,
      speakers: [
        { id: "sp-host", label: "Host", color: "#38bdf8" },
        { id: "sp-guest", label: "Guest", color: "#a78bfa" },
      ],
      words: this.seedWords(),
      bookmarks: [],
      searchable: true,
    };
    this.documents.unshift(doc);
    return doc;
  }

  private seedWords(): TranscriptWord[] {
    const sample = ["Welcome", "to", "OmniMusic", "Broadcast", "Studio."];
    return sample.map((text, i) => ({
      id: `w-${i}`,
      text,
      startSec: i * 0.4,
      endSec: (i + 1) * 0.4,
      speakerId: i % 2 === 0 ? "sp-host" : "sp-guest",
      confidence: 0.92,
    }));
  }

  get(episodeId: string) {
    return this.documents.find((d) => d.episodeId === episodeId) ?? null;
  }

  addBookmark(docId: string, sec: number, label: string) {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc) return null;
    const bm = { id: `bm-${Date.now()}`, sec, label };
    doc.bookmarks.push(bm);
    return bm;
  }

  search(docId: string, query: string) {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc) return [];
    const q = query.toLowerCase();
    return doc.words.filter((w) => w.text.toLowerCase().includes(q));
  }

  exportSubtitle(docId: string, format: "srt" | "vtt") {
    const doc = this.documents.find((d) => d.id === docId);
    if (!doc) return "";
    const lines = doc.words.map((w, i) => `${i + 1}\n${this.fmt(w.startSec)} --> ${this.fmt(w.endSec)}\n${w.text}`);
    return format === "srt" ? lines.join("\n\n") : `WEBVTT\n\n${lines.join("\n\n")}`;
  }

  private fmt(sec: number) {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(3).padStart(6, "0");
    return `00:${String(m).padStart(2, "0")}:${s}`;
  }
}

export const transcriptStudioCore = new TranscriptStudioCore();
