"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { buildPollinationsUrl } from "../../lib/live-render-pipeline";
import { generateMarketingCampaign, resolveMarketingAssetUrl } from "../../lib/marketing-campaign-api";
import {
  applyMarketingCampaign,
  setMarketingCampaignLoading,
  useMarketingCampaign,
} from "../../lib/marketing-campaign-store";
import { DEMO_VIDEO_MP4, DEMO_VIDEO_POSTER } from "../../lib/demo-media";
import { useWorkbenchLive } from "../../lib/workbench-live-store";
import { MarketingHubUtilityBar } from "./MarketingHubUtilityBar";
import { cn } from "../../lib/utils";

const PRODUCT_CATALOG = [
  { id: "mutton", label: "Dehli Mutton Pack", emoji: "🥩" },
  { id: "beef", label: "Beef Raw Pack", emoji: "🍖" },
  { id: "logo", label: "Brand Logo", emoji: "🏷️" },
] as const;

const fade = { duration: 0.22, ease: "easeInOut" as const };

function ViewportCard({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...fade, delay }}
      className="flex min-h-0 flex-col overflow-hidden rounded-2xl border"
      style={{
        borderColor: "#1E293B",
        background: "linear-gradient(165deg, #111827 0%, #0d1220 100%)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      }}
    >
      <header className="shrink-0 border-b px-4 py-2.5" style={{ borderColor: "#1E293B" }}>
        <p className="text-[10px] font-bold uppercase tracking-wider omni-accent-text">{title}</p>
        <p className="text-[8px]" style={{ color: "var(--omni-text-muted)" }}>
          {subtitle}
        </p>
      </header>
      <div className="relative min-h-0 flex-1 p-3">{children}</div>
    </motion.section>
  );
}

export function MarketingHubWorkspace() {
  const live = useWorkbenchLive();
  const campaign = useMarketingCampaign();
  const [selectedAssets, setSelectedAssets] = useState<string[]>(["Dehli Mutton Pack"]);
  const lastFetched = useRef("");

  useEffect(() => {
    const prompt = live.lastPrompt?.trim();
    if (!prompt || !live.streaming) return;
    if (lastFetched.current === prompt) return;
    lastFetched.current = prompt;

    setMarketingCampaignLoading(true);
    void generateMarketingCampaign({ prompt, assets: selectedAssets })
      .then((payload) => applyMarketingCampaign(prompt, payload))
      .catch(() => {
        applyMarketingCampaign(prompt, {
          image_ad_url: buildPollinationsUrl(
            `Ultra-realistic Dehli Mutton Pack product ad neon lighting ${prompt.slice(0, 80)}`,
          ),
          video_ad_url: DEMO_VIDEO_MP4,
          social_caption:
            "Authentic Delhi spice, perfect for every celebration. Save on your next order! 🥩🌶️ #DelhiMutton #SpiceOfLife",
        });
      });
  }, [live.lastPrompt, live.streaming, selectedAssets]);

  const imageSrc =
    resolveMarketingAssetUrl(campaign.imageAdUrl) ??
    buildPollinationsUrl("Ultra-realistic Dehli Mutton Pack neon product ad cinematic dynamic lighting");
  const videoSrc = resolveMarketingAssetUrl(campaign.videoAdUrl) ?? DEMO_VIDEO_MP4;

  const toggleAsset = (label: string) => {
    setSelectedAssets((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label],
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: "#0B0F19" }}>
      <MarketingHubUtilityBar />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 overflow-hidden p-4">
          <ViewportCard
            title="Image Ad Viewport"
            subtitle="Ultra-realistic product · dynamic neon lighting"
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-xl border"
              style={{ borderColor: "#1E293B", minHeight: "280px" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt="Image ad" className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 p-4">
                <ImageIcon className="h-4 w-4 text-white/85" />
                <span className="text-[10px] font-semibold text-white">Dehli Mutton Pack</span>
              </div>
              {campaign.loading || live.streaming ? (
                <div className="absolute left-0 right-0 top-0 h-0.5 bg-black/50">
                  <motion.div
                    className="h-full omni-accent-bg"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.6, ease: "easeInOut" }}
                  />
                </div>
              ) : null}
            </div>
          </ViewportCard>

          <ViewportCard
            title="Video Ad Viewport"
            subtitle="HTML5 player · full playback controls"
            delay={0.05}
          >
            <div
              className="relative h-full w-full overflow-hidden rounded-xl border"
              style={{ borderColor: "#1E293B", minHeight: "280px" }}
            >
              <video
                key={videoSrc}
                className="h-full w-full object-cover"
                controls
                playsInline
                poster={DEMO_VIDEO_POSTER}
                src={videoSrc}
              >
                <track kind="captions" />
              </video>
            </div>
          </ViewportCard>
        </div>

        <aside
          className="flex w-[152px] shrink-0 flex-col gap-2 overflow-y-auto border-l p-2.5"
          style={{ borderColor: "#1E293B", background: "#0B0F19" }}
        >
          <p className="px-0.5 text-[8px] font-bold uppercase tracking-wider omni-accent-text">Product Assets</p>
          {PRODUCT_CATALOG.map((p) => {
            const on = selectedAssets.includes(p.label);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleAsset(p.label)}
                className={cn(
                  "omni-state-ring flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition",
                  on ? "omni-accent-bg" : "hover:brightness-110",
                )}
                style={{ borderColor: "#1E293B" }}
              >
                <span className="text-2xl">{p.emoji}</span>
                <span className="text-[8px] leading-tight" style={{ color: "var(--omni-text-muted)" }}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
