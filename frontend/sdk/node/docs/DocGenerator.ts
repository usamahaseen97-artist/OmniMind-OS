import type { SDKModuleManifest } from "../../shared/types";
import { verifyManifest } from "../../shared/validation";

export function generateModuleDocs(manifest: SDKModuleManifest) {
  const verify = verifyManifest(manifest);

  return {
    readme: `# ${manifest.name}\n\n${manifest.description}\n\n## Version\n\n${manifest.version}\n\n## APIs\n\n- \`sdk.api.ai.chat()\`\n- \`sdk.api.memory.pin()\`\n- \`sdk.api.plugin.install()\`\n`,
    apiReference: `# API Reference — ${manifest.id}\n\n## Universal API\n\n| Namespace | Methods |\n|-----------|--------|\n| ai | chat, stream, reasoning |\n| memory | pin, setPreference, recordToolUse |\n| brain | processRequest, brain2 |\n| plugin | install, execute, list |\n| deployment | deploy |\n`,
    architecture: `# Architecture — ${manifest.id}\n\nAuto-registers with: Brain, Memory, Actions, Theme, Plugins, Marketplace, Permissions, Analytics, Notifications, Search, Command Palette, Workspace, Navigation.\n`,
    deployment: `# Deployment Guide\n\n\`\`\`bash\nomnimind build\nomnimind deploy production\n\`\`\`\n`,
    sdkReference: `# SDK Reference\n\nImport: \`import { getOmniMindSDK } from "@omnimind/sdk/browser"\`\n\nVerify: ${verify.valid ? "PASS" : "FAIL"}\n`,
    examples: `# Examples\n\n\`\`\`typescript\nconst sdk = getOmniMindSDK();\nawait sdk.register(manifest);\nconst reply = await sdk.api.ai.chat("Analyze data");\n\`\`\`\n`,
    migration: `# Migration Guide\n\n## 12.x\n\nUse \`getOmniMindSDK()\` from \`@omnimind/sdk/browser\` and \`autoRegister: true\` in manifest.\n`,
  };
}

export function writeDocsToScaffold(manifest: SDKModuleManifest) {
  const docs = generateModuleDocs(manifest);
  return Object.entries(docs).map(([key, content]) => ({
    path: `docs/${key.toUpperCase().replace(/([A-Z])/g, "_$1").replace(/^_/, "")}.md`,
    content,
  }));
}
