import type { TestSuiteKind } from "./types";

export const OMNICORE_QUALITY_VERSION = "4.0.0-sprint4";

export const TEST_CATALOG: Array<{ suite: TestSuiteKind; pattern: string; description: string }> = [
  { suite: "unit", pattern: "tests/unit/**/*.test.ts", description: "Domain engine unit tests" },
  { suite: "integration", pattern: "tests/integration/**/*.test.ts", description: "Module integration" },
  { suite: "api", pattern: "tests/**/*.test.ts", description: "API contract tests" },
  { suite: "smoke", pattern: "tests/smoke/**/*.test.ts", description: "Critical path smoke" },
  { suite: "security", pattern: "tests/security/**/*.test.ts", description: "Auth and RBAC" },
  { suite: "e2e", pattern: "e2e/**/*.spec.ts", description: "Playwright E2E (planned)" },
  { suite: "performance", pattern: "tests/performance/**/*.test.ts", description: "Perf budgets" },
  { suite: "accessibility", pattern: "tests/a11y/**/*.test.ts", description: "A11y checks (planned)" },
];
