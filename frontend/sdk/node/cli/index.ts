#!/usr/bin/env node
/**
 * OmniMind SDK CLI (Node layer)
 * Usage: npx tsx sdk/node/cli/index.ts <command> [options]
 */
import {
  kindFromCreateArg,
  listTemplates,
  runBuild,
  runDeploy,
  runDoctor,
  runPublish,
  runUpdate,
  runVerify,
  writeScaffold,
} from "./commands";

const [, , command, sub, name, ...rest] = process.argv;

function help() {
  console.log(`
OmniMind SDK CLI v12.0.0

Commands:
  omnimind create tool <name> [--template medical-tool]
  omnimind create plugin <name>
  omnimind create ai-agent <name>
  omnimind create workflow <name>
  omnimind create extension <name>
  omnimind doctor
  omnimind build [dir]
  omnimind deploy [target]
  omnimind publish
  omnimind update
  omnimind verify [manifest.json]
  omnimind templates

Templates: ${listTemplates().join(", ")}
`);
}

async function main() {
  switch (command) {
    case "create": {
      if (!sub || !name) {
        console.error("Usage: omnimind create <tool|plugin|ai-agent|workflow|extension> <name>");
        process.exit(1);
      }
      const templateFlag = rest.find((a) => a.startsWith("--template="));
      const template = templateFlag?.split("=")[1] as import("../../shared/types").SDKGeneratorTemplate | undefined;
      const kind = kindFromCreateArg(sub);
      const result = writeScaffold(name, kind, template);
      console.log(`✓ Created ${result.fileCount} files at ${result.path}`);
      console.log(`  Module ID: ${result.manifest.id}`);
      console.log(`  Auto-register: ${result.manifest.autoRegister}`);
      break;
    }
    case "doctor": {
      const report = runDoctor();
      for (const c of report.checks) {
        console.log(`${c.passed ? "✓" : "✗"} ${c.name}: ${c.message}`);
      }
      process.exit(report.ok ? 0 : 1);
      break;
    }
    case "build":
      runBuild(sub);
      console.log("✓ Build complete");
      break;
    case "deploy":
      runDeploy(sub ?? "production");
      console.log("✓ Deploy initiated");
      break;
    case "publish":
      runPublish();
      console.log("✓ Publish queued");
      break;
    case "update":
      console.log(runUpdate());
      break;
    case "verify": {
      const report = runVerify(sub);
      console.log(report.valid ? "✓ Valid" : "✗ Invalid");
      report.errors.forEach((e: string) => console.log(`  error: ${e}`));
      report.warnings.forEach((w: string) => console.log(`  warn: ${w}`));
      process.exit(report.valid ? 0 : 1);
      break;
    }
    case "templates":
      listTemplates().forEach((t: string) => console.log(`  ${t}`));
      break;
    default:
      help();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
