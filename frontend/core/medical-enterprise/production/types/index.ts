/**
 * Medical Production Readiness — type contracts (Phase 8)
 */

export const PRODUCTION_DISCLAIMER =
  "Production operations layer for OmniMind Medical Enterprise Suite. " +
  "AI-assisted workflows require qualified healthcare professional oversight.";

export type DeploymentTier = "clinic" | "hospital" | "network" | "multi-tenant" | "multi-region";

export type ServiceHealth = "healthy" | "degraded" | "down" | "unknown";

export type ServiceStatus = {
  id: string;
  name: string;
  phase: string;
  health: ServiceHealth;
  latencyMs?: number;
  lastCheck: string;
  version: string;
};

export type HealthDashboard = {
  overall: ServiceHealth;
  services: ServiceStatus[];
  uptimePercent: number;
  activeIncidents: number;
  lastUpdated: string;
};

export type LatencyMetric = {
  service: string;
  p50: number;
  p95: number;
  p99: number;
  sampleCount: number;
};

export type ErrorRecord = {
  id: string;
  timestamp: string;
  service: string;
  code: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  recovered: boolean;
  retryCount: number;
};

export type QueueMetrics = {
  queueId: string;
  name: string;
  pending: number;
  processing: number;
  failed: number;
  throughputPerMinute: number;
};

export type ObservabilitySnapshot = {
  health: HealthDashboard;
  latency: LatencyMetric[];
  errors24h: number;
  aiPipelineLatencyMs: number;
  apiRequestsPerMinute: number;
  dbConnectionPool: { active: number; idle: number; max: number };
  queues: QueueMetrics[];
  backgroundJobs: { running: number; scheduled: number; failed: number };
};

export type TestCategory =
  | "unit"
  | "integration"
  | "e2e"
  | "api"
  | "ui"
  | "performance"
  | "security"
  | "accessibility"
  | "regression";

export type TestSuiteDefinition = {
  id: string;
  name: string;
  category: TestCategory;
  target: string;
  path: string;
  enabled: boolean;
};

export type TestRunResult = {
  suiteId: string;
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
  timestamp: string;
};

export type QAValidationResult = {
  check: string;
  status: "pass" | "warn" | "fail";
  message: string;
};

export type ExportFormat = "pdf" | "csv" | "fhir" | "hl7" | "json" | "xml" | "encrypted-archive";

export type ExportJob = {
  id: string;
  format: ExportFormat;
  resourceType: string;
  resourceId: string;
  status: "queued" | "processing" | "complete" | "failed";
  downloadUrl?: string;
  signed: boolean;
  createdAt: string;
};

export type AIFeedbackAction = "approve" | "reject" | "correct";

export type AIFeedbackRecord = {
  id: string;
  patientId: string;
  recommendationId: string;
  agentId?: string;
  action: AIFeedbackAction;
  correction?: string;
  clinicianId: string;
  timestamp: string;
};

export type AIQualityMetrics = {
  totalRecommendations: number;
  approved: number;
  rejected: number;
  corrected: number;
  approvalRate: number;
  avgConfidence: number;
};

export type SupportedLocale = "en" | "ur" | "ar" | "zh" | "fr" | "de" | "es";

export type LocalePack = {
  code: SupportedLocale;
  label: string;
  rtl: boolean;
  loaded: boolean;
};

export type AccessibilityPreferences = {
  highContrast: boolean;
  reducedMotion: boolean;
  fontScale: number;
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
};

export type AdminDashboardState = {
  systemHealth: HealthDashboard;
  observability: ObservabilitySnapshot;
  aiUsage: { requests24h: number; tokensEstimate: number; agentsActive: number };
  storage: { usedGb: number; totalGb: number; imagingGb: number; emrGb: number };
  licenses: { seats: number; used: number; expiresAt?: string };
  integrations: { name: string; status: ServiceHealth }[];
};

export type RetryPolicy = {
  maxAttempts: number;
  backoffMs: number;
  jitter: boolean;
};

export type OfflineQueueItem = {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  queuedAt: string;
  attempts: number;
};

export type StructuredLogEntry = {
  level: "debug" | "info" | "warn" | "error";
  service: string;
  message: string;
  timestamp: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
};

export type TenantConfig = {
  id: string;
  name: string;
  tier: DeploymentTier;
  region: string;
  features: string[];
};
