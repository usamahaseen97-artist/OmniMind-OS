import type { DevTrioSlug } from "./dev-trio";

export type TerminalLineKind = "info" | "success" | "warn" | "error" | "route" | "compile";

export type TerminalLine = {
  id: string;
  text: string;
  kind: TerminalLineKind;
  ts: number;
};

export type DevWarning = {
  id: string;
  label: string;
  detail: string;
  severity: "warn" | "error";
};

let lineCounter = 0;

export function nextTerminalLine(
  text: string,
  kind: TerminalLineKind = "info",
): TerminalLine {
  lineCounter += 1;
  return { id: `t-${lineCounter}`, text, kind, ts: Date.now() };
}

/** Realistic Next.js / Uvicorn style boot sequence */
export function bootTelemetrySequence(slug: DevTrioSlug): TerminalLine[] {
  const routes: { path: string; ms: number }[] = [
    { path: `/${slug}`, ms: 6900 },
    { path: "/medical-diagnostic", ms: 506 },
    { path: "/omniforge-engine", ms: 6922 },
    { path: "/api/health", ms: 1680 },
  ];

  const lines: TerminalLine[] = [
    nextTerminalLine("▸ uvicorn main:app --reload --port 8001", "info"),
    nextTerminalLine("INFO:     Uvicorn running on http://127.0.0.1:8001", "route"),
    nextTerminalLine("▸ next dev --turbo", "info"),
    nextTerminalLine("  ▲ Next.js 15.2 · Turbopack", "info"),
    nextTerminalLine(`○ Compiling /${slug} ...`, "compile"),
    nextTerminalLine(
      `✓ Compiled /${slug} in 14.9s (1789 modules)`,
      "success",
    ),
  ];

  for (const r of routes) {
    lines.push(nextTerminalLine(`GET ${r.path} 200 in ${r.ms}ms`, "route"));
  }

  return lines;
}

export function classifyTerminalLine(text: string): TerminalLineKind {
  if (text.startsWith("✓") || text.includes("Compiled") || text.includes("200 in")) return "success";
  if (text.startsWith("⚠") || text.toLowerCase().includes("warn")) return "warn";
  if (text.startsWith("✗") || text.toLowerCase().includes("error")) return "error";
  if (text.includes("Compiling") || text.startsWith("○")) return "compile";
  if (text.includes("GET ") || text.includes("uvicorn") || text.includes("Uvicorn")) return "route";
  return "info";
}

export function emitDevTerminalLine(text: string, kind?: TerminalLineKind) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("omnimind:dev-terminal-line", {
      detail: nextTerminalLine(text, kind ?? classifyTerminalLine(text)),
    }),
  );
}
