"use client";

import { ArrowLeft } from "lucide-react";
import { NEURAL_CHATBOT_LABEL } from "../../lib/brand-labels";
import { cn } from "../../lib/utils";
interface UndoBackButtonProps {
  onClick: () => void;
  className?: string;
}

/** Icon-only escape to General Chatbot — no label text. */
export function UndoBackButton({ onClick, className }: UndoBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Back to ${NEURAL_CHATBOT_LABEL}`}
      aria-label={`Back to ${NEURAL_CHATBOT_LABEL}`}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        "border omni-accent-border bg-[var(--omni-bg)]/70 omni-accent-text backdrop-blur-sm",
        "transition-all duration-200 hover:brightness-110 active:scale-95 omni-glow-sm",        className,
      )}
    >
      <ArrowLeft className="h-4 w-4" />
    </button>
  );
}
