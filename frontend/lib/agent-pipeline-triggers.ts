/**
 * Side-channel triggers for agent pipelines — does not modify streamChat / SSE payloads.
 */

import type { StagedAttachment } from "./staged-attachments";
import { extractNumericSeries } from "./agent-pipeline-api";
import { runAnalyticsPipeline, runMedicalPipeline } from "./agent-pipeline-store";

export function triggerAnalyticsFromChat(routeId: string, text: string): void {
  if (routeId !== "business-analytics") return;
  const series = extractNumericSeries(text);
  if (series.length >= 3) {
    void runAnalyticsPipeline(series);
  }
}

export function triggerMedicalFromChat(
  routeId: string,
  payload: { files: StagedAttachment[]; symptomText: string },
): void {
  if (routeId !== "medical-diagnostic") return;
  const names = payload.files.map((f) => f.name);
  const text = payload.symptomText.trim();
  if (!names.length && !text) return;
  void runMedicalPipeline({
    symptom_text: text,
    file_names: names,
  });
}
