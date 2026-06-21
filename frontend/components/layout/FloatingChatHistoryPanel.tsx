"use client";

import type { RefObject } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { cn } from "../../lib/utils";

interface FloatingChatHistoryPanelProps {
  open: boolean;
  onClose: () => void;
  toggleRef: RefObject<HTMLElement | null>;
  userId: string;
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat?: () => void;
}

/**
 * Glassmorphic flyout anchored under the top-left command rail.
 */
export function FloatingChatHistoryPanel({
  open,
  onClose,
  toggleRef,
  userId,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: FloatingChatHistoryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !toggleRef.current) {
      setAnchor(null);
      return;
    }
    const el = toggleRef.current;
    const update = () => {
      const r = el.getBoundingClientRect();
      setAnchor({ top: r.bottom + 8, left: r.left });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, toggleRef]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (toggleRef.current?.contains(target)) return;
      onClose();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, toggleRef]);

  if (!open || !anchor) return null;

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Chat history"
      style={{ top: anchor.top, left: anchor.left }}
      className={cn(
        "fixed z-[90]",
        "max-h-[400px] w-[260px]",
        "rounded-xl border border-emerald-500/20 bg-[#0D0E12]/95 p-3 pt-3",
        "shadow-2xl shadow-black/40 backdrop-blur-xl",
        "history-flyout-in",
      )}
    >
      <p className="mb-2 shrink-0 text-[10px] font-bold uppercase tracking-[0.22em] text-[#10B981]">
        Chat History
      </p>
      <div className="flex max-h-[340px] min-h-0 flex-col overflow-hidden rounded-lg border border-emerald-500/20 bg-[#0B0C10]/50">
        <ChatHistoryPanel
          userId={userId}
          activeSessionId={activeSessionId}
          onSelectSession={onSelectSession}
          onNewChat={onNewChat}
          embedded
          floating
        />
      </div>
    </div>
  );
}
