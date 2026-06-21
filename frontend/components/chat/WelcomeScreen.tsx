"use client";

import type { ExecutionPreviewState } from "../../lib/execution-preview";
import type { OmniRouteId } from "../../lib/omni-tools";
import { CentralSuggestionHub } from "./CentralSuggestionHub";

interface WelcomeScreenProps {
  routeId: OmniRouteId | string;
  onFill: (text: string) => void;
  userId?: string;
  onArchitectPreview?: (preview: ExecutionPreviewState) => void;
  workbenchUnified?: boolean;
  geminiLayout?: boolean;
  geminiDisplayName?: string;
}

export function WelcomeScreen({
  routeId,
  onFill,
  userId,
  onArchitectPreview,
  workbenchUnified,
  geminiLayout,
  geminiDisplayName,
}: WelcomeScreenProps) {
  return (
    <CentralSuggestionHub
      routeId={routeId}
      onFill={onFill}
      userId={userId}
      onArchitectPreview={onArchitectPreview}
      workbenchUnified={workbenchUnified}
      geminiLayout={geminiLayout}
      geminiDisplayName={geminiDisplayName}
    />
  );
}
