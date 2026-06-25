import { OmniMindSDK as BrowserOmniMindSDK } from "../browser/OmniMindSDK";
import type { SDKModuleManifest } from "../shared/types";
import { scaffoldProject } from "./generators/scaffold";
import { generateModuleDocs } from "./docs/DocGenerator";
import { runDoctor } from "./cli/commands";

/**
 * OmniMind Node SDK — CLI, generators, filesystem, doctor.
 * Use only in Node.js / CLI contexts. Never import from React client code.
 */
export class OmniMindNodeSDK extends BrowserOmniMindSDK {
  scaffold(name: string, kind: SDKModuleManifest["kind"], template?: SDKModuleManifest["template"]) {
    return scaffoldProject(name, kind, template ?? "generic-tool");
  }

  docs(manifest: SDKModuleManifest) {
    return generateModuleDocs(manifest);
  }

  async doctor() {
    return runDoctor();
  }
}

let nodeSdk: OmniMindNodeSDK | null = null;

export function getOmniMindNodeSDK(): OmniMindNodeSDK {
  if (!nodeSdk) nodeSdk = new OmniMindNodeSDK();
  return nodeSdk;
}
