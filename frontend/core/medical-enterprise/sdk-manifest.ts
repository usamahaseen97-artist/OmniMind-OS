import type { SDKModuleManifest } from "../../sdk/shared/types";
import { MEDICAL_SUITE_ID, MEDICAL_SUITE_NAME } from "../../lib/medical-enterprise/constants";

export const MEDICAL_ENTERPRISE_SDK_MANIFEST: SDKModuleManifest = {
  id: MEDICAL_SUITE_ID,
  name: MEDICAL_SUITE_NAME,
  version: "1.0.0",
  description:
    "Enterprise clinical decision-support workspace for qualified healthcare professionals.",
  author: "OmniMind",
  kind: "tool",
  template: "medical-tool",
  route: "/medical-diagnostic-suite",
  toolId: MEDICAL_SUITE_ID,
  capabilities: ["analyze-medical-image"],
  permissions: ["filesystem", "camera", "network", "database"],
  dependencies: [],
  designSystem: true,
  autoRegister: true,
  minOmniVersion: "12.0.0",
  signature: "omnimind-medical-enterprise-v1",
};
