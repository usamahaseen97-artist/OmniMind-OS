"use client";

import { ArrowUp, Mic, Paperclip, Square } from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import type { StagedAttachment } from "../../../lib/staged-attachments";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { InputCommandMenu, InputCommandMenuTrigger } from "../../chat/InputCommandMenu";
import { StagedAttachmentsStrip } from "../../chat/StagedAttachmentsStrip";

export interface DevChatInputDockProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fileCount: number;
  onReview?: () => void;
  stagedAttachments?: StagedAttachment[];
  onAttachmentsSelected?: (files: StagedAttachment[]) => void;
  onRemoveAttachment?: (id: string) => void;
  commandMenuEnabled?: boolean;
  placeholder?: string;
  fileCountLabel?: (count: number) => string;
  showReviewChip?: boolean;
}

function DevChatInputDockInner({
  value,
  onChange,
  onSubmit,
  onStop,
  loading,
  disabled,
  fileCount,
  onReview,
  stagedAttachments = [],
  onAttachmentsSelected,
  onRemoveAttachment,
  commandMenuEnabled = true,
  placeholder = "Plan, Build, / for skills, @ for context",
  fileCountLabel = (count) => `> ${count} Files`,
  showReviewChip = true,
}: DevChatInputDockProps) {
  const [local, setLocal] = useState(value);
  const [menuOpen, setMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (local !== value) onChange(local);
    }, 48);
    return () => window.clearTimeout(t);
  }, [local, onChange, value]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [local]);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const text = local.trim();
      if (!loading && text) {
        onChange(text);
        onSubmit();
      }
    }
  };

  const handleForm = (e: FormEvent) => {
    e.preventDefault();
    const text = local.trim();
    if (!loading && text) {
      onChange(text);
      onSubmit();
    }
  };

  return (
    <div className="omni-dev-chat-dock w-full shrink-0 border-t border-purple-500/[0.12] p-3 pt-2">
      <div className="omni-chat-dock-frame omni-dev-dock-shell relative flex flex-col p-3">
        {stagedAttachments.length > 0 && onRemoveAttachment ? (
          <StagedAttachmentsStrip attachments={stagedAttachments} onRemove={onRemoveAttachment} />
        ) : null}

        <div className="mb-2 flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="min-w-0 truncate text-left font-mono text-[11px] tracking-tight transition hover:brightness-125"
            style={{ color: "var(--omni-text-muted)" }}
            title="Project files in context"
          >
            {fileCountLabel(fileCount)}
          </button>
          {showReviewChip ? (
            <button
              type="button"
              onClick={onReview}
              className="omni-violet-pill shrink-0 rounded px-2.5 py-0.5 font-mono text-[10px] tracking-tight text-[#e1dbf5]"
            >
              Review
            </button>
          ) : null}
        </div>

        <form onSubmit={handleForm} className="relative flex min-w-0 flex-col">
          <div ref={shellRef} className="relative flex min-w-0 items-end gap-1.5">
            {commandMenuEnabled && onAttachmentsSelected ? (
              <>
                <InputCommandMenuTrigger open={menuOpen} onToggle={() => setMenuOpen((o) => !o)} />
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
                title="Attachment clip"
                className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/[0.04]"
                style={{ color: "var(--omni-text-muted)" }}
                aria-label="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            )}

            <textarea
              ref={textareaRef}
              rows={1}
              value={local}
              disabled={disabled}
              onChange={(e) => setLocal(e.target.value)}
              onKeyDown={handleKey}
              placeholder={placeholder}
              className="max-h-40 min-h-[44px] min-w-0 flex-1 resize-none border-0 bg-transparent py-2 font-mono text-sm tracking-tight outline-none"
              style={{ color: "var(--omni-text)" }}
            />

            <button
              type="button"
              title="Voice input"
              className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/[0.04]"
              style={{ color: "var(--omni-text-muted)" }}
            >
              <Mic className="h-4 w-4" />
            </button>

            {loading ? (
              <Button type="button" size="icon" variant="outline" onClick={onStop} className="mb-0.5 shrink-0">
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                variant="default"
                disabled={disabled || !local.trim()}
                className="mb-0.5 shrink-0 rounded-lg"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p
            className="pointer-events-none mt-2 text-right font-mono text-[10px] tracking-wide"
            style={{ color: "var(--omni-text-muted)" }}
          >
            OmniMind Tab
          </p>
        </form>
      </div>
    </div>
  );
}

export const DevChatInputDock = memo(DevChatInputDockInner);
