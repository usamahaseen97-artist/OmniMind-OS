import { getBackendUrl } from "./backend-url";

export async function approveDatabase(
  database: string,
  prompt: string,
  approved: boolean,
): Promise<{ ok: boolean; files?: { path: string; content: string; language?: string }[]; message?: string }> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/v1/build-engine/omniforge/database/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ database, prompt, approved }),
  });
  if (!res.ok) return { ok: false, message: `approve failed (${res.status})` };
  return res.json();
}

export async function oneClickDeploy(opts: {
  target?: "vercel" | "netlify" | "railway" | "docker";
  projectName?: string;
  customDomain?: string;
}): Promise<{ ok: boolean; terminal_log?: string[]; preview_url?: string }> {
  const base = getBackendUrl();
  const res = await fetch(`${base}/api/v1/build-engine/omniforge/deploy/one-click`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      target: opts.target ?? "vercel",
      project_name: opts.projectName ?? "omnimind-app",
      custom_domain: opts.customDomain,
    }),
  });
  if (!res.ok) return { ok: false };
  return res.json();
}
