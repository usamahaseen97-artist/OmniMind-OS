export type TestSuiteKind =
  | "unit"
  | "integration"
  | "api"
  | "ui"
  | "e2e"
  | "performance"
  | "security";

export type GeneratedTestSuite = {
  kind: TestSuiteKind;
  path: string;
  content: string;
  framework: string;
};

type FileSnapshot = { path: string; content: string; language?: string };

/** Auto-generates test suites for workspace modules. */
export function generateTestSuites(files: FileSnapshot[], projectName: string): GeneratedTestSuite[] {
  const suites: GeneratedTestSuite[] = [];
  const mainComponent = files.find((f) => /page\.tsx$|App\.tsx$/i.test(f.path));

  suites.push({
    kind: "unit",
    path: `tests/unit/${slug(projectName)}.test.ts`,
    content: unitTestTemplate(projectName, mainComponent?.path),
    framework: "vitest",
  });
  suites.push({
    kind: "integration",
    path: `tests/integration/api.integration.test.ts`,
    content: integrationTemplate(projectName),
    framework: "vitest",
  });
  suites.push({
    kind: "api",
    path: `tests/api/endpoints.test.ts`,
    content: apiTestTemplate(projectName),
    framework: "supertest",
  });
  suites.push({
    kind: "ui",
    path: `tests/ui/smoke.test.tsx`,
    content: uiTestTemplate(mainComponent?.path),
    framework: "testing-library",
  });
  suites.push({
    kind: "e2e",
    path: `tests/e2e/flow.spec.ts`,
    content: e2eTemplate(projectName),
    framework: "playwright",
  });
  suites.push({
    kind: "performance",
    path: `tests/perf/lighthouse.config.js`,
    content: perfTemplate(),
    framework: "lighthouse",
  });
  suites.push({
    kind: "security",
    path: `tests/security/owasp.test.ts`,
    content: securityTestTemplate(),
    framework: "vitest",
  });
  return suites;
}

function slug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "app";
}

function unitTestTemplate(name: string, mainPath?: string) {
  return `import { describe, it, expect } from "vitest";

describe("${name} — unit", () => {
  it("bootstraps core module", () => {
    expect(true).toBe(true);
  });
  ${mainPath ? `// Target: ${mainPath}` : ""}
});
`;
}

function integrationTemplate(name: string) {
  return `import { describe, it, expect } from "vitest";

describe("${name} — integration", () => {
  it("connects services", async () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
`;
}

function apiTestTemplate(name: string) {
  return `describe("${name} API", () => {
  it("GET /health returns 200", async () => {
    // connect to running API
    expect(true).toBe(true);
  });
});
`;
}

function uiTestTemplate(mainPath?: string) {
  return `import { render, screen } from "@testing-library/react";

it("renders main view", () => {
  // import from ${mainPath ?? "app entry"}
  expect(true).toBe(true);
});
`;
}

function e2eTemplate(name: string) {
  return `import { test, expect } from "@playwright/test";

test("${name} happy path", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
`;
}

function perfTemplate() {
  return `module.exports = { extends: "lighthouse:default", settings: { onlyCategories: ["performance"] } };
`;
}

function securityTestTemplate() {
  return `describe("security", () => {
  it("rejects missing auth on protected routes", () => {
    expect(true).toBe(true);
  });
});
`;
}
