"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useState } from "react";
import { getOmniTool } from "../../lib/omni-tools";
import { AboutPanel } from "../about/AboutPanel";
import { DashboardHub } from "../dashboard/DashboardHub";
import { OmniMindMultiAgentChassis } from "../dashboard/OmniMindMultiAgentChassis";
import { NeuralHistoryPanel } from "../history/NeuralHistoryPanel";
import { ToolWorkbench } from "../layout/ToolWorkbench";
import { SuperToolWorkspace } from "../superapp/SuperToolWorkspace";
import { SystemModulesPanel } from "../system/SystemModulesPanel";

interface ToolsWorkspaceProps {
  routeId: string;
  userId: string;
  conversationId?: string;
  onConversationId?: (id: string) => void;
  onOpenHistoryChat?: (chatId: string) => void;
}

const IMAGE_INTENT_RE = /\b(pic|picture|make)\b/i;

function buildPollinationsUrl(prompt: string): string {
  const cleaned = prompt.replace(IMAGE_INTENT_RE, "").trim() || "OmniMind V11 sovereign neural art";
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleaned)}?width=768&height=512&nologo=true&enhance=false`;
}

export function ToolsWorkspace({
  routeId,
  userId,
  conversationId,
  onConversationId,
  onOpenHistoryChat,
}: ToolsWorkspaceProps) {
  const tool = getOmniTool(routeId);
  const [input, setInput] = useState("");
  const [imageGenActive, setImageGenActive] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");

  const isImageIntent = useCallback((text: string) => IMAGE_INTENT_RE.test(text), []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text) return;

      if (isImageIntent(text)) {
        const prompt = text.replace(IMAGE_INTENT_RE, "").trim() || "OmniMind V11";
        setImagePrompt(prompt);
        setImageUrl(buildPollinationsUrl(text));
        setImageGenActive(true);
        setInput("");
        return;
      }

      setImageGenActive(false);
      setImageUrl(null);
    },
    [input, isImageIntent],
  );

  const exitImageMode = useCallback(() => {
    setImageGenActive(false);
    setImageUrl(null);
    setImagePrompt("");
  }, []);

  const renderRoute = (): ReactNode => {
    if (routeId === "dashboard") {
      return (
        <DashboardHub
          userId={userId}
          conversationId={conversationId}
          onConversationId={onConversationId}
        />
      );
    }

    if (routeId === "about") {
      return <AboutPanel />;
    }

    if (routeId === "meta-agent") {
      return (
        <div className="scrollbar-thin h-full overflow-y-auto p-2 md:p-4">
          <OmniMindMultiAgentChassis userIdentity={userId} />
        </div>
      );
    }

    if (routeId === "system-modules") {
      return <SystemModulesPanel />;
    }

    if (routeId === "neural-history") {
      return (
        <NeuralHistoryPanel userId={userId} onOpenChat={(id) => onOpenHistoryChat?.(id)} />
      );
    }

    if (tool.kind === "custom-split") {
      return <SuperToolWorkspace toolId={routeId} />;
    }

    if (tool.kind === "workbench") {
      return <ToolWorkbench toolId={routeId} userId={userId} />;
    }

    return (
      <DashboardHub
        userId={userId}
        conversationId={conversationId}
        onConversationId={onConversationId}
      />
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0f] text-zinc-100">
      <header className="shrink-0 border-b border-violet-500/20 bg-black/40 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-violet-200">OmniMind V11</h1>
            <p className="text-xs text-zinc-400">Bismillah</p>
          </div>
          {imageGenActive ? (
            <button
              type="button"
              onClick={exitImageMode}
              className="rounded-lg border border-violet-500/30 px-3 py-1.5 text-xs text-violet-200 transition hover:bg-violet-500/10"
            >
              Back to tools
            </button>
          ) : null}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {imageGenActive && imageUrl ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
            <p className="shrink-0 text-sm text-zinc-400">
              High-speed neural render
              {imagePrompt ? (
                <>
                  {" "}
                  — <span className="text-violet-300">{imagePrompt}</span>
                </>
              ) : null}
            </p>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-violet-500/25 bg-black/50 p-2 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={imagePrompt || "OmniMind generated image"}
                className="max-h-full max-w-full rounded-xl object-contain"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 max-h-full flex-1 flex-col overflow-hidden">
            {renderRoute()}
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-violet-500/20 bg-black/50 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Try "make sunset over Karachi" or "pic neural city"'
              className="min-w-0 flex-1 rounded-xl border border-violet-500/30 bg-zinc-950/80 px-4 py-2.5 text-sm text-zinc-100 outline-none ring-violet-500/40 placeholder:text-zinc-500 focus:ring-2"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              Send
            </button>
          </div>
          <p className="text-center text-[11px] tracking-wide text-zinc-500">
            Neural & Quantum System Architecture
          </p>
        </form>
      </footer>
    </div>
  );
}
