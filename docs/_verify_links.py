"""Verify internal markdown links in enterprise documentation."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"

CORE_DOCS = [
    ROOT / "README.md",
    DOCS / "README.md",
    DOCS / "ARCHITECTURE.md",
    DOCS / "INSTALLATION.md",
    DOCS / "DEPLOYMENT.md",
    DOCS / "CONFIGURATION.md",
    DOCS / "API_REFERENCE.md",
    DOCS / "SECURITY.md",
    DOCS / "CONTRIBUTING.md",
    DOCS / "DEVELOPER_GUIDE.md",
    DOCS / "TROUBLESHOOTING.md",
    DOCS / "RELEASE_NOTES.md",
    DOCS / "LICENSE.md",
]

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
SKIP_PREFIXES = ("http://", "https://", "mailto:", "#")


def resolve_link(source: Path, target: str) -> Path | None:
    if target.startswith(SKIP_PREFIXES):
        return None
    # strip anchor
    path_part = target.split("#", 1)[0]
    if not path_part:
        return source
    if path_part.startswith("/"):
        candidate = ROOT / path_part.lstrip("/")
    else:
        candidate = (source.parent / path_part).resolve()
    return candidate


def main() -> int:
    broken: list[str] = []
    checked = 0
    for doc in CORE_DOCS:
        if not doc.exists():
            broken.append(f"MISSING DOC: {doc.relative_to(ROOT)}")
            continue
        text = doc.read_text(encoding="utf-8")
        for _label, href in LINK_RE.findall(text):
            resolved = resolve_link(doc, href)
            if resolved is None:
                continue
            checked += 1
            if not resolved.exists():
                broken.append(f"{doc.relative_to(ROOT)} -> {href}")

    print(f"Checked {checked} internal links across {len(CORE_DOCS)} documents")
    if broken:
        print(f"BROKEN: {len(broken)}")
        for b in broken:
            print(f"  - {b}")
        return 1
    print("All internal links OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
