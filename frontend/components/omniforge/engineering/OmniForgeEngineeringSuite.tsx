"use client";

import { OmniForgeArchitectPlanPanel } from "./OmniForgeArchitectPlanPanel";
import { OmniForgeExportPanel } from "./OmniForgeExportPanel";
import { OmniForgeFileGenerationPanel } from "./OmniForgeFileGenerationPanel";
import { OmniForgeLiveBuildPanel } from "./OmniForgeLiveBuildPanel";
import { OmniForgeProjectWizard } from "./OmniForgeProjectWizard";
import { OmniForgeEnterpriseSuite } from "../enterprise/OmniForgeEnterpriseSuite";
import type { GeneratedFileAsset } from "../../../lib/execution-preview";

/** Phase 3 engineering overlays — wizard, architect approval, live build, file review, export. */
export function OmniForgeEngineeringSuite({ projectFiles }: { projectFiles: GeneratedFileAsset[] }) {
  return (
    <>
      <OmniForgeProjectWizard />
      <OmniForgeArchitectPlanPanel />
      <OmniForgeLiveBuildPanel />
      <OmniForgeFileGenerationPanel />
      <OmniForgeExportPanel files={projectFiles} />
      <OmniForgeEnterpriseSuite />
    </>
  );
}
