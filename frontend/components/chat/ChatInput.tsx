"use client";

import { ArrowUp, Square } from "lucide-react";
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
import { Button } from "../ui/button";
import { InputCommandMenu, InputCommandMenuTrigger } from "./InputCommandMenu";
import { StagedAttachmentsStrip } from "./StagedAttachmentsStrip";

export type { StagedAttachment };
export type { UploadKind } from "../../lib/staged-attachments";

export interface ChatInputProps {
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
  variant?: "default" | "floating";
}

function ChatInputInner({
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
  variant = "default",
}: ChatInputProps) {
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

  const isFloating = variant === "floating";
  const showCommandMenu = commandMenuEnabled && onAttachmentsSelected != null;

  return (
    <div
      className={cn(
        isFloating ? "w-full" : "shrink-0 border-t border-gray-800/60 bg-gradient-to-t from-[#0B0C10] to-transparent px-3 pb-2 pt-2 md:px-4",
      )}
    >
      {stagedAttachments.length > 0 && onRemoveAttachment ? (
        <StagedAttachmentsStrip
          attachments={stagedAttachments}
          onRemove={onRemoveAttachment}
        />
      ) : null}

      <form
        onSubmit={handleForm}
        className={cn("sovereign-input-shell", isFloating ? "w-full" : "mx-auto max-w-3xl")}
      >
        <div
          ref={shellRef}
          className={cn(
            "relative flex min-h-[52px] items-end gap-2 rounded-2xl border border-gray-800/50 p-2",
            isFloating
              ? "bg-black/35 shadow-[0_8px_40px_rgba(0,0,0,0.45),0_0_32px_rgba(16,185,129,0.06)] backdrop-blur-2xl"
              : "bg-[#15171E]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(16,185,129,0.08)]",
            "focus-within:border-[#10B981]/45 focus-within:ring-1 focus-within:ring-[#10B981]/30",
          )}
        >
          {showCommandMenu ? (
            <>
              <InputCommandMenuTrigger
                open={menuOpen}
                onToggle={() => setMenuOpen((o) => !o)}
              />
              <InputCommandMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                onAttachmentsSelected={onAttachmentsSelected}
                anchorRef={shellRef}
              />
            </>
          ) : null}

          <textarea
            rows={1}
            value={local}
            disabled={disabled}
            onChange={(e) => setLocal(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message OmniMind V11..."
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          />

          {loading ? (
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={onStop}
              className="mb-0.5 shrink-0"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              size="icon"
              variant="default"
              disabled={disabled || !local.trim()}
              className="mb-0.5 shrink-0 rounded-xl"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export const ChatInput = memo(ChatInputInner);
