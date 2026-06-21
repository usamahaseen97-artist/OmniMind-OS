import type { IDEProjectFile } from "./omnimind-ide-config";
import type { SovereignToolSlug } from "./sovereign-tool-registry";

/** Slugs that receive the portfolio file-tree explorer (image_24). */
export const DEV_FILE_TREE_SLUGS = [
  "omniforge-engine",
] as const satisfies readonly SovereignToolSlug[];

export type DevFileTreeSlug = (typeof DEV_FILE_TREE_SLUGS)[number];

/** Business Website Development — monetization web architecture */
export const BUSINESS_WEB_FILE_TREE: IDEProjectFile[] = [
  { path: "frontend/", content: "", isFolder: true },
  { path: "frontend/components/", content: "", isFolder: true },
  {
    path: "frontend/components/LandingHero.tsx",
    content: "export function LandingHero() { return null; }\n",
    language: "typescript",
  },
  { path: "frontend/pages/", content: "", isFolder: true },
  { path: "frontend/pages/checkout/", content: "", isFolder: true },
  {
    path: "frontend/pages/checkout/index.tsx",
    content: "export default function Checkout() {}\n",
    language: "typescript",
  },
  { path: "backend/", content: "", isFolder: true },
  { path: "backend/controllers/", content: "", isFolder: true },
  {
    path: "backend/controllers/salesController.py",
    content: "class SalesController:\n    pass\n",
    language: "python",
  },
  { path: "backend/models/", content: "", isFolder: true },
  {
    path: "backend/models/inventory.db",
    content: "",
    language: "plaintext",
  },
];

/** App & Websites Development — full-stack mobile/web workspace */
export const APP_WEB_FILE_TREE: IDEProjectFile[] = [
  { path: "src/", content: "", isFolder: true },
  { path: "src/app/", content: "", isFolder: true },
  {
    path: "src/app/page.tsx",
    content: "export default function Page() {}\n",
    language: "typescript",
  },
  { path: "src/hooks/", content: "", isFolder: true },
  {
    path: "src/hooks/useAuth.ts",
    content: "export function useAuth() { return null; }\n",
    language: "typescript",
  },
  { path: "backend/", content: "", isFolder: true },
  { path: "backend/routers/", content: "", isFolder: true },
  {
    path: "backend/routers/api.py",
    content: "from fastapi import APIRouter\nrouter = APIRouter()\n",
    language: "python",
  },
  {
    path: "backend/main.py",
    content: "# FastAPI entry\n",
    language: "python",
  },
];

/** Game Development — modular engine algorithm structure */
export const GAME_ENGINE_FILE_TREE: IDEProjectFile[] = [
  { path: "assets/", content: "", isFolder: true },
  { path: "assets/sprites/", content: "", isFolder: true },
  { path: "assets/sprites/player.png", content: "", language: "plaintext" },
  { path: "physics/", content: "", isFolder: true },
  {
    path: "physics/collision_engine.js",
    content: "export function resolveCollisions(bodies) {}\n",
    language: "javascript",
  },
  { path: "scenes/", content: "", isFolder: true },
  {
    path: "scenes/Level1.js",
    content: "export const Level1 = { spawn: [0, 0] };\n",
    language: "javascript",
  },
  { path: "states/", content: "", isFolder: true },
  {
    path: "states/gameState.js",
    content: "export const gameState = { score: 0, lives: 3 };\n",
    language: "javascript",
  },
];

export function isDevFileTreeSlug(slug: string): slug is DevFileTreeSlug {
  return (DEV_FILE_TREE_SLUGS as readonly string[]).includes(slug);
}

export function devFileTreeForSlug(slug: string): IDEProjectFile[] {
  if (slug === "omniforge-engine") {
    return [...APP_WEB_FILE_TREE, ...BUSINESS_WEB_FILE_TREE, ...GAME_ENGINE_FILE_TREE];
  }
  if (slug === "business-site-maker") return BUSINESS_WEB_FILE_TREE;
  if (slug === "app-builder") return APP_WEB_FILE_TREE;
  if (slug === "game-dev") return GAME_ENGINE_FILE_TREE;
  return [];
}
