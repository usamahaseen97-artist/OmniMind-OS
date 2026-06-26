# License Verification

OmniMind OS is released under the **Apache License, Version 2.0**.

---

## License file

| File | Status |
|------|--------|
| [LICENSE](../LICENSE) | ✅ Present — Apache 2.0 |
| SPDX identifier | `Apache-2.0` |

---

## Verification steps

### 1. Confirm LICENSE exists

```bash
test -f LICENSE && head -5 LICENSE
```

Expected: `Apache License` / `Version 2.0`

### 2. Verify README badge

Root [README.md](../README.md) includes:

```markdown
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
```

### 3. Third-party dependency audit

```bash
# Python
pip install pip-licenses
pip-licenses --from=mixed --format=markdown -r backend/requirements.txt

# Node (frontend)
cd frontend && npx license-checker --summary
```

Review output for incompatible copyleft licenses in production dependencies.

### 4. Contributor agreement

All contributions are licensed under Apache 2.0 per [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Attribution

Copyright 2026 OmniMind Contributors.

Third-party components retain their respective licenses. See package lockfiles:

- `frontend/package-lock.json`
- `backend/requirements.txt`

---

## Commercial use

Apache 2.0 permits commercial use, modification, and distribution with attribution and NOTICE requirements. No trademark rights are granted.

---

## Questions

Legal inquiries: legal@omnimind.app

---

## Related

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)
