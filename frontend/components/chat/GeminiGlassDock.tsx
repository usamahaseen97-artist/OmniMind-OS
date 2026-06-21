"use client";

import {
  Bug,
  FileText,
  HelpCircle,
  ImageIcon,
  MessageCircle,
  Paperclip,
} from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "../../lib/utils";

export type GlassDockId =
  | "ask"
  | "qa"
  | "notes"
  | "files"
  | "images"
  | "bugs";

interface GeminiGlassDockProps {
  onSelect: (item: { id: GlassDockId; prompt?: string }) => void;
  onAttachFiles?: () => void;
  className?: string;
  /** `liquid-nav` = top floating bar (image_16); `dock` = full pill row with icons */
  variant?: "liquid-nav" | "dock";
  defaultActive?: GlassDockId;
}

const DOCK_ITEMS: {
  id: GlassDockId;
  label: string;
  icon: typeof MessageCircle;
  prompt?: string;
  attach?: boolean;
}[] = [
  { id: "ask", label: "Ask anything", icon: MessageCircle, prompt: "" },
  { id: "qa", label: "Q&A", icon: HelpCircle, prompt: "Answer in clear Q&A format: " },
  { id: "notes", label: "Notes", icon: FileText, prompt: "Create structured study notes for: " },
  { id: "files", label: "Files", icon: Paperclip, attach: true },
  { id: "images", label: "Images", icon: ImageIcon, prompt: "/image " },
  { id: "bugs", label: "Bug fixes", icon: Bug, prompt: "Analyze and fix this bug step by step: " },
];

export function GeminiGlassDock({
  onSelect,
  onAttachFiles,
  className,
  variant = "liquid-nav",
  defaultActive,
}: GeminiGlassDockProps) {
  const [activeId, setActiveId] = useState<GlassDockId | null>(defaultActive ?? null);

  const handleClick = useCallback(
    (item: (typeof DOCK_ITEMS)[number]) => {
      setActiveId(item.id);
      window.setTimeout(() => setActiveId(null), 220);
      if (item.attach) {
        onAttachFiles?.();
        return;
      }
      onSelect({ id: item.id, prompt: item.prompt });
    },
    [onAttachFiles, onSelect],
  );

  const isTopNav = variant === "liquid-nav";

  return (
    <nav
      className={cn(isTopNav ? "liquid-nav" : "glass-liquid-dock", className)}
      aria-label="Quick tools"
    >
      {DOCK_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeId === item.id || defaultActive === item.id;
        if (isTopNav) {
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={cn("nav-item", isActive && "active-pill")}
            >
              {item.label}
            </button>
          );
        }
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            className={cn("glass-dock-pill", isActive && "active-pill")}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
