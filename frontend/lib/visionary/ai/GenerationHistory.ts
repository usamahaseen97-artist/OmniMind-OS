import type { GenerationRecord } from "./types";

/** Persistent generation history — reopen, duplicate, remix, export metadata. */
export class GenerationHistory {
  private records: GenerationRecord[] = [];

  list(projectId?: string): GenerationRecord[] {
    const items = [...this.records].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return projectId ? items.filter((r) => r.projectId === projectId) : items;
  }

  add(record: GenerationRecord) {
    this.records = [record, ...this.records];
    return record;
  }

  get(id: string) {
    return this.records.find((r) => r.id === id);
  }

  duplicate(id: string): GenerationRecord | null {
    const src = this.get(id);
    if (!src) return null;
    const copy: GenerationRecord = {
      ...src,
      id: `hist-${Date.now()}`,
      createdAt: new Date().toISOString(),
      tags: [...src.tags, "duplicate"],
    };
    this.records = [copy, ...this.records];
    return copy;
  }

  remix(id: string, promptSummary: string): GenerationRecord | null {
    const src = this.get(id);
    if (!src) return null;
    const remix: GenerationRecord = {
      ...src,
      id: `hist-${Date.now()}`,
      promptSummary,
      createdAt: new Date().toISOString(),
      tags: [...src.tags, "remix"],
    };
    this.records = [remix, ...this.records];
    return remix;
  }

  seed(records: GenerationRecord[]) {
    this.records = records;
  }
}

export const generationHistory = new GenerationHistory();
