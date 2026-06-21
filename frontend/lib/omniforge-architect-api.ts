import { getBackendUrl } from "./backend-url";
import type { OmniForgeTargetStack } from "./omniforge-project-profile";
import { apiTargetStack } from "./omniforge-project-profile";

export type DatabaseChoice = "mongodb" | "postgresql" | "mysql" | "supabase" | "firebase" | "sqlite" | "redis_cache";

export type ArchitectAnalysis = {
  title: string;
  domain: string;
  domain_label: string;
  scaffold_adapter: string;
  preview_mode: string;
  languages: string[];
  mode: string;
  target_stack: string;
  database: {
    recommended: DatabaseChoice;
    score: number;
    reason: string;
    alternatives: { id: DatabaseChoice; score: number; reason: string }[];
    requires_approval: boolean;
    migration_ready: boolean;
  };
  folder_tree: string[];
  features: string[];
  auth: { strategy: string; providers: string[]; jwt: boolean };
  env_bindings: { key: string; scope: string }[];
  routing: { frontend: string; api_prefix: string };
};

export type ArchitectPlan = {
  phases: { id: string; status: string; awaiting_approval?: boolean }[];
  analysis: ArchitectAnalysis;
};

export async function analyzeArchitectRequirements(
  prompt: string,
  opts?: { targetStack?: OmniForgeTargetStack; mode?: "coding" | "terminal" | "vibe" },
): Promise<{ ok: boolean; analysis?: ArchitectAnalysis; plan?: ArchitectPlan; error?: string }> {
  const base = getBackendUrl();
  try {
    const res = await fetch(`${base}/api/v1/build-engine/omniforge/architect/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        target_stack: apiTargetStack(opts?.targetStack ?? "polyglot"),
        mode: opts?.mode ?? "vibe",
      }),
    });
    if (!res.ok) return { ok: false, error: `architect analyze failed (${res.status})` };
    return res.json();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "architect analyze failed" };
  }
}

export async function fetchPolyglotRegistry(): Promise<{ languages: string[]; domains: string[] } | null> {
  const base = getBackendUrl();
  try {
    const res = await fetch(`${base}/api/v1/build-engine/omniforge/polyglot/registry`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return { languages: data.languages ?? [], domains: data.domains ?? [] };
  } catch {
    return null;
  }
}

export function dispatchArchitectEvent(detail: {
  phase: string;
  analysis?: ArchitectAnalysis;
  database?: ArchitectAnalysis["database"];
  plan?: ArchitectPlan;
}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("omnimind:omniforge-architect", { detail }));
}
