"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { useEnterpriseAnalytics } from "../../../lib/enterprise-analytics-context";

export function NLAnalyticsBar() {
  const { askNL, nlAnswer } = useEnterpriseAnalytics();
  const [q, setQ] = useState("");

  return (
    <div className="shrink-0 border-b border-white/[0.06] bg-black/30 px-2 py-1.5">
      <form
        className="flex items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          if (!q.trim()) return;
          askNL(q.trim());
          setQ("");
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Ask: "Which region had highest profit?" · "Predict next month sales"'
          className="min-w-0 flex-1 bg-transparent text-[10px] text-zinc-200 outline-none placeholder:text-zinc-600"
        />
        <button type="submit" className="rounded p-1 text-emerald-400 hover:bg-emerald-500/10">
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
      {nlAnswer ? <p className="mt-1 text-[9px] leading-relaxed text-cyan-300/90">{nlAnswer}</p> : null}
    </div>
  );
}
