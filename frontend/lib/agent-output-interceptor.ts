/**
 * Dynamic output interceptor — maps streaming LLM tokens to right-deck live state.
 * Does not alter SSE payloads or MongoDB persistence.
 */

import { isAgentDrivenDeckRoute } from "./agent-driven-deck";
import { isEngineConnectionMessage } from "./engine-connection";
import { runAgentRuntimeFallback } from "./agent-runtime-fallback";
import {
  applyAnalyticsStreamDelta,
  applyMedicalStreamDelta,
  beginAgentStream,
  endAgentStream,
} from "./agent-live-deck-store";
import { applyWorkbenchStreamToken, pushWorkbenchStatus } from "./workbench-live-store";
import { extractNumericSeries } from "./agent-pipeline-api";
import { runAnalyticsPipeline, runMedicalPipeline } from "./agent-pipeline-store";

export type InterceptorPhase = "start" | "token" | "done" | "engine_failure";

let accumulated = "";

export function resetStreamAccumulator() {
  accumulated = "";
}

export function interceptAgentOutput(
  routeId: string,
  phase: InterceptorPhase,
  payload: { token?: string; userPrompt?: string },
): void {
  if (!isAgentDrivenDeckRoute(routeId)) return;

  const userPrompt = payload.userPrompt ?? "";

  if (phase === "start") {
    accumulated = "";
    beginAgentStream(routeId, userPrompt);
    pushWorkbenchStatus(routeId, "Agent processing…");

    if (routeId === "business-analytics") {
      const series = extractNumericSeries(userPrompt);
      if (series.length >= 3) void runAnalyticsPipeline(series);
    }
    if (routeId === "medical-diagnostic" && userPrompt.trim()) {
      void runMedicalPipeline({
        symptom_text: userPrompt,
        file_names: [],
      });
    }
    return;
  }

  if (phase === "engine_failure") {
    runAgentRuntimeFallback(routeId, userPrompt);
    return;
  }

  if (phase === "token" && payload.token) {
    if (isEngineConnectionMessage(payload.token)) {
      return;
    }
    accumulated += payload.token;

    if (isEngineConnectionMessage(accumulated)) {
      return;
    }

    if (routeId === "business-analytics") {
      applyAnalyticsStreamDelta(accumulated, payload.token);
      applyWorkbenchStreamToken(routeId, payload.token, accumulated);
      const series = extractNumericSeries(accumulated);
      if (series.length >= 5 && accumulated.length % 80 < payload.token.length) {
        void runAnalyticsPipeline(series);
      }
    }
    if (routeId === "medical-diagnostic") {
      applyMedicalStreamDelta(accumulated, userPrompt);
      applyWorkbenchStreamToken(routeId, payload.token, accumulated);
    }
    if (
      routeId === "nasa-science-solver" ||
      routeId === "creative-visionary" ||
      routeId === "vfx-master" ||
      routeId === "marketing-ad-king" ||
      routeId === "architectural-designer" ||
      routeId === "quantum-trading"
    ) {
      applyWorkbenchStreamToken(routeId, payload.token, accumulated);
    }
    return;
  }

  if (phase === "done") {
    if (routeId === "business-analytics") {
      applyAnalyticsStreamDelta(accumulated, "");
      const series = extractNumericSeries(accumulated || userPrompt);
      if (series.length >= 3) void runAnalyticsPipeline(series);
    }
    if (routeId === "medical-diagnostic") {
      applyMedicalStreamDelta(accumulated, userPrompt);
    }
    applyWorkbenchStreamToken(routeId, "", accumulated || userPrompt);
    pushWorkbenchStatus(routeId, "Complete");
    endAgentStream();
  }
}
