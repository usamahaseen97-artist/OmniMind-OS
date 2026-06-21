import { resolveBackendUrl } from "./backend-url";

export type VideoSourceUploadResult = {
  success: boolean;
  source_image_id: string;
  source_image_url: string;
  init_image_token: string;
  init_image_weight: number;
  error?: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read image file"));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

export async function uploadVideoSourceFrame(
  userId: string,
  file: File,
): Promise<VideoSourceUploadResult> {
  const base = await resolveBackendUrl();
  const image_base64 = await fileToBase64(file);
  const res = await fetch(`${base}/api/v1/tools/video/upload-source`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      image_base64,
      filename: file.name,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return {
      success: false,
      source_image_id: "",
      source_image_url: "",
      init_image_token: "",
      init_image_weight: 1,
      error: err || res.statusText,
    };
  }
  return res.json() as Promise<VideoSourceUploadResult>;
}

export async function uploadVideoSourceFrames(
  userId: string,
  files: File[],
): Promise<string | undefined> {
  if (!files.length) return undefined;
  const primary = files[0];
  const result = await uploadVideoSourceFrame(userId, primary);
  if (!result.success || !result.source_image_id) {
    throw new Error(result.error ?? "Source frame upload failed");
  }
  return result.source_image_id;
}
