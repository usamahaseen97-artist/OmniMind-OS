"use client";

import { useState } from "react";
import { Cloud, Loader2, Rocket } from "lucide-react";
import { oneClickDeploy } from "../../lib/omniforge-deploy-api";
import { useOmniMindEcosystemOptional } from "../../lib/omnimind-ecosystem-context";

/** One-click deploy strip — Vercel / Netlify / custom domain. */
export function OmniMindDeployStrip({ onLog }: { onLog?: (line: string) => void }) {
  const eco = useOmniMindEcosystemOptional();
  const [deploying, setDeploying] = useState(false);
  const [domain, setDomain] = useState("");

  const deploy = async (target: "vercel" | "netlify" | "railway") => {
    setDeploying(true);
    try {
      const res = await oneClickDeploy({
        target,
        projectName: eco?.projectTabs.find((t) => t.id === eco.activeProjectTabId)?.name ?? "omnimind-app",
        customDomain: domain || undefined,
      });
      for (const line of res.terminal_log ?? []) onLog?.(line);
      if (res.preview_url) eco?.pushNotification(`Deploy queued → ${res.preview_url}`, "success");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-white/[0.04] bg-[#0c0d12] px-2 py-1">
      <Rocket className="h-3 w-3 text-violet-400" />
      <button
        type="button"
        disabled={deploying}
        onClick={() => void deploy("vercel")}
        className="rounded px-2 py-0.5 text-[8px] font-semibold text-zinc-400 hover:bg-white/[0.04] hover:text-cyan-300 disabled:opacity-40"
      >
        Vercel
      </button>
      <button
        type="button"
        disabled={deploying}
        onClick={() => void deploy("netlify")}
        className="rounded px-2 py-0.5 text-[8px] font-semibold text-zinc-400 hover:bg-white/[0.04] hover:text-cyan-300 disabled:opacity-40"
      >
        Netlify
      </button>
      <input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="custom domain"
        className="max-w-[120px] rounded border border-white/[0.06] bg-transparent px-1.5 py-0.5 font-mono text-[8px] text-zinc-400 outline-none"
      />
      {deploying ? <Loader2 className="h-3 w-3 animate-spin text-cyan-400" /> : <Cloud className="h-3 w-3 text-zinc-600" />}
    </div>
  );
}
