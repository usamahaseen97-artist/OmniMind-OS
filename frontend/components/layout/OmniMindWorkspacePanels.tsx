"use client";

import { FolderOpen, ImageIcon, Sparkles } from "lucide-react";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { cn } from "../../lib/utils";

const IMAGE_TEMPLATES = [
  { label: "Product hero shot", prompt: "/image cinematic product hero shot on dark gradient, studio lighting" },
  { label: "Social ad banner", prompt: "/image vibrant social media ad banner 16:9, bold typography space" },
  { label: "App mockup", prompt: "/image mobile app UI mockup floating on glass desk, neon accents" },
  { label: "Logo concept", prompt: "/image minimal tech logo concept, vector flat, cyan and violet" },
  { label: "Character art", prompt: "/image stylized game character portrait, painterly, rim light" },
  { label: "Architecture viz", prompt: "/image futuristic villa exterior at dusk, photoreal archviz" },
];

interface OmniMindWorkspacePanelsProps {
  activeTab: "history" | "images" | "library";
  userId: string;
  activeSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat?: () => void;
  onImageTemplateSelect: (prompt: string) => void;
}

export function OmniMindWorkspacePanels({
  activeTab,
  userId,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onImageTemplateSelect,
}: OmniMindWorkspacePanelsProps) {
  if (activeTab === "history") {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto p-8">
        <header className="mb-4 shrink-0">
          <h2 className="text-lg font-semibold text-[#c2e7ff]">Search Chats</h2>
          <p className="text-sm text-gray-500">Resume a conversation or start fresh</p>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-[#2d2f31] bg-[#1e1f20]/80">
          <ChatHistoryPanel
            userId={userId}
            activeSessionId={activeSessionId}
            onSelectSession={onSelectSession}
            onNewChat={onNewChat}
            embedded
          />
        </div>
      </div>
    );
  }

  if (activeTab === "images") {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-8">
        <header className="mb-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#c2e7ff]">
            <ImageIcon className="h-5 w-5" />
            Image Templates
          </h2>
          <p className="text-sm text-gray-500">Pick a template — opens chat with a ready-made prompt</p>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {IMAGE_TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => onImageTemplateSelect(t.prompt)}
              className={cn(
                "group rounded-xl border border-[#2d2f31] bg-[#1e1f20] p-4 text-left transition-all duration-200",
                "hover:border-[#004a77]/60 hover:bg-[#004a77]/10 hover:shadow-[0_0_24px_rgba(0,74,119,0.2)]",
              )}
            >
              <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-[#004a77]/30 to-[#131314]">
                <Sparkles className="h-6 w-6 text-[#c2e7ff]/70 transition group-hover:text-[#c2e7ff]" />
              </div>
              <p className="text-sm font-medium text-gray-200">{t.label}</p>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">{t.prompt.replace("/image ", "")}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#004a77]/20 text-[#c2e7ff]">
        <FolderOpen className="h-7 w-7 opacity-80" />
      </div>
      <h2 className="text-lg font-semibold text-[#c2e7ff]">Media Library</h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">
        Generated images, exports, and archived chats appear here. Use Search Chats for conversation
        history.
      </p>
    </div>
  );
}
