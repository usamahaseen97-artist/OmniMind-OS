"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { DSStreamingDots } from "./AIVisuals";

type DSChatBubbleProps = {
  children: ReactNode;
  role: "user" | "assistant" | "system";
  streaming?: boolean;
  className?: string;
};

export function DSChatBubble({ children, role, streaming, className }: DSChatBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[92%] rounded-xl px-3 py-2 text-[11px] leading-relaxed",
        role === "user" &&
          "ml-auto bg-[color:var(--omni-ds-accent-primary)]/15 text-[color:var(--omni-ds-text-primary)]",
        role === "assistant" &&
          "mr-auto border border-[color:var(--omni-ds-border-subtle)] bg-[color:var(--omni-ds-bg-panel)] text-[color:var(--omni-ds-text-primary)]",
        role === "system" && "mx-auto bg-white/[0.03] text-[color:var(--omni-ds-text-muted)] text-center text-[10px]",
        className,
      )}
    >
      {children}
      {streaming ? (
        <span className="ml-1 inline-flex align-middle">
          <DSStreamingDots />
        </span>
      ) : null}
    </div>
  );
}

export function DSAIResponseCard({
  title,
  children,
  footer,
  className,
}: {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-[color:var(--omni-ds-border-subtle)] bg-[color:var(--omni-ds-bg-panel)]/95 p-3 shadow-[var(--omni-ds-elevation-md)]",
        className,
      )}
    >
      {title ? (
        <header className="mb-2 text-[9px] font-bold uppercase tracking-wider text-[color:var(--omni-ds-text-accent)]">
          {title}
        </header>
      ) : null}
      <div className="text-[11px] text-[color:var(--omni-ds-text-primary)]">{children}</div>
      {footer ? <footer className="mt-2 border-t border-[color:var(--omni-ds-border-subtle)] pt-2">{footer}</footer> : null}
    </article>
  );
}
