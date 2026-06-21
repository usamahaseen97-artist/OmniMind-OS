export type UploadKind = "file" | "image" | "video";

export type StagedAttachment = {
  id: string;
  name: string;
  kind: UploadKind;
  file: File;
};

export function createStagedAttachment(file: File, kind: UploadKind): StagedAttachment {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: file.name,
    kind,
    file,
  };
}

/** Legacy shape for stream payload (name + kind only). */
export function toUploadMeta(att: StagedAttachment): { name: string; kind: UploadKind } {
  return { name: att.name, kind: att.kind };
}
