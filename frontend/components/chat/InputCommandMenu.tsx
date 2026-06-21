"use client";

import { Clapperboard, Code2, ImageIcon, Plus } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import {
  createStagedAttachment,
  type StagedAttachment,
  type UploadKind,
} from "../../lib/staged-attachments";
import { cn } from "../../lib/utils";

interface InputCommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAttachmentsSelected?: (files: StagedAttachment[]) => void;
}

export function InputCommandMenuTrigger({
  open,
  onToggle,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label="Upload files"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200",
        "border-emerald-500/35 bg-emerald-500/10 text-[#10B981]",
        "shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:border-emerald-400/50 hover:bg-emerald-500/20 hover:text-[#00FF87]",
        open && "rotate-45 border-emerald-400/55 bg-emerald-500/20 text-[#00FF87]",
        className,
      )}
    >
      <Plus className="h-5 w-5" />
    </button>
  );
}

export function InputCommandMenu({
  open,
  onOpenChange,
  onAttachmentsSelected,
  anchorRef,
}: InputCommandMenuProps & { anchorRef: React.RefObject<HTMLElement | null> }) {
  const menuRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, anchorRef]);

  const pickFiles = useCallback(
    (kind: UploadKind) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = Array.from(e.target.files ?? []).map((f) =>
        createStagedAttachment(f, kind),
      );
      if (list.length && onAttachmentsSelected) onAttachmentsSelected(list);
      e.target.value = "";
      close();
    },
    [onAttachmentsSelected, close],
  );

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute bottom-[calc(100%+10px)] left-0 z-50 w-[min(300px,calc(100vw-2rem))]",
        "overflow-hidden rounded-2xl border border-emerald-500/30",
        "bg-[#1E293B]/95 shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_24px_rgba(16,185,129,0.12)] backdrop-blur-xl",
      )}
      role="menu"
    >
      <input
        ref={videoRef}
        type="file"
        multiple
        accept="video/*,.mp4,.mov,.webm,.mkv"
        className="sr-only"
        onChange={pickFiles("video")}
      />
      <input
        ref={imageRef}
        type="file"
        multiple
        accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.svg"
        className="sr-only"
        onChange={pickFiles("image")}
      />
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".txt,.md,.json,.py,.ts,.tsx,.js,.jsx,.ipynb,.log,.csv,.yaml,.yml,.xml,.env.example"
        className="sr-only"
        onChange={pickFiles("file")}
      />

      <div className="border-b border-gray-800/60 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
          Attachments
        </p>
      </div>
      <ul className="p-1.5">
        {[
          { label: "Upload Video", icon: Clapperboard, action: () => videoRef.current?.click() },
          {
            label: "Upload Image / Mockup",
            icon: ImageIcon,
            action: () => imageRef.current?.click(),
          },
          { label: "Attach Code / File", icon: Code2, action: () => fileRef.current?.click() },
        ].map(({ label, icon: Icon, action }) => (
          <li key={label}>
            <button
              type="button"
              role="menuitem"
              onClick={action}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-emerald-950/40 hover:text-[#00FF87]"
            >
              <Icon className="h-4 w-4 shrink-0 text-[#10B981]" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
