"""Generate PROJECT_TREE.md — excludes node_modules, .next, .git."""
from __future__ import annotations

import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXCLUDE = {"node_modules", ".next", ".git", "__pycache__", ".venv", "venv", "dist", "build", ".turbo", "tsconfig.tsbuildinfo"}
COLLAPSE_IF_MANY = {
    "backend/data/generated",
    "backend/data/entertainment",
    "backend/data/finance",
    "backend/data/dev_projects",
}


def tree(path: str, prefix: str = "") -> list[str]:
    try:
        entries = sorted(os.listdir(path), key=lambda x: (not os.path.isdir(os.path.join(path, x)), x.lower()))
    except (PermissionError, OSError):
        return []
    entries = [e for e in entries if e not in EXCLUDE]
    lines: list[str] = []
    rel = os.path.relpath(path, ROOT).replace("\\", "/")
    if rel in COLLAPSE_IF_MANY and len(entries) > 6:
        lines.append(f"{prefix}└── ... ({len(entries)} items)")
        return lines
    for i, name in enumerate(entries):
        full = os.path.join(path, name)
        last = i == len(entries) - 1
        branch = "└── " if last else "├── "
        is_dir = os.path.isdir(full)
        lines.append(f"{prefix}{branch}{name}{'/' if is_dir else ''}")
        if is_dir:
            ext = "    " if last else "│   "
            sub_rel = os.path.relpath(full, ROOT).replace("\\", "/")
            if sub_rel in COLLAPSE_IF_MANY:
                try:
                    n = len(os.listdir(full))
                    lines.append(f"{prefix}{ext}└── ... ({n} items)")
                except OSError:
                    pass
            else:
                lines.extend(tree(full, prefix + ext))
    return lines


def main() -> None:
    lines = ["# OmniMind Project — Directory Tree", "", "```text", "omnimind 1/"]
    lines.extend(tree(ROOT))
    lines.append("```")
    lines.append("")
    lines.append("**Ignored:** `node_modules`, `.next`, `.git`, `__pycache__`, `.venv`, `venv`")
    lines.append("")
    lines.append("**Collapsed:** large `backend/data/*` asset folders show item counts only.")
    out_path = os.path.join(ROOT, "PROJECT_TREE.md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(out_path)
    print(f"Total lines: {len(lines)}")


if __name__ == "__main__":
    main()
