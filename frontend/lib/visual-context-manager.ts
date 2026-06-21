/**
 * Visual Context Manager — multi-turn image reference, media IDs, segmentation.
 */

import { isImageEditInstruction } from "./image-prompt-intelligence";

export type SubjectSegmentation = {
  kind: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type VisualMediaReference = {
  mediaId: string;
  url: string;
  prompt: string;
  subjectHint?: string;
  subjectSegmentation: SubjectSegmentation;
  backgroundDescription?: string;
  updatedAt: number;
};

const AGENT_KEY = "omnimind:active_chat_agent";
const VISUAL_KEY = "omnimind:visual_media";

const DEFAULT_SEG: SubjectSegmentation = {
  kind: "ellipse",
  cx: 0.5,
  cy: 0.44,
  rx: 0.36,
  ry: 0.4,
};

function storageKey(base: string, userId: string): string {
  return `${base}:${userId}`;
}

export class VisualContextManager {
  static setActiveChatAgent(userId: string, agentId: string): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(storageKey(AGENT_KEY, userId), agentId);
    } catch {
      /* ignore */
    }
  }

  static getActiveChatAgent(userId: string): string {
    if (typeof window === "undefined") return "sovereign-core";
    try {
      return sessionStorage.getItem(storageKey(AGENT_KEY, userId)) ?? "sovereign-core";
    } catch {
      return "sovereign-core";
    }
  }

  static setVisualMedia(userId: string, ref: Omit<VisualMediaReference, "updatedAt">): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(
        storageKey(VISUAL_KEY, userId),
        JSON.stringify({ ...ref, updatedAt: Date.now() }),
      );
    } catch {
      /* ignore */
    }
  }

  static getVisualMedia(userId: string): VisualMediaReference | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(storageKey(VISUAL_KEY, userId));
      if (!raw) return null;
      return JSON.parse(raw) as VisualMediaReference;
    } catch {
      return null;
    }
  }

  /** Multi-turn in-paint payload for POST /image/synthesize */
  static buildSynthesizePayload(
    userId: string,
    message: string,
    agentId: string,
  ): {
    user_id: string;
    message: string;
    agent_id: string;
    reference_media_id?: string;
    background_description?: string;
    subject_segmentation?: SubjectSegmentation;
    mode?: "generate" | "inpaint";
  } {
    const last = this.getVisualMedia(userId);
    const edit = isImageEditInstruction(message) && Boolean(last);

    if (edit && last) {
      return {
        user_id: userId,
        message,
        agent_id: agentId,
        reference_media_id: last.mediaId || undefined,
        background_description: message,
        subject_segmentation: last.subjectSegmentation ?? DEFAULT_SEG,
        mode: "inpaint",
      };
    }

    return {
      user_id: userId,
      message,
      agent_id: agentId,
      mode: "generate",
    };
  }
}

/** @deprecated use VisualContextManager */
export const MediaContextManager = {
  setActiveChatAgent: VisualContextManager.setActiveChatAgent,
  getActiveChatAgent: VisualContextManager.getActiveChatAgent,
  setLastGeneratedMedia: (
    userId: string,
    ref: { url: string; prompt: string; subjectHint?: string },
  ) => {
    VisualContextManager.setVisualMedia(userId, {
      mediaId: "",
      url: ref.url,
      prompt: ref.prompt,
      subjectHint: ref.subjectHint,
      subjectSegmentation: DEFAULT_SEG,
    });
  },
  getLastGeneratedMedia: (userId: string) => {
    const v = VisualContextManager.getVisualMedia(userId);
    if (!v) return null;
    return {
      url: v.url,
      prompt: v.prompt,
      subjectHint: v.subjectHint,
      updatedAt: v.updatedAt,
    };
  },
};
