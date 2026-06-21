import { getBackendUrl } from "./backend-url";
import type { MedicalAnomaly, MedicalFileType, MedicalStreamSource } from "./medical-diagnostic-store";

export type MedicalManualSettingsPayload = {
  sensitivity: number;
  contrast: number;
  vascular_isolation: number;
};

export type MedicalAnalyzeStreamResponse = {
  ok: boolean;
  session_id: string;
  stream_source: MedicalStreamSource;
  file_type: MedicalFileType;
  frame_index: number;
  manual_settings: MedicalManualSettingsPayload;
  filter_state: { contrast: number; sensitivity: number; vascular_layer: number; brightness: number };
  anomalies_detected: MedicalAnomaly[];
  volumetric_3d_mesh_url: string;
  clinical_summary_draft: string;
};

export function medicalDiagnosticWsUrl(): string {
  const base = getBackendUrl().replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/api/medical/diagnostic-stream`;
}

export async function analyzeMedicalStream(body: {
  stream_source: MedicalStreamSource;
  file_type: MedicalFileType;
  manual_settings: MedicalManualSettingsPayload;
  session_id?: string;
  frame_index?: number;
  file_count?: number;
}): Promise<MedicalAnalyzeStreamResponse> {
  const res = await fetch(`${getBackendUrl()}/api/medical/analyze-stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      stream_source: body.stream_source,
      file_type: body.file_type,
      manual_settings: body.manual_settings,
      session_id: body.session_id ?? "",
      frame_index: body.frame_index ?? 0,
      file_count: body.file_count ?? 1,
    }),
  });
  if (!res.ok) throw new Error(`medical analyze-stream failed (${res.status})`);
  return res.json() as Promise<MedicalAnalyzeStreamResponse>;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.includes(",") ? result.split(",")[1]! : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export type MedicalDiagnoseResponse = {
  ok: boolean;
  job_id: string;
  diagnostics_board?: Array<{ parameter: string; status: string; severity: string }>;
  vaccine_guidance?: string[];
  pharmaceutical_knowledge?: string[];
  critical_alerts?: Array<{ type: string; level: string; note: string }>;
  summary?: string;
  organic_remediation_guides?: Array<{ parameter: string; guide: string }>;
  specialist_referrals?: unknown[];
};

/** Upload report / scan to cloud medical pipeline (Gemini vision when configured). */
export async function diagnoseMedicalUpload(
  file: File,
  opts?: { userId?: string },
): Promise<MedicalDiagnoseResponse> {
  const b64 = await fileToBase64(file);
  const isImage =
    file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const body: Record<string, string> = { user_id: opts?.userId ?? "anonymous" };
  if (isImage) body.image_base64 = b64;
  else if (isPdf) body.pdf_base64 = b64;
  else body.document_text = `[Clinical upload: ${file.name}]`;

  const res = await fetch(`${getBackendUrl()}/api/v1/medical/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`medical diagnose failed (${res.status})`);
  return res.json() as Promise<MedicalDiagnoseResponse>;
}
