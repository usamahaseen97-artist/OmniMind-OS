import type { ComplianceControl, ComplianceFramework } from "./types";

/** OmniComplianceCenter — SOC 2, ISO 27001, HIPAA, GDPR, CCPA readiness architecture. */
export class OmniComplianceCenter {
  controls: ComplianceControl[] = [
    { framework: "soc2", controlId: "CC6.1", name: "Logical access controls", status: "partial", evidence: "RBAC + JWT middleware" },
    { framework: "soc2", controlId: "CC7.2", name: "Security monitoring", status: "partial", evidence: "OmniSecurityMonitor" },
    { framework: "iso27001", controlId: "A.9.2", name: "User access management", status: "partial", evidence: "OmniAuthorizationEngine" },
    { framework: "hipaa", controlId: "164.312(a)", name: "Access control", status: "planned", evidence: "Medical enterprise governance" },
    { framework: "gdpr", controlId: "Art.17", name: "Right to erasure", status: "planned", evidence: "Data retention policies" },
    { framework: "ccpa", controlId: "1798.100", name: "Consumer right to know", status: "planned", evidence: "PII classification hooks" },
  ];

  list(framework?: ComplianceFramework) {
    return framework ? this.controls.filter((c) => c.framework === framework) : this.controls;
  }

  score(framework: ComplianceFramework) {
    const items = this.list(framework);
    if (!items.length) return 0;
    const weights = { implemented: 1, partial: 0.5, planned: 0.2, "n/a": 0 };
    const sum = items.reduce((acc, c) => acc + weights[c.status], 0);
    return Math.round((sum / items.length) * 100);
  }

  readinessReport() {
    const frameworks: ComplianceFramework[] = ["soc2", "iso27001", "hipaa", "gdpr", "ccpa"];
    return frameworks.map((f) => ({
      framework: f,
      score: this.score(f),
      controls: this.list(f),
    }));
  }
}

export const omniComplianceCenter = new OmniComplianceCenter();
