"use client";

import { useState } from "react";
import { SOCIAL_PLATFORMS } from "../../../lib/visionary/marketing/constants";
import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";
import type { SocialPlatform } from "../../../lib/visionary/marketing/types";

export function SocialMediaStudio() {
  const { socialPosts, schedulePost } = useVisionaryMarketing();
  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-[10px] font-semibold uppercase text-violet-400">Social Media Studio</p>
      <div className="mb-3 flex flex-wrap gap-1">
        {SOCIAL_PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlatform(p.id)}
            className={`rounded border px-2 py-0.5 text-[8px] ${
              platform === p.id ? "border-violet-400/50 bg-violet-500/10 text-violet-200" : "border-white/[0.06] text-slate-500"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Caption · Auto Caption · Hashtags · CTA"
        className="mb-2 h-24 w-full rounded border border-white/10 bg-black/30 p-2 text-[11px] text-slate-300"
      />
      <div className="mb-4 flex gap-2">
        <button type="button" className="rounded border border-white/10 px-2 py-1 text-[8px] text-slate-500">Hashtag Manager</button>
        <button type="button" className="rounded border border-white/10 px-2 py-1 text-[8px] text-slate-500">CTA Generator</button>
        <button
          type="button"
          onClick={() => schedulePost(platform, caption || "Draft post", new Date().toISOString())}
          className="rounded bg-violet-600/80 px-3 py-1 text-[9px] text-white"
        >
          Schedule Draft
        </button>
      </div>
      <p className="mb-2 text-[9px] uppercase text-slate-600">Drafts & Scheduled</p>
      <ul className="flex-1 space-y-1 overflow-y-auto">
        {socialPosts.map((p) => (
          <li key={p.id} className="rounded bg-white/[0.03] px-2 py-1.5 text-[9px] text-slate-400">
            {p.platform} · {p.status} · {p.caption.slice(0, 40)}…
          </li>
        ))}
      </ul>
    </div>
  );
}
