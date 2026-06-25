/** OmniMind quality platform types (Sprint 4). */

export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export type ServiceHealth = {
  name: string;
  status: HealthStatus;
  latencyMs: number | null;
  message: string | null;
};

export type SystemMetrics = {
  memoryMb: number | null;
  cpuPercent: number | null;
  requestQueueDepth: number;
  backgroundJobs: number;
  timestamp: string;
};

export type TestSuiteKind =
  | "unit"
  | "integration"
  | "api"
  | "e2e"
  | "smoke"
  | "regression"
  | "accessibility"
  | "performance"
  | "security"
  | "load"
  | "stress"
  | "memory";

export type TestCaseResult = {
  id: string;
  suite: TestSuiteKind;
  name: string;
  passed: boolean;
  durationMs: number;
  error: string | null;
};

export type AIValidationResult = {
  check: string;
  passed: boolean;
  detail: string;
};

export type CrashReport = {
  id: string;
  message: string;
  recovered: boolean;
  timestamp: string;
};

export type QualitySnapshot = {
  version: string;
  health: HealthStatus;
  services: ServiceHealth[];
  metrics: SystemMetrics;
  testPassRate: number;
  lastCrash: CrashReport | null;
};
