"use client";

import { useCallback } from "react";
import { useMarketingCampaign } from "../../lib/marketing-campaign-store";

function renderCaptionRich(text: string) {
  const tokens = text.split(/(\s+|#[\w\u0900-\u097F]+|\p{Extended_Pictographic}+)/gu);
  return tokens.map((token, i) => {
    if (!token) return null;
    if (token.startsWith("#")) {
      return (
        <span key={i} className="font-semibold omni-accent-text">
          {token}
        </span>
      );
    }
    if (/\p{Extended_Pictographic}/u.test(token)) {
      return (
        <span key={i} className="text-[1.12em]">
          {token}
        </span>
      );
    }
    return <span key={i}>{token}</span>;
  });
}

export function MarketingSocialCaptionPanel() {
  const { socialCaption, loading } = useMarketingCampaign();

  const copyCaption = useCallback(async () => {
    if (!socialCaption) return;
    try {
      await navigator.clipboard.writeText(socialCaption);
    } catch {
      /* ignore */
    }
  }, [socialCaption]);

  const shareCaption = useCallback(async () => {
    if (!socialCaption) return;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ text: socialCaption });
        return;
      } catch {
        /* fall through */
      }
    }
    await copyCaption();
  }, [copyCaption, socialCaption]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden p-3">
      <div
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border"
        style={{
          borderColor: "#334155",
          background: "linear-gradient(160deg, #111827 0%, #0B0F19 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 24px rgba(168,85,247,0.06)",
        }}
      >
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2"
          style={{ borderColor: "#1E293B" }}
        >
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] omni-accent-text">Social Caption:</p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={copyCaption}
              disabled={!socialCaption}
              className="omni-state-ring rounded-md border px-2.5 py-1 text-[8px] font-semibold transition hover:brightness-110 disabled:opacity-40"
              style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}
            >
              📋 Copy
            </button>
            <button
              type="button"
              onClick={shareCaption}
              disabled={!socialCaption}
              className="omni-state-ring rounded-md border px-2.5 py-1 text-[8px] font-semibold transition hover:brightness-110 disabled:opacity-40"
              style={{ borderColor: "#1E293B", color: "var(--omni-text-muted)" }}
            >
              🔗 Share
            </button>
          </div>
        </div>
        <div className="ide-pane-scroll omni-pro-scroll min-h-0 flex-1 overflow-y-auto p-4">
          <p
            className="font-mono text-[11px] leading-relaxed"
            style={{
              color: "var(--omni-text)",
              wordWrap: "break-word",
              overflowWrap: "anywhere",
              whiteSpace: "pre-wrap",
            }}
          >
            {loading ? (
              <span className="animate-pulse omni-accent-text">Generating high-converting copy…</span>
            ) : socialCaption ? (
              renderCaptionRich(socialCaption)
            ) : (
              <span style={{ color: "var(--omni-text-muted)" }}>
                Campaign execute karein — mutton business ke hashtags aur marketing copy yahan highlight hoke
                dikhega. Copy ya Share seedha yahan se.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
