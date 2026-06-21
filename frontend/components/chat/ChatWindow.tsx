"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { WelcomeScreen } from "./WelcomeScreen";
import type { ChatMessage as ChatMessageType } from "../../lib/chat-api";
import type { OmniRouteId } from "../../lib/omni-tools";
import { cn } from "../../lib/utils";

interface ChatWindowProps {
  routeId: OmniRouteId | string;
  messages: ChatMessageType[];
  onFillSuggestion?: (text: string) => void;
  onRegenerate?: (prompt: string) => void;
  loadingHistory?: boolean;
  streamActive?: boolean;
  userId?: string;
  onArchitectPreview?: (preview: import("../../lib/execution-preview").ExecutionPreviewState) => void;
  onArchitectAction?: (step: number, optionId: string) => void;
  workbenchUnified?: boolean;
  geminiLayout?: boolean;
  geminiDisplayName?: string;
}

const BOTTOM_THRESHOLD = 96;

export function ChatWindow({
  routeId,
  messages,
  onFillSuggestion,
  onRegenerate,
  loadingHistory = false,
  streamActive = false,
  userId,
  onArchitectPreview,
  onArchitectAction,
  workbenchUnified,
  geminiLayout,
  geminiDisplayName,
}: ChatWindowProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const [canScroll, setCanScroll] = useState(false);
  const [awayFromBottom, setAwayFromBottom] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = parentRef.current;
    if (!el) return;
    stickToBottomRef.current = true;
    setAwayFromBottom(false);
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  const measureScroll = useCallback(() => {
    const el = parentRef.current;
    if (!el) return;
    const overflow = el.scrollHeight - el.clientHeight > 24;
    setCanScroll(overflow);
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
    stickToBottomRef.current = atBottom;
    setAwayFromBottom(overflow && !atBottom);
  }, []);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;
    measureScroll();
    el.addEventListener("scroll", measureScroll, { passive: true });
    const ro = new ResizeObserver(measureScroll);
    ro.observe(el);
    const inner = el.firstElementChild;
    if (inner) ro.observe(inner);
    return () => {
      el.removeEventListener("scroll", measureScroll);
      ro.disconnect();
    };
  }, [measureScroll, messages.length]);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    requestAnimationFrame(() => scrollToBottom(!streamActive));
  }, [messages.length, messages[messages.length - 1]?.content, streamActive, scrollToBottom]);

  if (loadingHistory && messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 text-zinc-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#10B981]/30 border-t-[#00FF87]" />
        <p className="text-xs">Loading conversation…</p>
      </div>
    );
  }

  if (messages.length === 0 && onFillSuggestion) {
    return (
      <div className="min-h-0 flex-1 overflow-hidden">
        <WelcomeScreen
          routeId={routeId}
          onFill={onFillSuggestion}
          userId={userId}
          onArchitectPreview={onArchitectPreview}
          workbenchUnified={workbenchUnified}
          geminiLayout={geminiLayout}
          geminiDisplayName={geminiDisplayName}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={parentRef}
        className="chat-scroll-visible absolute inset-0 overflow-y-auto overscroll-y-contain scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className={cn(
            "mx-auto w-full space-y-1 px-1 pb-6 pt-1",
            geminiLayout ? "max-w-4xl px-4 md:px-8" : "max-w-2xl",
          )}
        >
          {messages.map((m) => (
            <ChatMessage
              key={m.id}
              message={m}
              onRegenerate={
                m.generation_prompt && onRegenerate
                  ? () => onRegenerate(m.generation_prompt!)
                  : undefined
              }
              onArchitectAction={onArchitectAction}
            />
          ))}
        </div>
        {streamActive ? (
          <div className="sticky bottom-0 border-t border-emerald-500/10 bg-[#0B0C10]/90 px-3 py-2 backdrop-blur-sm">
            <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-[#10B981]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00FF87] shadow-[0_0_8px_#00FF87]" />
              Streaming response
            </p>
          </div>
        ) : null}
      </div>

      {canScroll && awayFromBottom ? (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className={cn(
            "absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full",
            "border border-[#00FF87]/50 bg-[#15171E]/95 px-3 py-1.5 text-[10px] font-semibold text-[#00FF87]",
            "shadow-[0_0_24px_rgba(0,255,135,0.25)] backdrop-blur-md",
            "transition hover:scale-[1.02] hover:bg-emerald-500/15 active:scale-95",
          )}
          aria-label="Scroll to latest messages"
        >
          <ChevronDown className="h-4 w-4 animate-bounce" />
          Latest
        </button>
      ) : null}

    </div>
  );
}
