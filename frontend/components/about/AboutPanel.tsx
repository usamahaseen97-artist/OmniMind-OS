"use client";

import { OMNI_TOOLS } from "../../lib/omni-tools";

export function AboutPanel() {
  return (
    <div className="scrollbar-thin h-full overflow-y-auto p-6">
      <h2 className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-2xl font-bold text-transparent">
        About OmniMind v11
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        OmniMind OS is a sovereign AI super-app — like ChatGPT or Gemini, but modular: each tool has a
        dedicated engine, left-side prompt chatbot, and right-side live output while you build.
      </p>

      <section className="mt-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-neon-green">System</h3>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          <li>· LLM: LM Studio (Llama-3) + Gemini fallback</li>
          <li>· Memory: MongoDB Atlas neural history</li>
          <li>· Search: Tavily live web context</li>
          <li>· Streaming: Kafka + Spark (Docker)</li>
          <li>· Maps: OpenStreetMap + contextual AI ranking</li>
          <li>· Voice: Web Speech API + universal translator</li>
        </ul>
      </section>

      <section className="mt-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-violet-400">All tools</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {OMNI_TOOLS.map((t) => (
            <article key={t.id} className="cockpit-card p-4">
              <h4 className="text-sm font-semibold text-white">{t.name}</h4>
              <p className="mt-1 text-[11px] text-zinc-500">{t.description}</p>
              <p className="mt-2 text-[10px] text-cyan-500/80">
                {t.kind === "dashboard"
                  ? "Universal Q&A, images, 30s video, photo enhance"
                  : t.kind === "custom-split"
                    ? "Specialized engine + split chat & live view"
                    : t.kind === "workbench"
                      ? "Prompt left · live build preview right"
                      : t.kind}
              </p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-10 text-center text-[10px] text-zinc-600">
        Founder: Usama Haseen · OmniMind V11 Sovereign Engine
      </p>
    </div>
  );
}
