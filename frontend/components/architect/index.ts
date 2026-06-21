/** Re-export architect flow for UI + agent JSON payloads. */
export {
  getArchitectStepPayload,
  isArchitectWizardRoute,
  parseArchitectChoiceFromContent,
  buildScaffoldMessage,
  deployStepsForTarget,
  type ArchitectChoicePayload,
  type ArchitectFlowSelections,
  type ArchitectStep,
} from "../../lib/architect-flow";

export { ArchitectBuildWorkspace } from "./ArchitectBuildWorkspace";
export { ArchitectIDEWorkspace } from "./ArchitectIDEWorkspace";
export { ArchitectChoicePanel } from "./ArchitectChoicePanel";
export { OmniArchitectWizard } from "./OmniArchitectWizard";
