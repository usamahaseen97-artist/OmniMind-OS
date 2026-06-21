/** Build a live preview document URL from workspace files (self-contained for iframe blob). */

export type PreviewEntry = {
  html: string;
  entryPath: string;
};

export type WorkspaceFile = { path: string; content: string; isFolder?: boolean };

const HTML_ENTRY_CANDIDATES = [
  "preview.html",
  ".omniforge/preview.html",
  "index.html",
  "public/index.html",
  "src/index.html",
  "frontend/index.html",
  "dist/index.html",
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fileMap(files: WorkspaceFile[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const f of files) {
    if (f.isFolder || !f.content?.trim()) continue;
    const key = f.path.replace(/\\/g, "/").replace(/^\.\//, "");
    map.set(key, f.content);
  }
  return map;
}

function pickFile(map: Map<string, string>, paths: string[]): string | null {
  for (const p of paths) {
    const hit = map.get(p);
    if (hit?.trim()) return hit;
  }
  return null;
}

function extractTitle(html: string, fallback = "Omni Preview"): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m?.[1]?.trim() || fallback;
}

/** Strip ESM imports/exports so JSX can run in Babel standalone + React UMD. */
function stripJsxModuleExports(source: string): string {
  return source
    .replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "")
    .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, "")
    .replace(/export\s+default\s+function\s+(\w+)/, "function $1")
    .replace(/export\s+default\s+/, "")
    .trim();
}

function buildReactCdnPreview(title: string, appSource: string): string {
  const appBody = stripJsxModuleExports(appSource);
  const safeTitle = escapeHtml(title);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${safeTitle}</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>html,body,#root{margin:0;min-height:100%;width:100%;}</style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useMemo, useCallback, useRef } = React;
    ${appBody}
    const __root = ReactDOM.createRoot(document.getElementById("root"));
    __root.render(React.createElement(App));
  </script>
</body>
</html>`;
}

function inlineHtmlAssets(html: string, map: Map<string, string>, entryPath: string): string {
  const baseDir = entryPath.includes("/") ? entryPath.slice(0, entryPath.lastIndexOf("/") + 1) : "";

  const resolve = (href: string): string | null => {
    if (!href || href.startsWith("http") || href.startsWith("//") || href.startsWith("data:")) return null;
    const clean = href.split("?")[0]!.split("#")[0]!;
    const candidates = [
      clean.replace(/^\//, ""),
      `${baseDir}${clean.replace(/^\//, "")}`,
      clean.replace(/^\.\//, ""),
    ];
    return pickFile(map, candidates);
  };

  let out = html;

  out = out.replace(
    /<link([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
    (full, pre, href, post) => {
      const css = resolve(href);
      if (!css) return full;
      return `<style data-inlined-from="${escapeHtml(href)}">${css}</style>`;
    },
  );

  out = out.replace(
    /<script([^>]*?)src=["']([^"']+)["']([^>]*?)><\/script>/gi,
    (full, pre, src, post) => {
      const js = resolve(src);
      if (!js) return full;
      const type = /type=["']module["']/i.test(pre + post) ? "" : "";
      return `<script${type} data-inlined-from="${escapeHtml(src)}">\n${js}\n</script>`;
    },
  );

  return out;
}

function detectReactApp(map: Map<string, string>): string | null {
  return pickFile(map, [
    "src/App.jsx",
    "src/App.tsx",
    "src/app.jsx",
    "src/app.tsx",
    "src/components/App.jsx",
    "src/components/App.tsx",
    "frontend/app/page.tsx",
    "frontend/pages/index.tsx",
  ]);
}

export function findPreviewEntry(files: WorkspaceFile[]): PreviewEntry | null {
  const map = fileMap(files);

  for (const path of HTML_ENTRY_CANDIDATES) {
    const content = map.get(path);
    if (content) return { html: content, entryPath: path };
  }

  const anyHtml = files.find((f) => !f.isFolder && f.path.endsWith(".html") && f.content?.trim());
  if (anyHtml) return { html: anyHtml.content, entryPath: anyHtml.path.replace(/\\/g, "/") };

  const reactApp = detectReactApp(map);
  if (reactApp) {
    const title = extractTitle(reactApp, "OmniForge Preview");
    return {
      html: buildReactCdnPreview(title, reactApp),
      entryPath: "virtual:react-preview",
    };
  }

  return null;
}

/**
 * Compose a self-contained HTML document for iframe blob preview.
 * Resolves Vite/React scaffold paths and inlines workspace assets.
 */
export function composePreviewDocument(files: WorkspaceFile[]): string | null {
  const map = fileMap(files);
  const entry = findPreviewEntry(files);
  if (!entry) return null;

  if (entry.entryPath === "virtual:react-preview") {
    return entry.html;
  }

  const reactApp = detectReactApp(map);
  const html = entry.html;
  const needsReactCdn =
    reactApp &&
    (html.includes("/src/main") ||
      html.includes("./src/main") ||
      html.includes('type="module"') ||
      html.includes("type='module'"));

  if (needsReactCdn && reactApp) {
    return buildReactCdnPreview(extractTitle(html), reactApp);
  }

  const previewOnly = map.get("preview.html") ?? map.get(".omniforge/preview.html");
  if (previewOnly && !previewOnly.includes("/src/main")) {
    return previewOnly;
  }

  return inlineHtmlAssets(html, map, entry.entryPath);
}

export function buildPreviewBlobUrl(html: string): string {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  return URL.createObjectURL(blob);
}

/** Preferred API — builds blob URL from full workspace file tree. */
export function buildPreviewBlobUrlFromWorkspace(files: WorkspaceFile[]): string | null {
  const doc = composePreviewDocument(files);
  if (!doc) return null;
  return buildPreviewBlobUrl(doc);
}

/** True when at least one incremental file can render a live preview iframe. */
export function canComposePreview(files: WorkspaceFile[]): boolean {
  return composePreviewDocument(files) !== null;
}

/** Foundational files streamed first for incremental preview. */
export const PREVIEW_STREAM_PRIORITY = [
  "preview.html",
  ".omniforge/preview.html",
  "index.html",
  "src/App.jsx",
  "src/App.tsx",
  "src/main.jsx",
  "src/main.js",
  "package.json",
] as const;

export function orderFilesForStreaming<T extends { path: string }>(files: T[]): T[] {
  const byPath = new Map(files.map((f) => [f.path.replace(/\\/g, "/"), f]));
  const ordered: T[] = [];
  for (const p of PREVIEW_STREAM_PRIORITY) {
    const hit = byPath.get(p);
    if (hit) {
      ordered.push(hit);
      byPath.delete(p);
    }
  }
  ordered.push(...byPath.values());
  return ordered;
}

export type DevicePreset = "mobile" | "tablet" | "desktop";

export const DEVICE_FRAMES: Record<DevicePreset, { width: number; height: number; label: string }> = {
  mobile: { width: 390, height: 844, label: "Mobile" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  desktop: { width: 1280, height: 800, label: "Desktop" },
};
