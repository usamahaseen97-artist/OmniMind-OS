"use client";

import { memo } from "react";
import { Bot, User } from "lucide-react";
import { cn } from "../../lib/utils";
import { MarkdownMessage } from "./MarkdownMessage";
import { GeneratedImageGallery } from "./GeneratedImageGallery";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage as ChatMessageType } from "../../lib/chat-api";
import { resolveChatMessageImages, primaryChatImageUrl } from "../../lib/chat-image-url";
import { resolveMediaUrl } from "../../lib/media-url";
import { MediaMessageActions } from "./MediaMessageActions";
import { MusicPlayer } from "../music/MusicPlayer";
import { ArchitectChoicePanel } from "../architect/ArchitectChoicePanel";
import { parseArchitectChoiceFromContent } from "../../lib/architect-flow";

function ChatMessageInner({
  message,
  onRegenerate,
  onArchitectAction,
}: {
  message: ChatMessageType;
  onRegenerate?: () => void;
  onArchitectAction?: (step: number, optionId: string) => void;
}) {
  const isUser = message.role === "user";
  const architectPayload =
    message.architect_choice ?? parseArchitectChoiceFromContent(message.content);
  const chatImages = !isUser ? resolveChatMessageImages(message) : [];
  const primaryImage = chatImages[0]?.url ?? primaryChatImageUrl(message);

  return (
    <div
      className={cn(
        "group flex w-full gap-4 border-b border-white/[0.04] px-2 py-4",
        isUser ? "bg-transparent" : "bg-white/[0.02]",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-zinc-800 text-zinc-300" : "glass-panel text-neon-green",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1 space-y-1 pt-0.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
          {isUser ? "You" : "OmniMind"}
        </p>
        <div
          className={cn(
            "prose-wrap text-sm leading-relaxed",
            isUser ? "text-zinc-100" : "text-zinc-300",
          )}
        >
          {message.streaming && !message.content?.trim() ? (
            <TypingIndicator />
          ) : (
            <>
              <MarkdownMessage content={message.content} isUser={isUser} />
              {message.streaming && message.content ? (
                <span
                  className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[#00FF87] align-middle shadow-[0_0_6px_#00FF87]"
                  aria-hidden
                />
              ) : null}
              {!isUser && message.video_url && (
                <>
                  <video
                    key={message.video_url}
                    src={resolveMediaUrl(message.video_url)}
                    controls
                    playsInline
                    autoPlay
                    muted
                    loop
                    preload="auto"
                    className="mt-3 max-h-[min(72vh,520px)] w-full rounded-xl border border-neon-green/25 bg-black object-contain shadow-[0_0_24px_rgba(0,255,136,0.12)]"
                  />
                  <MediaMessageActions
                    prompt={message.generation_prompt}
                    mediaUrl={resolveMediaUrl(message.video_url)}
                    onRegenerate={onRegenerate}
                  />
                </>
              )}
              {!isUser && message.music_track && (
                <div className="mt-3">
                  <MusicPlayer track={message.music_track} compact autoPlay />
                </div>
              )}
              {!isUser && chatImages.length > 0 && (
                <>
                  <GeneratedImageGallery images={chatImages} className="mt-3" />
                  <MediaMessageActions
                    prompt={message.generation_prompt}
                    mediaUrl={primaryImage ? resolveMediaUrl(primaryImage) : undefined}
                    onRegenerate={onRegenerate}
                  />
                </>
              )}
              {!isUser && architectPayload && onArchitectAction ? (
                <div className="mt-3">
                  <ArchitectChoicePanel
                    payload={architectPayload}
                    onSelect={(id) => onArchitectAction(architectPayload.step, id)}
                    onAction={(actionId) =>
                      onArchitectAction(architectPayload.step, actionId)
                    }
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageInner);
