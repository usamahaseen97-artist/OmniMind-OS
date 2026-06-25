"use client";

import { useEffect } from "react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { MedicalEnterpriseProvider } from "../../lib/medical-enterprise/context";
import { getOmniMindSDK } from "@/sdk/browser";
import { MEDICAL_ENTERPRISE_SDK_MANIFEST } from "../../core/medical-enterprise/sdk-manifest";
import { MedicalWorkspaceLayout } from "./layout/MedicalWorkspaceLayout";

/**
 * OmniMind Medical Diagnostic Enterprise Suite — flagship clinical workspace.
 * Architecture only; no diagnosis or AI interpretation logic.
 */
export function MedicalEnterpriseWorkspace({
  tool,
  embeddedInAppShell,
}: {
  tool: SovereignToolDef;
  embeddedInAppShell?: boolean;
}) {
  useEffect(() => {
    void getOmniMindSDK().register(MEDICAL_ENTERPRISE_SDK_MANIFEST);
    document.title = `${tool.name} · OmniMind`;
  }, [tool.name]);

  return (
    <MedicalEnterpriseProvider>
      <MedicalWorkspaceLayout embeddedInAppShell={embeddedInAppShell} />
    </MedicalEnterpriseProvider>
  );
}
