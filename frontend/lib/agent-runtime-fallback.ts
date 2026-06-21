/**
 * Client-side runtime simulations when the LLM engine is offline.
 * Keeps the right Live Sandbox populated — never blanks the deck.
 */

import {
  activateAnalyticsClientRuntime,
  activateDevopsClientRuntime,
  activateMedicalClientRuntime,
} from "./agent-live-deck-store";
import { isAgentDrivenDeckRoute } from "./agent-driven-deck";
import { runAnalyticsPipeline } from "./agent-pipeline-store";

const ANALYTICS_SEED = [22, 38, 31, 55, 48, 62, 58, 71, 65, 78];

export function runAgentRuntimeFallback(routeId: string, userPrompt = ""): void {
  if (!isAgentDrivenDeckRoute(routeId)) return;

  if (routeId === "business-analytics") {
    activateAnalyticsClientRuntime(userPrompt);
    void runAnalyticsPipeline(ANALYTICS_SEED, "bar");
    return;
  }

  if (routeId === "medical-diagnostic") {
    activateMedicalClientRuntime(userPrompt);
    return;
  }

  if (routeId === "app-and-develop" || routeId === "business-software-architect") {
    activateDevopsClientRuntime(userPrompt);
  }
}
