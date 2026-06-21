"use client";

export type PreviewElement = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const DEFAULT_PREVIEW_ELEMENTS: PreviewElement[] = [
  { id: "hero-block", label: "Hero Block", x: 24, y: 32, width: 200, height: 56 },
  { id: "cta-button", label: "CTA Button", x: 24, y: 108, width: 128, height: 40 },
];

export const GAME_PREVIEW_ELEMENTS: PreviewElement[] = [
  { id: "player-sprite", label: "Player Sprite", x: 48, y: 120, width: 64, height: 64 },
  { id: "score-hud", label: "Score HUD", x: 16, y: 24, width: 100, height: 32 },
  { id: "enemy-block", label: "Enemy", x: 160, y: 80, width: 48, height: 48 },
];

export const APP_PREVIEW_ELEMENTS: PreviewElement[] = [
  { id: "travel-card", label: "Greek Travel Card", x: 20, y: 40, width: 220, height: 120 },
  { id: "cta-button", label: "Book Now", x: 20, y: 180, width: 140, height: 44 },
];

const STYLES_PATH = "frontend/app/preview-layout.css";

export function generateLayoutCss(elements: PreviewElement[]): string {
  const blocks = elements.map(
    (el) =>
      `.${el.id} {\n  position: absolute;\n  left: ${Math.round(el.x)}px;\n  top: ${Math.round(el.y)}px;\n  width: ${Math.round(el.width)}px;\n  height: ${Math.round(el.height)}px;\n}`,
  );
  return `/* OmniMind WYSIWYG sync — auto-generated */\n${blocks.join("\n\n")}\n`;
}

export function mergeLayoutIntoProject(
  projectFiles: { path: string; content: string; language?: string; isFolder?: boolean }[],
  elements: PreviewElement[],
): { path: string; content: string; language?: string; isFolder?: boolean }[] {
  const css = generateLayoutCss(elements);
  const existing = projectFiles.find((f) => f.path === STYLES_PATH);
  if (existing) {
    return projectFiles.map((f) => (f.path === STYLES_PATH ? { ...f, content: css } : f));
  }
  return [
    ...projectFiles,
    { path: STYLES_PATH, content: css, language: "css" },
  ];
}

export const PREVIEW_STYLES_PATH = STYLES_PATH;
