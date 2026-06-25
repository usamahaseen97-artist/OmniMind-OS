"use client";

import { useVisionaryStudio } from "../../lib/visionary";
import { MODULE_WORKFLOW_MAP } from "../../lib/visionary/ai/constants";
import { useVisionaryAI } from "../../lib/visionary/ai-context";
import { useEffect } from "react";
import { VisionaryAIEngine } from "./ai/VisionaryAIEngine";
import { VisionaryCanvas } from "./VisionaryCanvas";

const AI_MODULES = new Set([
  "ai-creator",
  "image-studio",
  "video-studio",
  "vfx-studio",
  "animation-studio",
]);

/** Routes center workspace between canvas and AI engine by active module. */
export function VisionaryCenterWorkspace() {
  const { activeModule } = useVisionaryStudio();
  const { syncModuleWorkflow } = useVisionaryAI();

  useEffect(() => {
    if (MODULE_WORKFLOW_MAP[activeModule]) {
      syncModuleWorkflow(activeModule);
    }
  }, [activeModule, syncModuleWorkflow]);

  if (AI_MODULES.has(activeModule)) {
    return <VisionaryAIEngine />;
  }

  return <VisionaryCanvas />;
}
