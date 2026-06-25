import type { KnowledgeCitation, KnowledgeQuery, KnowledgeSourceType } from "../types";

type KnowledgeEntry = {
  id: string;
  sourceType: KnowledgeSourceType;
  title: string;
  version: string;
  publisher: string;
  content: string;
  institutionId?: string;
};

const DEFAULT_KNOWLEDGE: KnowledgeEntry[] = [
  { id: "kg-1", sourceType: "clinical-guideline", title: "Hypertension Management Guideline", version: "2024.1", publisher: "Placeholder Guideline Body", content: "Blood pressure targets and lifestyle modifications — clinician judgment required." },
  { id: "kg-2", sourceType: "hospital-protocol", title: "Sepsis Screening Protocol", version: "3.2", publisher: "Institution Protocol", content: "Early recognition criteria — escalation per local protocol." },
  { id: "kg-3", sourceType: "textbook", title: "Internal Medicine Reference", version: "12e", publisher: "Medical Textbook", content: "General reference architecture for clinical context." },
  { id: "kg-4", sourceType: "research-paper", title: "Evidence Summary Placeholder", version: "1.0", publisher: "Literature Index", content: "Citation-ready research reference scaffold." },
];

/** Medical knowledge engine — guidelines, protocols, citations */
export class MedicalKnowledgeEngine {
  private entries = new Map<string, KnowledgeEntry>();
  private customEntries = new Map<string, KnowledgeEntry[]>();

  constructor() {
    for (const e of DEFAULT_KNOWLEDGE) this.entries.set(e.id, e);
  }

  search(query: KnowledgeQuery): KnowledgeCitation[] {
    const q = query.topic.toLowerCase();
    let pool = [...this.entries.values()];
    if (query.sourceTypes?.length) pool = pool.filter((e) => query.sourceTypes!.includes(e.sourceType));
    if (query.institutionId) {
      const custom = this.customEntries.get(query.institutionId) ?? [];
      pool = [...pool, ...custom];
    }
    return pool
      .filter((e) => e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q))
      .map((e) => ({
        id: e.id,
        sourceType: e.sourceType,
        title: e.title,
        version: e.version,
        publisher: e.publisher,
        retrievedAt: new Date().toISOString(),
        excerpt: e.content.slice(0, 200),
      }));
  }

  registerInstitutionKnowledge(institutionId: string, entries: Omit<KnowledgeEntry, "id">[]) {
    const withIds = entries.map((e, i) => ({ ...e, id: `inst-${institutionId}-${i}` }));
    this.customEntries.set(institutionId, withIds);
    for (const e of withIds) this.entries.set(e.id, e);
  }

  getCitation(id: string): KnowledgeCitation | undefined {
    const e = this.entries.get(id);
    if (!e) return undefined;
    return {
      id: e.id,
      sourceType: e.sourceType,
      title: e.title,
      version: e.version,
      publisher: e.publisher,
      retrievedAt: new Date().toISOString(),
      excerpt: e.content.slice(0, 300),
    };
  }

  versionedUpdate(id: string, version: string, content: string) {
    const entry = this.entries.get(id);
    if (!entry) throw new Error("Knowledge entry not found");
    this.entries.set(id, { ...entry, version, content });
  }
}

let engine: MedicalKnowledgeEngine | null = null;

export function getMedicalKnowledgeEngine() {
  if (!engine) engine = new MedicalKnowledgeEngine();
  return engine;
}
