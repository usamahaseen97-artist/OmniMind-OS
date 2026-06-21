"use client";

import { Mic, Plus, Square } from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import type { StagedAttachment } from "../../lib/staged-attachments";
import { cn } from "../../lib/utils";
import { InputCommandMenu, InputCommandMenuTrigger } from "./InputCommandMenu";
import { StagedAttachmentsStrip } from "./StagedAttachmentsStrip";

export interface GeminiCenterComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  loading?: boolean;
  disabled?: boolean;
  commandMenuEnabled?: boolean;
  stagedAttachments?: StagedAttachment[];
  onAttachmentsSelected?: (files: StagedAttachment[]) => void;
  onRemoveAttachment?: (id: string) => void;
  modelBadge?: string;
  placeholder?: string;
  variant?: "pill" | "workspace" | "clean";
}

/** Gemini image_17 center pill — rounded-full composer */
function GeminiCenterComposerInner({
  value,
  onChange,
  onSubmit,
  onStop,
  loading,
  disabled,
  commandMenuEnabled = false,
  stagedAttachments = [],
  onAttachmentsSelected,
  onRemoveAttachment,
  modelBadge = "Flash 11",
  placeholder = "Ask OmniMind V11...",
  variant = "pill",
}: GeminiCenterComposerProps) {
  const [local, setLocal] = useState(value);
  const [menuOpen, setMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (local !== value) onChange(local);
    }, 48);
    return () => window.clearTimeout(t);
  }, [local, onChange, value]);

  const submit = () => {
    const text = local.trim();
    if (!loading && text) {
      onChange(text);
      onSubmit();
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleForm = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const showCommandMenu = commandMenuEnabled && onAttachmentsSelected != null;

  return (
    <div className="w-full space-y-2">
      {stagedAttachments.length > 0 && onRemoveAttachment ? (
        <StagedAttachmentsStrip attachments={stagedAttachments} onRemove={onRemoveAttachment} />
      ) : null}

      <form onSubmit={handleForm} className="w-full">
        <div
          ref={shellRef}
          className={cn(
            "relative flex w-full items-center border transition-all duration-200",
            variant === "clean" &&
              "rounded-xl border-[#26262b] bg-[#16161a] p-1.5 focus-within:border-[#3e3e46]",
            variant === "workspace" &&
              "glass-panel rounded-xl p-2",
            variant === "pill" &&
              "gap-4 rounded-full border-transparent bg-[#1e1f20] px-6 py-4 focus-within:border-neutral-700",
          )}
        >
          {variant === "clean" ? (
            showCommandMenu ? (
              <>
                <InputCommandMenuTrigger
                  open={menuOpen}
                  onToggle={() => setMenuOpen((o) => !o)}
                  className="!h-7 !w-7 !border-0 !bg-transparent !p-0 !text-gray-600 !shadow-none hover:!text-gray-300"
                />
                <InputCommandMenu
                  open={menuOpen}
                  onOpenChange={setMenuOpen}
                  onAttachmentsSelected={onAttachmentsSelected}
                  anchorRef={shellRef}
                />
              </>
            ) : (
              <span className="shrink-0 px-2 text-md font-light text-gray-600">+</span>
            )
          ) : showCommandMenu ? (
            <>
              <InputCommandMenuTrigger
                open={menuOpen}
                onToggle={() => setMenuOpen((o) => !o)}
                className="!h-9 !w-9 !border-0 !bg-transparent !p-0 !text-neutral-400 !shadow-none hover:!bg-neutral-800"
              />
              <InputCommandMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                onAttachmentsSelected={onAttachmentsSelected}
                anchorRef={shellRef}
              />
            </>
          ) : (
            <button
              type="button"
              className="shrink-0 text-neutral-400 transition hover:text-neutral-200"
              aria-label="Attach"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}

          <input
            type="text"
            value={local}
            disabled={disabled}
            onChange={(e) => setLocal(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className={cn(
              "min-w-0 flex-1 bg-transparent outline-none",
              variant === "clean"
                ? "px-2 py-1.5 text-sm text-gray-200 placeholder:text-gray-600"
                : "text-sm text-white placeholder:text-neutral-500",
            )}
          />

          {variant === "clean" ? (
            <div className="flex shrink-0 items-center gap-2 px-2 font-mono text-[10px] text-gray-600">
              <span>{modelBadge}</span>
              {loading ? (
                <button type="button" onClick={onStop} className="text-gray-500 hover:text-gray-300" aria-label="Stop">
                  <Square className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button type="button" className="text-gray-500 hover:text-gray-300" aria-label="Voice input">
                  <Mic className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ) : (
            <>
          <span className="hidden shrink-0 rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-500 sm:inline">
            {modelBadge}
          </span>

          {loading ? (
            <button
              type="button"
              onClick={onStop}
              className="shrink-0 text-neutral-400 hover:text-white"
              aria-label="Stop"
            >
              <Square className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              className="shrink-0 text-neutral-400 transition hover:text-neutral-200"
              aria-label="Voice input"
            >
              <Mic className="h-5 w-5" />
            </button>
          )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export const GeminiCenterComposer = memo(GeminiCenterComposerInner);
