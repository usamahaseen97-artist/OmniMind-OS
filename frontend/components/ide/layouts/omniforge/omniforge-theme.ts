import type { CSSProperties } from "react";

/** Premium AI IDE — glass dark theme (Cursor / VS Code / Bolt) */

export const OF = {
  bg: "#0c0d12",
  bgDeep: "#08090d",
  glass: "rgba(22, 25, 32, 0.72)",
  glassBorder: "rgba(255, 255, 255, 0.06)",
  panel: "#13151a",
  panelAlt: "#161920",
  panelCode: "#0f1117",
  panelTabs: "#12141c",
  panelAgent: "#12141c",
  panelPreview: "#0e1016",
  inputBg: "rgba(8, 9, 13, 0.85)",
  border: "#262930",
  text: "#f3f4f6",
  textMuted: "#8b929e",
  textLabel: "#b4b8c4",
  indigo: "#818cf8",
  indigoSolid: "#6366f1",
  indigoHover: "#4f46e5",
  cyan: "#22d3ee",
  cyanDim: "#06b6d4",
  cyanGlow: "rgba(34, 211, 238, 0.2)",
  purple: "#c084fc",
  purpleGlow: "rgba(192, 132, 252, 0.35)",
  purpleBorder: "rgba(168, 85, 247, 0.45)",
  success: "#34d399",
  successHover: "#10b981",
  warn: "#fbbf24",
  error: "#f87171",
  phoneBezel: "#1a1d26",
  phoneFrame: "#2a2f3a",
  terminalGreen: "#4ade80",
  rowHover: "rgba(255, 255, 255, 0.04)",
  rowActive: "rgba(99, 102, 241, 0.14)",
  shadow: "0 8px 32px rgba(0, 0, 0, 0.45)",
  radius: "10px",
  radiusSm: "6px",
} as const;

export const glassStyle: CSSProperties = {
  background: OF.glass,
  backdropFilter: "blur(16px) saturate(160%)",
  WebkitBackdropFilter: "blur(16px) saturate(160%)",
  borderColor: OF.glassBorder,
};

export function focusRing(active: boolean, color: string = OF.indigoSolid): CSSProperties {
  return active
    ? { borderColor: color, boxShadow: `0 0 0 1px ${color}40, 0 0 20px ${color}25` }
    : { borderColor: OF.border };
}

export const purpleFocusRing = (active: boolean) => focusRing(active, OF.purple);
