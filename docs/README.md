# OmniMind Documentation

Enterprise documentation for OmniMind OS V12 — open-source and production release.

---

## Core guides (start here)

| Document | Audience | Status |
|----------|----------|--------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architects, leads | ✅ Current |
| [INSTALLATION.md](INSTALLATION.md) | Developers, operators | ✅ Current |
| [DEPLOYMENT.md](DEPLOYMENT.md) | DevOps, SRE | ✅ Current |
| [CONFIGURATION.md](CONFIGURATION.md) | All engineers | ✅ Current |
| [API_REFERENCE.md](API_REFERENCE.md) | Integrators, QA | ✅ Auto-generated |
| [SECURITY.md](SECURITY.md) | Security, compliance | ✅ Current |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Contributors | ✅ Current |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Open-source contributors | ✅ Current |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Support, on-call | ✅ Current |
| [RELEASE_NOTES.md](RELEASE_NOTES.md) | Release managers | ✅ V12 |
| [LICENSE.md](LICENSE.md) | Legal, compliance | ✅ Verified |

---

## Architecture corpus

| Area | Key documents |
|------|---------------|
| System | [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [OMNICLOUD_ARCHITECTURE.md](OMNICLOUD_ARCHITECTURE.md) |
| Automation | [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md), [WORKFLOW_ARCHITECTURE.md](WORKFLOW_ARCHITECTURE.md) |
| Security | [security/ENTERPRISE_SECURITY.md](security/ENTERPRISE_SECURITY.md), [security/RBAC.md](security/RBAC.md) |
| Platform | [platform/PLUGIN_ENGINE.md](platform/PLUGIN_ENGINE.md), [SDK_GUIDE.md](SDK_GUIDE.md) |
| Operations | [KUBERNETES_GUIDE.md](KUBERNETES_GUIDE.md), [DEVOPS_GUIDE.md](DEVOPS_GUIDE.md) |

---

## Constitution & governance

- [OMNIMIND_CONSTITUTION.md](OMNIMIND_CONSTITUTION.md) — supreme engineering law
- [MASTER_DOCUMENTATION.md](MASTER_DOCUMENTATION.md) — documentation audit index

---

## Maintenance

| Tool | Purpose |
|------|---------|
| [_gen_api_ref.py](_gen_api_ref.py) | Regenerate `API_REFERENCE.md` from routers |
| [_verify_links.py](_verify_links.py) | Check internal markdown links |

```bash
python docs/_gen_api_ref.py
python docs/_verify_links.py
```

---

## Documentation coverage

| Category | Files | Notes |
|----------|-------|-------|
| Enterprise core (12 guides) | 12 | Required for Commit 6 |
| Extended corpus | 120+ | Module deep-dives, audits |
| Frontend module docs | 25+ | `frontend/docs/` |
