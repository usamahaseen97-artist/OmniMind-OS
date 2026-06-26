"""Release candidate OpenAPI vs router verification."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def collect_router_endpoints() -> set[tuple[str, str]]:
    """Scan router files for registered route decorators."""
    rows: set[tuple[str, str]] = set()
    for path in Path("routers").glob("*.py"):
        src = path.read_text(encoding="utf-8")
        prefix_m = re.search(r'prefix=["\']([^"\']+)["\']', src)
        prefix = prefix_m.group(1) if prefix_m else ""
        for m in re.finditer(
            r'@router\.(get|post|put|patch|delete|options|head)\(["\']([^"\']*)["\']',
            src,
            re.I,
        ):
            method = m.group(1).upper()
            sub = m.group(2)
            if sub.startswith("/"):
                full = prefix + sub
            elif sub:
                full = f"{prefix}/{sub}"
            else:
                full = prefix
            rows.add((method, full))
    return rows


def collect_openapi_endpoints() -> set[tuple[str, str]]:
    schema = app.openapi()
    rows: set[tuple[str, str]] = set()
    for path, methods in schema.get("paths", {}).items():
        for method in methods:
            if method.upper() in {"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"}:
                rows.add((method.upper(), path))
    return rows


def main() -> None:
    # Docs surfaces
    docs = client.get("/docs")
    redoc = client.get("/redoc")
    openapi_json = client.get("/openapi.json")
    print("docs_status", docs.status_code)
    print("redoc_status", redoc.status_code)
    print("openapi_json_status", openapi_json.status_code)

    router_eps = collect_router_endpoints()
    openapi_eps = collect_openapi_endpoints()

    # Normalize path params: {id} vs {project_id} — compare by pattern
    def normalize(p: str) -> str:
        return re.sub(r"\{[^}]+\}", "{}", p)

    router_norm = {(m, normalize(p)) for m, p in router_eps}
    openapi_norm = {(m, normalize(p)) for m, p in openapi_eps}

    missing_from_openapi = router_norm - openapi_norm
    extra_in_openapi = openapi_norm - router_norm

    print("router_count", len(list(app.routes)))
    print("router_file_endpoints", len(router_eps))
    print("openapi_endpoints", len(openapi_eps))
    print("missing_from_openapi", len(missing_from_openapi))
    print("extra_in_openapi", len(extra_in_openapi))

    if missing_from_openapi:
        print("MISSING_SAMPLE:")
        for row in sorted(missing_from_openapi)[:15]:
            print(" ", row)
    if extra_in_openapi:
        print("EXTRA_SAMPLE:")
        for row in sorted(extra_in_openapi)[:15]:
            print(" ", row)


if __name__ == "__main__":
    main()
