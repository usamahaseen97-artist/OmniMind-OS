"use client";

import { useEffect } from "react";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { resetMedicalWorkspace } from "../../../lib/medical-diagnostic-store";
import { MedicalDiagnosticViewport } from "../../medical/MedicalDiagnosticViewport";
import { MedicalIngestionTray } from "../../medical/MedicalIngestionTray";
import { MedicalOmniChatConsole } from "../../medical/MedicalOmniChatConsole";
import { TriplePanelResizeShell } from "./TriplePanelResizeShell";

/** Medical Diagnostic Intelligence — exclusive Group D studio */
export function MedicalStudioShell({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? tool.slug;

  useEffect(() => {
    resetMedicalWorkspace();
    return () => resetMedicalWorkspace();
  }, [tool.slug]);

  return (
    <div className="omni-medical-studio flex h-full min-h-0 w-full max-w-[100vw] flex-1 flex-row overflow-hidden">
      <TriplePanelResizeShell
        centerDragClass="omni-medical-panel-canvas"
        leftGutterLabel="Resize ingestion tray and diagnostic viewport"
        rightGutterLabel="Resize viewport and medical console"
        left={
          <div className="h-full min-h-0 min-w-0 overflow-hidden">
            <MedicalIngestionTray />
          </div>
        }
        center={
          <div className="h-full min-h-0 min-w-0 overflow-hidden">
            <MedicalDiagnosticViewport />
          </div>
        }
        right={
          <div className="h-full min-h-0 min-w-0 overflow-hidden">
            <MedicalOmniChatConsole routeId={routeId} />
          </div>
        }
      />
    </div>
  );
}
