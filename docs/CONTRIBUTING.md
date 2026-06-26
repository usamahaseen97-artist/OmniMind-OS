# Contributing

Thank you for contributing to OmniMind OS. This project follows enterprise open-source practices with a protected core.

---

## Before you start

1. Read [OMNIMIND_CONSTITUTION.md](OMNIMIND_CONSTITUTION.md)
2. Read [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)
3. Set up locally: [INSTALLATION.md](INSTALLATION.md)

---

## Protected systems — do not redesign

| System | Scope |
|--------|-------|
| OmniForge Engine | Core generation runtime |
| OmniForge Code Generation | Codegen pipelines |
| Architectural Designer Core | Architect API routes |

Integration via existing interfaces only (`SovereignToolPage`, workbench shell).

---

## Development workflow

```bash
# 1. Fork and branch
git checkout -b feat/your-feature

# 2. Install and test
cd backend && pytest tests/ -q
cd frontend && npm run test

# 3. Lint / typecheck
npm run lint --prefix frontend
python -m compileall -q backend

# 4. Commit (conventional commits)
git commit -m "feat(omnicore): describe change"

# 5. Open PR against master
```

### Commit message format

```
<type>(<scope>): <description>

Types: feat, fix, docs, test, chore, refactor, perf, ci
Scopes: omnicore, frontend, infra, qa, docs
```

---

## Pull request checklist

- [ ] Tests pass (`pytest`, `npm run test`)
- [ ] No secrets in diff
- [ ] Documentation updated if API/behavior changed
- [ ] Protected systems untouched (unless approved)
- [ ] Conventional commit messages

---

## Code standards

| Area | Standard |
|------|----------|
| Python | `compileall` clean, type hints on new code |
| TypeScript | `tsc --noEmit` zero errors |
| API routes | Pydantic models — no `dict[str, Any]` bodies on platform routers |
| Auth | `platform_router_dependencies()` on new platform routers |

---

## Reporting security issues

**Do not open public issues for vulnerabilities.**

Email: security@omnimind.app (or repository security advisory tab).

---

## Code of conduct

Be respectful, constructive, and inclusive. Harassment is not tolerated.

---

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](../LICENSE).

See [LICENSE.md](LICENSE.md) for verification steps.
