"use client";

import { useState } from "react";
import { Send, Webhook } from "lucide-react";
import { OMNIFORGE_API_BASE } from "../../../../../lib/omniforge-api";

/** Built-in API tester — Postman-style stub wired to OmniForge health. */
export function OmniForgeApiTesterPanel() {
  const [method, setMethod] = useState<"GET" | "POST">("GET");
  const [url, setUrl] = useState(`${OMNIFORGE_API_BASE}/healthz`);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch(url, { method });
      const text = await res.text();
      setResponse(`${res.status} ${res.statusText}\n\n${text}`);
    } catch (err) {
      setResponse(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <Webhook className="h-3.5 w-3.5 text-indigo-400" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">API Tester</span>
      </div>
      <div className="flex gap-1 border-b border-white/[0.04] p-2">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
          className="rounded border border-white/[0.08] bg-[#0a0b10] px-1.5 py-1 font-mono text-[9px] text-zinc-300"
        >
          <option>GET</option>
          <option>POST</option>
        </select>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="min-w-0 flex-1 rounded border border-white/[0.08] bg-[#0a0b10] px-2 py-1 font-mono text-[9px] text-zinc-300 outline-none focus:ring-1 focus:ring-cyan-500/40"
        />
        <button
          type="button"
          disabled={loading}
          onClick={() => void send()}
          className="flex items-center gap-1 rounded bg-indigo-600/30 px-2 py-1 text-[9px] font-semibold text-cyan-200 disabled:opacity-40"
        >
          <Send className="h-3 w-3" />
          Send
        </button>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto p-3 font-mono text-[9px] leading-relaxed text-emerald-400/90">
        {response || "Response will appear here…"}
      </pre>
    </div>
  );
}
