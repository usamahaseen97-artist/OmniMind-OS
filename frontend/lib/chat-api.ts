export type ChatRole = "user" | "assistant" | "system";

import type { GeneratedImageAsset } from "./execution-preview";
import type { MusicPlayerTrack } from "./music-player-types";
import type { ArchitectChoicePayload } from "./architect-flow";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  streaming?: boolean;
  images?: GeneratedImageAsset[];
  /** Canonical generated image URL from backend SSE / tool dispatch */
  image_url?: string;
  /** camelCase alias — matches some API payloads */
  imageUrl?: string;
  /** Attachment or generated file URL from backend */
  file_url?: string;
  video_url?: string;
  /** Original user prompt used for image/video generation (regenerate / copy). */
  generation_prompt?: string;
  /** Spotify + YouTube music tool result — renders MusicPlayer in the thread */
  music_track?: MusicPlayerTrack;
  /** Lead Architect wizard — renders clickable JSON option buttons */
  architect_choice?: ArchitectChoicePayload;
};

export type LivePreviewPayload = {
  html?: string;
  type: string;
  image_url?: string;
  video_url?: string;
  images?: GeneratedImageAsset[];
  files?: { path: string; content: string; language?: string }[];
  svg?: string;
  active_tab?: "live" | "code" | "blueprint";
  music_track?: MusicPlayerTrack;
  track?: Record<string, unknown>;
};

export type MusicPlayerSsePayload = {
  type: "music_player";
  song_name: string;
  title?: string;
  artist?: string;
  album_image_url?: string;
  audio_stream_url?: string;
  track?: Record<string, unknown>;
  success?: boolean;
  error?: string;
  cached?: boolean;
  fast?: boolean;
};

export type StreamCallbacks = {
  onToken: (token: string) => void;
  /** Fired on first token — show typing / scroll instantly. */
  onStreamStart?: () => void;
  onMeta?: (meta: Record<string, unknown>) => void;
  onPreview?: (preview: LivePreviewPayload) => void;
  /** Gemini play_music tool — auto-render MusicPlayer in chat */
  onMusicPlayer?: (payload: MusicPlayerSsePayload) => void;
  onDone?: (conversationId: string) => void;
  onError?: (error: string) => void;
  /** Legacy hook — resilient routing no longer surfaces offline banners. */
  onEngineDegraded?: (message: string) => void;
  /** Engine secure indicator from backend meta.engine */
  onEngineSecure?: () => void;
};

import { getBackendUrl } from "./backend-url";
import { isEngineConnectionMessage } from "./engine-connection";
import { buildLocalChatFallback } from "./local-chat-fallback";

function parseSsePayload(
  raw: string,
  callbacks: StreamCallbacks,
  state: { gotToken: boolean; finished: boolean },
): void {
  if (!raw || state.finished) return;
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return;
  }

  if (data.meta) {
    const meta = data.meta as Record<string, unknown>;
    callbacks.onMeta?.(meta);
    const engine = meta.engine as Record<string, unknown> | undefined;
    if (engine?.secure === true) {
      callbacks.onEngineSecure?.();
    }
  }
  if (data.type === "music_player" && typeof data.song_name === "string") {
    callbacks.onMusicPlayer?.(data as MusicPlayerSsePayload);
  }
  if (data.preview && typeof data.preview === "object") {
    const p = data.preview as LivePreviewPayload;
    if (Array.isArray(data.assets)) {
      p.images = data.assets as GeneratedImageAsset[];
    }
    callbacks.onPreview?.(p);
  }
  if (typeof data.token === "string" && data.token.length > 0) {
    if (isEngineConnectionMessage(data.token)) {
      return;
    }
    if (!state.gotToken) {
      state.gotToken = true;
      callbacks.onStreamStart?.();
    }
    callbacks.onToken(data.token);
  }
  if (data.status && typeof data.status === "string") {
    callbacks.onMeta?.({ status: data.status, tool: data.tool });
  }
  if (data.error) {
    const errText = String(data.error);
    if (isEngineConnectionMessage(errText)) {
      callbacks.onEngineDegraded?.(errText);
    } else {
      state.finished = true;
      callbacks.onError?.(errText);
    }
  }
  if (data.done && data.conversation_id) {
    state.finished = true;
    callbacks.onDone?.(String(data.conversation_id));
  }
}

/** Process SSE `data: {...}` lines from a text chunk (supports multiple events per read). */
function consumeSseBuffer(
  buffer: string,
  callbacks: StreamCallbacks,
  state: { gotToken: boolean; finished: boolean },
): string {
  const parts = buffer.split("\n");
  const remainder = parts.pop() ?? "";

  for (const line of parts) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("data:")) continue;
    const raw = trimmed.startsWith("data: ")
      ? trimmed.slice(6).trim()
      : trimmed.slice(5).trim();
    if (!raw) continue;
    parseSsePayload(raw, callbacks, state);
    if (state.finished) break;
  }

  return remainder;
}

export async function streamChat(
  payload: {
    message: string;
    user_id: string;
    conversation_id?: string;
    agent_id: string;
    history: { role: string; content: string }[];
    skip_proactive?: boolean;
    image_context?: string;
    attachment_text?: string;
  },
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
) {
  let finished = false;
  const finish = (err?: string) => {
    if (finished) return;
    finished = true;
    if (err) callbacks.onError?.(err);
  };

  const streamState = { gotToken: false, finished: false, text: "" };

  const deckSafeCallbacks: StreamCallbacks = {
    ...callbacks,
    onToken: (token) => {
      if (isEngineConnectionMessage(token)) {
        return;
      }
      streamState.text += token;
      if (isEngineConnectionMessage(streamState.text)) {
        return;
      }
      callbacks.onToken(token);
    },
  };

  try {
    const base = getBackendUrl();
    const res = await fetch(`${base}/api/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
      signal,
      cache: "no-store",
    });

    if (!res.ok || !res.body) {
      const fallback = buildLocalChatFallback(payload.message, payload.agent_id);
      callbacks.onStreamStart?.();
      callbacks.onToken(fallback);
      callbacks.onEngineSecure?.();
      finished = true;
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = consumeSseBuffer(buffer, deckSafeCallbacks, streamState);
      if (streamState.finished) {
        finished = true;
        return;
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      consumeSseBuffer(`${buffer}\n`, deckSafeCallbacks, streamState);
    }

    if (!streamState.finished) {
      if (!streamState.gotToken) {
        const fallback = buildLocalChatFallback(payload.message, payload.agent_id);
        callbacks.onStreamStart?.();
        callbacks.onToken(fallback);
        callbacks.onEngineSecure?.();
        finished = true;
      } else if (isEngineConnectionMessage(streamState.text)) {
        const fallback = buildLocalChatFallback(payload.message, payload.agent_id);
        callbacks.onToken(fallback);
        callbacks.onEngineSecure?.();
        finished = true;
      } else {
        finish("Stream ended unexpectedly. Try again.");
      }
    }
  } catch (err) {
    if (signal?.aborted) return;
    const msg = err instanceof Error ? err.message : String(err);
    if (isEngineConnectionMessage(msg)) {
      const fallback = buildLocalChatFallback(payload.message, payload.agent_id);
      callbacks.onStreamStart?.();
      callbacks.onToken(fallback);
      callbacks.onEngineSecure?.();
      finished = true;
    } else {
      finish(`Cannot reach API: ${msg}. Run from project root: .\\run-backend-8001.ps1`);
    }
  }
}

/** @deprecated use getChats from lib/api.ts */
export async function fetchConversations(userId: string) {
  const res = await fetch(`${getBackendUrl()}/api/conversations/${userId}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { conversations: { id: string; title: string }[] };
  return data.conversations ?? [];
}
