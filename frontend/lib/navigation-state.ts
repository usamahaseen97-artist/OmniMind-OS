import type { AppViewId } from "./app-views";
import type { OmniRouteId } from "./omni-tools";

export function isSovereignDefaultHome(
  activeView: AppViewId,
  activeRoute: OmniRouteId | string,
): boolean {
  return activeView === "sovereign-core" && activeRoute === "dashboard";
}

/** Show undo/back when user left default General Chatbot home. */
export function shouldShowUndoBack(
  activeView: AppViewId,
  activeRoute: OmniRouteId | string,
): boolean {
  return !isSovereignDefaultHome(activeView, activeRoute);
}
