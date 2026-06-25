import type { ExportFormat, TestCategory, SupportedLocale, AIFeedbackAction } from "../types";
import { getObservabilityHub } from "../observability/ObservabilityHub";
import { getTestingFramework } from "../testing/TestingFramework";
import { getQualityAssurance } from "../qa/QualityAssurance";
import { getEnterpriseExportService } from "../exports/EnterpriseExportService";
import { getAIQualityControl } from "../ai-quality/AIQualityControl";
import { getAdministrationService } from "../admin/AdministrationService";
import { getPerformanceLayer } from "../performance/PerformanceLayer";
import { getLocalizationArchitecture } from "../i18n/LocalizationArchitecture";
import { getAccessibilityArchitecture } from "../accessibility/AccessibilityArchitecture";
import { getErrorHandlingArchitecture } from "../errors/ErrorHandlingArchitecture";
import { getProductionBrainBridge } from "../bridge/ProductionBrainBridge";
import { hasMedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";

function assertAdmin(role: ClinicalRole) {
  if (!hasMedicalPermission(role, "admin:settings") && !hasMedicalPermission(role, "audit:read")) {
    throw new Error("Unauthorized: admin access required");
  }
}

/** Unified production readiness service facade */
export class ProductionService {
  private brain = getProductionBrainBridge();

  async getHealth(role: ClinicalRole) {
    assertAdmin(role);
    return getObservabilityHub().checkHealth();
  }

  async getObservability(role: ClinicalRole) {
    assertAdmin(role);
    return getObservabilityHub().getSnapshot();
  }

  async getAdminDashboard(role: ClinicalRole) {
    assertAdmin(role);
    return getAdministrationService().getDashboard();
  }

  async runQA(role: ClinicalRole) {
    assertAdmin(role);
    const results = await getQualityAssurance().validate();
    return { results, summary: getQualityAssurance().getSummary(results) };
  }

  listTestSuites(role: ClinicalRole, category?: TestCategory) {
    assertAdmin(role);
    return getTestingFramework().listSuites(category);
  }

  async runTests(role: ClinicalRole, category?: TestCategory) {
    assertAdmin(role);
    return category ? getTestingFramework().runCategory(category) : getTestingFramework().runAll();
  }

  async export(resourceType: string, resourceId: string, format: ExportFormat, role: ClinicalRole) {
    if (!hasMedicalPermission(role, "records:read")) throw new Error("Unauthorized");
    return getEnterpriseExportService().export(resourceType, resourceId, format, { sign: true });
  }

  submitAIFeedback(
    action: AIFeedbackAction,
    patientId: string,
    recommendationId: string,
    clinicianId: string,
    correction?: string,
  ) {
    const qc = getAIQualityControl();
    if (action === "approve") return qc.approve(patientId, recommendationId, clinicianId);
    if (action === "reject") return qc.reject(patientId, recommendationId, clinicianId);
    return qc.correct(patientId, recommendationId, clinicianId, correction ?? "");
  }

  getAIQualityMetrics(role: ClinicalRole) {
    assertAdmin(role);
    return getAIQualityControl().getMetrics();
  }

  getPerformanceMetrics(role: ClinicalRole) {
    assertAdmin(role);
    return getPerformanceLayer().getMetrics();
  }

  setLocale(code: SupportedLocale, role: ClinicalRole) {
    void role;
    return getLocalizationArchitecture().setLocale(code);
  }

  listLocales() {
    return getLocalizationArchitecture().listLocales();
  }

  getAccessibility() {
    return getAccessibilityArchitecture().getPreferences();
  }

  updateAccessibility(prefs: Parameters<ReturnType<typeof getAccessibilityArchitecture>["update"]>[0]) {
    return getAccessibilityArchitecture().update(prefs);
  }

  getErrorLogs(role: ClinicalRole) {
    assertAdmin(role);
    return getErrorHandlingArchitecture().getLogs(undefined, 100);
  }

  async markProductionReady(role: ClinicalRole, version: string, environment: string) {
    assertAdmin(role);
    const qa = await this.runQA(role);
    if (!qa.summary.ready) throw new Error("QA validation failed — not production ready");
    await this.brain.recordDeployment(version, environment);
    return { ready: true, version, environment, qa: qa.summary };
  }
}

let service: ProductionService | null = null;

export function getProductionService() {
  if (!service) service = new ProductionService();
  return service;
}
