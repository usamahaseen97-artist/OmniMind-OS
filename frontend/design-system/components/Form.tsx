"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { ds } from "./styles";

const fieldClass = cn(
  "w-full rounded-lg border border-[color:var(--omni-ds-border-subtle)] bg-[color:var(--omni-ds-bg-input)]",
  "px-3 py-2 text-[11px] text-[color:var(--omni-ds-text-primary)] placeholder:text-[color:var(--omni-ds-text-muted)]",
  "focus:border-[color:var(--omni-ds-border-focus)] focus:outline-none focus:ring-1 focus:ring-[color:var(--omni-ds-a11y-focus-ring)]",
  ds.focusRing,
);

export const DSInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldClass, className)} {...props} />,
);
DSInput.displayName = "DSInput";

export const DSTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClass, "min-h-[4rem] resize-y", className)} {...props} />
  ),
);
DSTextarea.displayName = "DSTextarea";
