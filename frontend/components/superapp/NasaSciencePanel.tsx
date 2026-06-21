"use client";

import { Loader2, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { useSuperToolPromptListener } from "../../lib/super-tool-prompt-bus";
import { MarkdownMessage } from "../chat/MarkdownMessage";
import { Button } from "../ui/button";
import {
  fetchScienceDomains,
  streamScienceSolve,
  type ScienceDomain,
} from "../../lib/superapp";

export function NasaSciencePanel() {
  const [domains, setDomains] = useState<ScienceDomain[]>([]);
  const [domain, setDomain] = useState("general");
  const [problem, setProblem] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useSuperToolPromptListener("nasa-science-solver", (text) => setProblem(text));

  useEffect(() => {
    void fetchScienceDomains().then((d) => setDomains(d));
  }, []);

  const solve = async () => {
    if (!problem.trim() || loading) return;
    setLoading(true);
    setAnswer("");
    try {
      await streamScienceSolve(
        { problem: problem.trim(), domain, history: [] },
        (token) => setAnswer((prev) => prev + token),
      );
    } catch (e) {
      setAnswer(`**Error:** ${e instanceof Error ? e.message : "Solve failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-4">
      <header className="mb-4 flex items-center gap-2 border-b border-cyan-500/20 pb-3">
        <Rocket className="h-5 w-5 text-cyan-400" />
        <div>
          <h2 className="text-sm font-bold text-white">NASA Science Solver</h2>
          <p className="text-[10px] text-zinc-500">High-reasoning physics & space</p>
        </div>
      </header>
      <div className="grid shrink-0 gap-2 sm:grid-cols-[1fr_auto]">
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-xs text-zinc-200"
        >
          {domains.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        <Button type="button" size="sm" onClick={() => void solve()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Solve"}
        </Button>
      </div>
      <textarea
        value={problem}
        onChange={(e) => setProblem(e.target.value)}
        placeholder="Describe your science problem…"
        className="mt-2 min-h-[100px] rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-zinc-100 outline-none focus:border-cyan-500/40"
      />
      <div className="scrollbar-thin mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        {answer ? (
          <MarkdownMessage content={answer} />
        ) : (
          <p className="text-xs text-zinc-600">Results stream here.</p>
        )}
      </div>
    </div>
  );
}

