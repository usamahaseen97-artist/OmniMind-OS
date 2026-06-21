import type { DevTrioSlug } from "./dev-trio";
import type { IDEProjectFile } from "./omnimind-ide-config";

/** Minimal root scaffold — only created on explicit user init, never pre-seeded */
export function minimalWorkspaceScaffold(slug: DevTrioSlug): IDEProjectFile[] {
  const stamp = new Date().toISOString();
  const base: IDEProjectFile[] = [
    { path: ".omnimind/", content: "", isFolder: true },
    {
      path: ".omnimind/workspace.json",
      content: JSON.stringify({ slug, initialized_at: stamp, version: 11 }, null, 2) + "\n",
      language: "json",
    },
  ];

  return [
    ...base,
    { path: "frontend/", content: "", isFolder: true },
    { path: "backend/", content: "", isFolder: true },
    { path: "mobile/", content: "", isFolder: true },
    { path: "src/", content: "", isFolder: true },
    { path: "assets/", content: "", isFolder: true },
    { path: "public/", content: "", isFolder: true },
    { path: "config/", content: "", isFolder: true },
  ];
}

/** Expand a manual path into folder chain + optional file leaf */
export function expandManualPath(raw: string): IDEProjectFile[] {
  const normalized = raw.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized) return [];

  const isFolder = normalized.endsWith("/");
  const segments = normalized.replace(/\/$/, "").split("/").filter(Boolean);
  if (!segments.length) return [];

  const out: IDEProjectFile[] = [];
  for (let i = 0; i < segments.length; i += 1) {
    const isLast = i === segments.length - 1;
    const folderPath = `${segments.slice(0, i + 1).join("/")}/`;
    if (!isLast || isFolder) {
      out.push({ path: folderPath, content: "", isFolder: true });
    }
  }

  if (!isFolder) {
    const filePath = segments.join("/");
    out.push({
      path: filePath,
      content: "",
      language: filePath.endsWith(".tsx") || filePath.endsWith(".ts") ? "typescript" : "plaintext",
    });
  }

  return out;
}
