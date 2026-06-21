"use client";

import { useCallback } from "react";
import { useMarketingCampaign } from "../../lib/marketing-campaign-store";
import { useWorkbenchLive } from "../../lib/workbench-live-store";

export function MarketingHubUtilityBar() {
  const live = useWorkbenchLive();
  const campaign = useMarketingCampaign();

  const promptText = live.lastPrompt || campaign.lastPrompt || "";

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promptText);
    } catch {
      /* ignore */
    }
  }, [promptText]);

  const saveAd = useCallback(() => {
    try {
      localStorage.setItem(
        "omnimind-marketing-ad",
        JSON.stringify({
          savedAt: new Date().toISOString(),
          prompt: promptText,
          imageAdUrl: campaign.imageAdUrl,
          videoAdUrl: campaign.videoAdUrl,
          socialCaption: campaign.socialCaption,
        }),
      );
    } catch {
      /* ignore */
    }
  }, [campaign.imageAdUrl, campaign.socialCaption, campaign.videoAdUrl, promptText]);

  const shareAd = useCallback(async () => {
    const text = campaign.socialCaption || promptText;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "OmniMind Ad Campaign", text });
        return;
      } catch {
        /* ignore */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }, [campaign.socialCaption, promptText]);

  const exportAsset = useCallback(() => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            prompt: promptText,
            image_ad_url: campaign.imageAdUrl,
            video_ad_url: campaign.videoAdUrl,
            social_caption: campaign.socialCaption,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marketing-campaign-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [campaign.imageAdUrl, campaign.socialCaption, campaign.videoAdUrl, promptText]);

  const btn =
    "omni-state-ring flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-medium transition hover:brightness-110";

  return (
    <div
      className="flex shrink-0 items-center justify-end gap-2 border-b px-4 py-2.5"
      style={{ borderColor: "#1E293B", background: "#111827" }}
    >
      <button type="button" onClick={copyPrompt} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text)" }}>
        📋 Copy Prompt
      </button>
      <button type="button" onClick={saveAd} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text)" }}>
        💾 Save Ad
      </button>
      <button type="button" onClick={shareAd} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text)" }}>
        🔗 Share Ad
      </button>
      <button type="button" onClick={exportAsset} className={btn} style={{ borderColor: "#1E293B", color: "var(--omni-text)" }}>
        📤 Export Asset
      </button>
    </div>
  );
}
