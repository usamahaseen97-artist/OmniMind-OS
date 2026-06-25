/**
 * OmniMind SDK — Node Layer
 * CLI, generators, filesystem, doctor, build, deploy, publish.
 * Never import from React client components or browser providers.
 */
export { SDK_VERSION, SDK_MIN_PLATFORM } from "../shared/types";
export type * from "../shared/types";
export { compareSemver, verifyManifest, deprecationWarning } from "../shared/validation";

export { OmniMindNodeSDK, getOmniMindNodeSDK } from "./OmniMindSDK";
export { scaffoldProject, defaultManifest, GENERATOR_TEMPLATES } from "./generators";
export { generateModuleDocs, writeDocsToScaffold } from "./docs/DocGenerator";
export {
  runDoctor,
  runVerify,
  runBuild,
  runDeploy,
  runPublish,
  runUpdate,
  writeScaffold,
  listTemplates,
  kindFromCreateArg,
} from "./cli/commands";
