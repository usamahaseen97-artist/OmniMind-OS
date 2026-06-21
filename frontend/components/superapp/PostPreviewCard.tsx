"use client";

import { Film, ImageIcon, Layers } from "lucide-react";
import type { MarketingPost } from "../../lib/superapp";
import { cn } from "../../lib/utils";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "from-fuchsia-500/30 to-orange-500/20",
  linkedin: "from-blue-500/30 to-cyan-500/20",
  tiktok: "from-violet-500/30 to-fuchsia-500/20",
  twitter: "from-sky-500/30 to-blue-500/20",
};

function MediaIcon({ type }: { type: string }) {
  if (type === "video") return <Film className="h-4 w-4" />;
  if (type === "carousel") return <Layers className="h-4 w-4" />;
  return <ImageIcon className="h-4 w-4" />;
}

export function PostPreviewCard({ post }: { post: MarketingPost }) {
  const gradient = PLATFORM_COLORS[post.platform] ?? "from-violet-500/20 to-cyan-500/20";

  return (
    <article className="cockpit-card group overflow-hidden transition duration-300 hover:border-fuchsia-400/30 hover:shadow-[0_0_32px_rgba(192,38,211,0.15)]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-300/90">
          {post.platform}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
          <MediaIcon type={post.media_type} />
          {post.media_type}
        </span>
      </div>

      <div className={cn("relative aspect-[4/3] bg-gradient-to-br p-4", gradient)}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
        <div className="relative z-10 flex h-full flex-col justify-end">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
            AI media slot
          </p>
          <p className="mt-1 text-xs leading-snug text-zinc-200">{post.media_placeholder}</p>
        </div>
      </div>

      <div className="space-y-2 p-3">
        <h4 className="text-sm font-semibold text-white">{post.headline}</h4>
        <p className="text-xs leading-relaxed text-zinc-400">{post.caption}</p>
        <div className="flex flex-wrap gap-1">
          {post.hashtags?.slice(0, 6).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-fuchsia-500/10 px-1.5 py-0.5 text-[10px] text-fuchsia-300/90"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-[10px] font-medium text-cyan-400/80">CTA: {post.cta}</p>
      </div>
    </article>
  );
}


