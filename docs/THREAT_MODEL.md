# OmniMind Threat Model

**Methodology:** STRIDE-lite + Zero Trust assumptions  
**Scope:** OmniMind OS (frontend, backend, SDK, plugins)

---

## Assets

| Asset | Classification | Owner |
|-------|----------------|-------|
| User credentials / JWT | Secret | Auth service |
| API keys (OmniCore, integrations) | Secret | Org admin |
| AI prompts & conversations | Confidential | User/org |
| Medical records (enterprise) | PHI | Healthcare org |
| Project assets & IP | Confidential | Workspace |
| Plugin packages | Internal | Developer |
| `JWT_SECRET_KEY`, LLM keys | Secret | Platform ops |

---

## Trust Boundaries

```
┌──────────────┐     HTTPS      ┌──────────────┐     ┌─────────────┐
│   Browser    │◄──────────────►│   Next.js    │     │  Supabase   │
│  (untrusted) │                │   BFF/API    │     │  (optional) │
└──────┬───────┘                └──────┬───────┘     └─────────────┘
       │                               │
       │         /omni-api proxy        │
       └──────────────────────────────►┌──────────────┐
                                       │   FastAPI    │
                                       │   Backend    │
                                       └──────┬───────┘
                                              │
                    ┌─────────────────────────┼─────────────────┐
                    ▼                         ▼                 ▼
              MongoDB/Redis              LLM providers      Plugin sandbox
```

**Zero Trust principle:** No implicit trust inside the backend — every request should carry verifiable identity and least-privilege authorization.

---

## STRIDE Analysis

### Spoofing

| Threat | Vector | Mitigation | Status |
|--------|--------|------------|--------|
| T-S1 | Stolen JWT | Short TTL, refresh rotation, httpOnly cookies | Partial |
| T-S2 | OAuth redirect hijack | State parameter, PKCE | Planned |
| T-S3 | Passkey phishing | WebAuthn RP ID binding | Architecture |
| T-S4 | Service impersonation | Service tokens / mTLS | Planned |

### Tampering

| Threat | Vector | Mitigation | Status |
|--------|--------|------------|--------|
| T-T1 | MITM API calls | TLS everywhere | Deployment |
| T-T2 | Plugin code injection | Sandbox + signing | Partial |
| T-T3 | Request body manipulation | StrictModel validation | Partial |

### Repudiation

| Threat | Vector | Mitigation | Status |
|--------|--------|------------|--------|
| T-R1 | Deny admin action | Audit logs (security + collaboration) | Partial |
| T-R2 | Non-attributable API abuse | Request ID + actor in logs | Planned |

### Information Disclosure

| Threat | Vector | Mitigation | Status |
|--------|--------|------------|--------|
| T-I1 | Secrets in client bundle | `OmniSecretManager` blocklist | ✅ |
| T-I2 | JWT in localStorage | sessionStorage + httpOnly refresh | Partial |
| T-I3 | Verbose error messages | Validation handlers | Partial |
| T-I4 | Cross-tenant data leak | Org-scoped queries | Planned |

### Denial of Service

| Threat | Vector | Mitigation | Status |
|--------|--------|------------|--------|
| T-D1 | API flooding | slowapi rate limits + client buckets | Partial |
| T-D2 | LLM cost abuse | Inference queue + quotas | Partial |
| T-D3 | Large upload attacks | Size limits | Review |

### Elevation of Privilege

| Threat | Vector | Mitigation | Status |
|--------|--------|------------|--------|
| T-E1 | Guest → admin | RBAC + zero trust gate | ✅ Architecture |
| T-E2 | Plugin escalates perms | Capability prompts + gate | Partial |
| T-E3 | SSRF via tool endpoints | URL allowlists | Review |

---

## Attack Scenarios

### AS-1: Unauthenticated API access
**Path:** Call `/api/v1/omnicore/*` without JWT while enforcement disabled.  
**Impact:** Read/write stub enterprise data.  
**Mitigation:** Enable `JWT_ENFORCE_MIDDLEWARE`; protect OmniCore prefixes.

### AS-2: Brute force bootstrap login
**Path:** POST `/api/v1/auth/login` with default credentials.  
**Impact:** Operator access.  
**Mitigation:** Strong password hash env; rate limit; `OmniSecurityMonitor` anomaly on 5 failures.

### AS-3: Malicious plugin
**Path:** Install unsigned plugin with filesystem permission.  
**Impact:** Data exfiltration.  
**Mitigation:** `OmniPluginSecurityGate.canLoad`; strict sandbox default.

### AS-4: Medical PHI exposure
**Path:** Legacy medical route without enterprise governance.  
**Impact:** HIPAA violation.  
**Mitigation:** Route sensitive flows through medical-enterprise governance layer.

### AS-5: Token in XSS
**Path:** XSS in chat shell steals sessionStorage token.  
**Impact:** Session hijack.  
**Mitigation:** CSP headers; httpOnly cookies; input sanitization.

---

## Risk Matrix

| Likelihood / Impact | Low | Medium | High |
|---------------------|-----|--------|------|
| **High** | | T-D1 | T-S1, AS-1, AS-2 |
| **Medium** | T-R2 | T-E2, T-I2 | T-I4 |
| **Low** | T-S4 | T-T2 | AS-4 |

---

## Recommended Controls (Next Sprints)

1. **Sprint 4:** Enforce JWT on all `/api/v1/omnicore/*` and enterprise routes
2. **Sprint 4:** httpOnly refresh cookies + CSRF tokens
3. **Sprint 5:** HashiCorp Vault / AWS Secrets Manager integration
4. **Sprint 5:** WAF rules + API gateway rate limits per org
5. **Sprint 6:** SOC 2 evidence collection automation

---

*Review quarterly or after major architecture changes.*
