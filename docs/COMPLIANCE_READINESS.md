# OmniMind Compliance Readiness

**Status:** Architecture preparation only — not certification  
**Engine:** `OmniComplianceCenter` (`frontend/core/security/`)

---

## Readiness Scores (Architecture Assessment)

| Framework | Score | Status | Primary gap |
|-----------|-------|--------|-------------|
| **SOC 2 Type II** | 45% | Partial | Durable audit logs, access reviews |
| **ISO 27001** | 40% | Partial | ISMS documentation, risk register |
| **HIPAA** | 20% | Planned | BAA, PHI encryption, access logging |
| **GDPR** | 20% | Planned | Data subject rights automation |
| **CCPA** | 20% | Planned | Consumer disclosure workflows |

*Scores computed from control implementation status in `OmniComplianceCenter`.*

---

## SOC 2 — Trust Service Criteria Mapping

| Criteria | Control | OmniMind implementation | Gap |
|----------|---------|-------------------------|-----|
| CC6.1 | Logical access | RBAC + JWT + zero trust | Enforce JWT in prod |
| CC6.2 | Registration / authorization | `OmniAuthEngine`, org invites | SSO production |
| CC6.3 | Role changes | `OmniRoleManager` | Approval workflow |
| CC7.1 | Vulnerability detection | — | Add dependency scanning CI |
| CC7.2 | Security monitoring | `OmniSecurityMonitor` | Durable event store |
| CC8.1 | Change management | Git + PR reviews | Formal CM process |
| A1.2 | Recovery | `OmniBackupManager` (assets) | DR testing |

---

## ISO 27001 — Annex A Mapping

| Control | Description | Status |
|---------|-------------|--------|
| A.5 | Information security policies | Planned — document in `docs/` |
| A.8 | Asset management | `OmniAssets` classification hooks |
| A.9.2 | User access management | `OmniAuthorizationEngine` |
| A.9.4 | Privileged access | `platform:owner` role |
| A.10 | Cryptography | `OmniDataProtection.encryptionHooks` |
| A.12.4 | Logging | Security + audit centers |
| A.14.2 | Secure development | Plugin sandbox + signing |
| A.18 | Compliance | This document |

---

## HIPAA (Medical Diagnostic / Enterprise)

**Applicable when:** Processing PHI via `medical-diagnostic-suite`

| Requirement | Architecture | Module |
|-------------|--------------|--------|
| Access controls | RBAC + ABAC | `core/security` + medical governance |
| Audit controls | Audit logs | `OmniAuditCenter`, medical governance |
| Integrity | Version control | `OmniVersionControl` |
| Transmission security | TLS | Deployment |
| Encryption at rest | Hooks | `DataSecurityArchitecture` (medical) |

**Not ready for HIPAA production** until:
- BAA with cloud providers
- PHI field-level encryption
- Access log retention 6+ years
- Legacy `/medical-diagnostic` route deprecated or isolated

---

## GDPR

| Article | Requirement | Architecture |
|---------|-------------|--------------|
| Art. 6 | Lawful basis | Consent hooks (planned) |
| Art. 15 | Right of access | Export API (planned) |
| Art. 17 | Right to erasure | `DataRetentionPolicy` + purge jobs |
| Art. 25 | Privacy by design | PII classification in `OmniDataProtection` |
| Art. 32 | Security of processing | Zero trust + encryption hooks |
| Art. 33 | Breach notification | `OmniSecurityMonitor` anomaly events |

---

## CCPA

| Requirement | Architecture |
|-------------|--------------|
| Right to know | Data inventory (planned) |
| Right to delete | Retention policies + purge |
| Opt-out of sale | N/A — no data sale architecture |
| Non-discrimination | — |

---

## Evidence Collection (Target State)

```
OmniComplianceCenter.readinessReport()
  → SOC2 controls with status + evidence string
  → Export to compliance dashboard (Sprint 4)
  → Link to audit log samples
  → Link to penetration test reports
```

---

## Data Retention Architecture

| Classification | Retention | Encrypt at rest |
|----------------|-----------|-----------------|
| public | 365 days | No |
| internal | 365 days | Optional |
| confidential | 90 days | Yes |
| pii | 90 days | Yes |
| phi | 2555 days (~7y) | Yes |
| secret | 30 days | Yes |

Configured in `core/security/constants.ts` → `RETENTION_POLICIES`

---

## Roadmap to Certification

| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| 1 | Sprint 3 ✅ | Security architecture + compliance map |
| 2 | Sprint 4 | JWT enforcement, durable audit, CSRF |
| 3 | Sprint 5 | SSO production, secret vault, DPIA template |
| 4 | Sprint 6 | External pen test, SOC 2 readiness assessment |
| 5 | Q+ | Formal audit engagement |

---

## API

```
GET /api/v1/omnicore/security/compliance
GET /api/v1/omnicore/security/compliance?framework=hipaa
```

---

*This document does not constitute legal advice or certification.*
