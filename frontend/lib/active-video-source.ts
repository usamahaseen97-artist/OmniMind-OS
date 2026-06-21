/**
 * Creative Video — primary conditioning frame captured from user upload.
 */

export type ActiveVideoSourceImage = {
  fileName: string;
  mimeType: string;
  /** Full data URL (base64) — sent as init_image to API */
  dataUrl: string;
  /** Blob URL for local preview in sandbox */
  objectUrl: string;
};

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read image"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export async function buildActiveVideoSourceFromFile(
  file: File,
): Promise<ActiveVideoSourceImage> {
  const dataUrl = await fileToDataUrl(file);
  const objectUrl = URL.createObjectURL(file);
  return {
    fileName: file.name,
    mimeType: file.type || "image/jpeg",
    dataUrl,
    objectUrl,
  };
}

export function revokeActiveVideoSource(source: ActiveVideoSourceImage | null): void {
  if (source?.objectUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(source.objectUrl);
  }
}
