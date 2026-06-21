import type { GeneratedFileAsset } from "./execution-preview";

export type OmniCoreModule = "omniforge-engine";

export type IDETopTab = "live-server" | "browser" | "review-code" | "llm";

export type IDEBottomTab = "problems" | "output" | "debug" | "terminal" | "ports";

export type IDERightView = "files" | "codebot";

export type IDEMainView = "architect" | "editor";

export type IDEProjectFile = {
  path: string;
  content: string;
  language?: string;
  isFolder?: boolean;
};

export const IDE_TOP_TABS: { id: IDETopTab; label: string }[] = [
  { id: "live-server", label: "Omnimind Live Server" },
  { id: "browser", label: "Browser Tab" },
  { id: "review-code", label: "Review Code" },
  { id: "llm", label: "Connection with LLM" },
];

export const IDE_MENU_ITEMS = [
  "File",
  "Edit",
  "Selection",
  "View",
  "Go",
  "Run",
  "Terminal",
  "Help",
] as const;

export const IDE_BOTTOM_TABS: { id: IDEBottomTab; label: string }[] = [
  { id: "problems", label: "Problems" },
  { id: "output", label: "Output" },
  { id: "debug", label: "Debug Console" },
  { id: "terminal", label: "Terminal" },
  { id: "ports", label: "Ports" },
];

export const CORE_MODULES: {
  id: OmniCoreModule;
  label: string;
  href: `/${OmniCoreModule}`;
  mode: "polyglot";
}[] = [
  { id: "omniforge-engine", label: "OmniForge Engine", href: "/omniforge-engine", mode: "polyglot" },
];

const BASE_TREE: IDEProjectFile[] = [
  { path: "backend/", content: "", isFolder: true },
  { path: "backend/main.py", content: "# FastAPI entry\n", language: "python" },
  { path: "backend/routers/", content: "", isFolder: true },
  { path: "backend/routers/api.py", content: "from fastapi import APIRouter\n\nrouter = APIRouter()\n", language: "python" },
  { path: "config/", content: "", isFolder: true },
  { path: "config/.env.example", content: "MONGODB_URI=\nGEMINI_API_KEY=\n", language: "plaintext" },
  { path: "frontend/", content: "", isFolder: true },
  { path: "frontend/app/page.tsx", content: "export default function Home() {\n  return <main>OmniMind App</main>;\n}\n", language: "typescript" },
  { path: "frontend/package.json", content: '{\n  "name": "omnimind-app"\n}\n', language: "json" },
  { path: "scripts/", content: "", isFolder: true },
  { path: "scripts/deploy.sh", content: "#!/bin/bash\necho Deploying…\n", language: "shell" },
  { path: "docker-compose.yml", content: "services:\n  api:\n    build: ./backend\n", language: "yaml" },
  { path: "README.md", content: "# OmniMind Generated Project\n", language: "markdown" },
];

export function defaultProjectTree(module: OmniCoreModule): IDEProjectFile[] {
  const extra: IDEProjectFile[] = [
    { path: "frontend/lib/api.ts", content: "export async function fetchData() {}\n", language: "typescript" },
    { path: "frontend/components/Dashboard.tsx", content: "export function Dashboard() { return null; }\n", language: "typescript" },
    { path: "frontend/components/Hero.tsx", content: "export function Hero() { return null; }\n", language: "typescript" },
    { path: "frontend/lib/seo.ts", content: "export const meta = { title: 'Business Site' };\n", language: "typescript" },
    { path: "frontend/src/game/", content: "", isFolder: true },
    {
      path: "frontend/src/game/Scene.ts",
      content: "export class MainScene {\n  update() {}\n}\n",
      language: "typescript",
    },
    { path: "frontend/public/sprites/", content: "", isFolder: true },
    { path: "mobile/flutter/lib/main.dart", content: "void main() {}\n", language: "dart" },
    { path: "game/engine/Core.cs", content: "public class Core {}\n", language: "csharp" },
  ];
  return [
    ...BASE_TREE,
    { path: "generated/", content: "", isFolder: true },
    ...extra,
  ];
}

export function slugToCoreModule(slug: string): OmniCoreModule {
  return "omniforge-engine";
}

export function compileLogForSlug(slug: string): string[] {
  const module = slugToCoreModule(slug);
  return compileLogForModule(module).map((line) => line.replace(`/${module}`, `/${slug}`));
}

export function mergeGeneratedFiles(
  tree: IDEProjectFile[],
  generated: GeneratedFileAsset[],
): IDEProjectFile[] {
  const map = new Map(tree.map((f) => [f.path, f]));
  for (const g of generated) {
    const prev = map.get(g.path);
    map.set(g.path, {
      path: g.path,
      content: g.content,
      language: g.language ?? prev?.language,
      isFolder: g.isFolder ?? prev?.isFolder,
    });
  }
  return Array.from(map.values()).sort((a, b) => a.path.localeCompare(b.path));
}

export function languageForPath(path: string): string {
  if (path.endsWith(".tsx") || path.endsWith(".ts")) return "typescript";
  if (path.endsWith(".py")) return "python";
  if (path.endsWith(".dart")) return "dart";
  if (path.endsWith(".cs")) return "csharp";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".yaml") || path.endsWith(".yml")) return "yaml";
  if (path.endsWith(".md")) return "markdown";
  if (path.endsWith(".sh")) return "shell";
  if (path.endsWith(".css")) return "css";
  return "plaintext";
}

export function compileLogForModule(module: OmniCoreModule): string[] {
  return [
    `$ omnimind compile --module ${module}`,
    `Compiling /${module} …`,
    "✓ Types checked",
    "✓ Bundled frontend",
    "✓ Compiled successfully in 14.3s",
  ];
}
