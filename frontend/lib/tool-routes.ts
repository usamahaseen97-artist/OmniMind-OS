import type { OmniRouteId } from "./omni-tools";

/** General Chatbot — chat, /image, /video, attachments. */
export const SOVEREIGN_CHAT_ROUTES = new Set<OmniRouteId | string>([
  "dashboard",
]);

/** @deprecated Creative Video merged into General Chatbot — redirect to dashboard. */
export const CREATIVE_VIDEO_ROUTES = new Set<OmniRouteId | string>([
  "creative-visionary",
  "creative-video",
]);

export function isSovereignGeneralChatRoute(routeId: OmniRouteId | string): boolean {
  return SOVEREIGN_CHAT_ROUTES.has(routeId);
}

export function isCreativeVideoRoute(routeId: OmniRouteId | string): boolean {
  return CREATIVE_VIDEO_ROUTES.has(routeId);
}

export function agentIdForRoute(routeId: OmniRouteId | string): string {
  return "sovereign-core";
}
