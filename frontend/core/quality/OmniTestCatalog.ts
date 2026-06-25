import { TEST_CATALOG } from "./constants";
import type { TestCaseResult, TestSuiteKind } from "./types";

/** OmniTestCatalog — test suite registry and result tracking. */
export class OmniTestCatalog {
  results: TestCaseResult[] = [];

  catalog() {
    return TEST_CATALOG;
  }

  record(suite: TestSuiteKind, name: string, passed: boolean, durationMs: number, error: string | null = null) {
    const result: TestCaseResult = {
      id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      suite,
      name,
      passed,
      durationMs,
      error,
    };
    this.results.push(result);
    return result;
  }

  passRate(suite?: TestSuiteKind) {
    const filtered = suite ? this.results.filter((r) => r.suite === suite) : this.results;
    if (!filtered.length) return 1;
    return filtered.filter((r) => r.passed).length / filtered.length;
  }

  summary() {
    const suites = new Set(this.results.map((r) => r.suite));
    return {
      total: this.results.length,
      passed: this.results.filter((r) => r.passed).length,
      failed: this.results.filter((r) => !r.passed).length,
      passRate: this.passRate(),
      bySuite: Array.from(suites).map((s) => ({
        suite: s,
        passRate: this.passRate(s),
        count: this.results.filter((r) => r.suite === s).length,
      })),
    };
  }
}

export const omniTestCatalog = new OmniTestCatalog();
