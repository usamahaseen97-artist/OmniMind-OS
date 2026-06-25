import type { AnnotationRecord } from "../types";

/** Versioned annotation store with sharing */
export class AnnotationStore {
  private annotations = new Map<string, AnnotationRecord[]>();

  save(
    input: Omit<AnnotationRecord, "id" | "version" | "createdAt" | "updatedAt"> & { parentVersionId?: string },
  ): AnnotationRecord {
    const list = this.annotations.get(input.studyId) ?? [];
    const parent = input.parentVersionId
      ? list.find((a) => a.id === input.parentVersionId)
      : list.filter((a) => a.instanceId === input.instanceId).sort((a, b) => b.version - a.version)[0];

    const record: AnnotationRecord = {
      ...input,
      id: `ann-${Date.now()}`,
      version: parent ? parent.version + 1 : 1,
      parentVersionId: input.parentVersionId ?? parent?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.push(record);
    this.annotations.set(input.studyId, list);
    return record;
  }

  list(studyId: string, instanceId?: string) {
    const all = this.annotations.get(studyId) ?? [];
    return instanceId ? all.filter((a) => a.instanceId === instanceId) : all;
  }

  history(annotationId: string, studyId: string) {
    const all = this.annotations.get(studyId) ?? [];
    const root = all.find((a) => a.id === annotationId);
    if (!root) return [];
    return all.filter((a) => a.id === annotationId || a.parentVersionId === annotationId || a.parentVersionId === root.parentVersionId);
  }

  share(annotationId: string, studyId: string, userIds: string[]) {
    const all = this.annotations.get(studyId) ?? [];
    const ann = all.find((a) => a.id === annotationId);
    if (ann) ann.sharedWith = [...new Set([...ann.sharedWith, ...userIds])];
    return ann;
  }
}

let store: AnnotationStore | null = null;

export function getAnnotationStore(): AnnotationStore {
  if (!store) store = new AnnotationStore();
  return store;
}
