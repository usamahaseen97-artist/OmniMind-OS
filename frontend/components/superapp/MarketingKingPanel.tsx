"use client";

import { Image, Loader2, Megaphone, Sparkles, Video } from "lucide-react";
import { useState } from "react";
import { useSuperToolPromptListener } from "../../lib/super-tool-prompt-bus";
import { MarkdownMessage } from "../chat/MarkdownMessage";
import { Button } from "../ui/button";
import {
  fetchMarketingPosts,
  streamMarketingStrategy,
  type MarketingPost,
} from "../../lib/superapp";
import { PostPreviewCard } from "./PostPreviewCard";

export function MarketingKingPanel() {
  const [brand, setBrand] = useState("OmniMind");
  const [product, setProduct] = useState("");
  const [strategy, setStrategy] = useState("");
  const [posts, setPosts] = useState<MarketingPost[]>([]);
  const [audience, setAudience] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingStrategy, setLoadingStrategy] = useState(false);

  useSuperToolPromptListener("marketing-ad-king", (text) => setProduct(text));

  const generatePosts = async () => {
    if (!product.trim()) return;
    setLoadingPosts(true);
    try {
      const data = await fetchMarketingPosts({
        brand_name: brand,
        product_or_service: product,
        campaign_goal: "conversion",
      });
      setPosts(data.posts ?? []);
      setAudience(data.target_audience ?? "");
    } catch (e) {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const generateStrategy = async () => {
    if (!product.trim()) return;
    setStrategy("");
    setLoadingStrategy(true);
    try {
      await streamMarketingStrategy(
        { brief: product, brand_name: brand, platform: "multi", tone: "bold" },
        (t) => setStrategy((p) => p + t),
      );
    } finally {
      setLoadingStrategy(false);
    }
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="cockpit-hero flex items-center gap-4 border-fuchsia-500/20 bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 p-4">
        <Megaphone className="h-8 w-8 text-fuchsia-400 drop-shadow-[0_0_12px_rgba(232,121,249,0.5)]" />
        <div>
          <h2 className="bg-gradient-to-r from-fuchsia-300 via-white to-violet-300 bg-clip-text text-xl font-bold text-transparent">
            Marketing &amp; Ad King
          </h2>
          <p className="text-xs text-zinc-500">
            Strategies · captions · hashtags · image/video slots
          </p>
        </div>
      </div>

      <div className="grid gap-3 border-b border-white/[0.06] p-4 sm:grid-cols-2">
        <label className="block text-[10px] uppercase tracking-wider text-zinc-600">
          Brand
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="glass-input mt-1 w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-[10px] uppercase tracking-wider text-zinc-600">
          Product / Campaign
          <input
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Launch our AI super-app…"
            className="glass-input mt-1 w-full rounded-lg px-3 py-2 text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button
            onClick={generatePosts}
            disabled={loadingPosts}
            className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white"
          >
            {loadingPosts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Ready-made Posts
          </Button>
          <Button variant="outline" onClick={generateStrategy} disabled={loadingStrategy}>
            {loadingStrategy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Full Strategy
          </Button>
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <Image className="h-3 w-3" /> image gen
            <Video className="ml-2 h-3 w-3" /> video gen
          </span>
        </div>
      </div>

      {audience && (
        <p className="border-b border-white/[0.04] px-4 py-2 text-xs text-violet-300/80">
          Audience: {audience}
        </p>
      )}

      <div className="scrollbar-thin flex-1 overflow-y-auto p-4">
        {posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post, i) => (
              <PostPreviewCard key={`${post.platform}-${i}`} post={post} />
            ))}
          </div>
        ) : strategy ? (
          <MarkdownMessage content={strategy} />
        ) : (
          <div className="py-16 text-center text-sm text-zinc-500">
            Generate ready-made social posts with captions &amp; hashtags
          </div>
        )}
      </div>
    </div>
  );
}



