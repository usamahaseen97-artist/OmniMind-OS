import type { OmniToolId } from "./omni-tools-api";

export type SlashCommandResult = {
  tool: OmniToolId;
  prompt: string;
  raw: string;
};

/** Parse /image and /video commands (ChatGPT-style). */
export function parseSlashCommand(text: string): SlashCommandResult | null {
  const trimmed = text.trim();
  const image = trimmed.match(/^\/image(?:\s+([\s\S]+))?$/i);
  if (image) {
    const prompt = (image[1] ?? "").trim() || "beautiful cinematic scene, highly detailed";
    return { tool: "create_image", prompt, raw: trimmed };
  }
  const video = trimmed.match(/^\/video(?:\s+([\s\S]+))?$/i);
  if (video) {
    const prompt = (video[1] ?? "").trim() || "cinematic short clip, smooth camera motion";
    return { tool: "video", prompt, raw: trimmed };
  }
  return null;
}

export const SLASH_COMMAND_HINTS = [
  "/image futuristic Karachi at night cyberpunk style",
  "/video astronaut walking on Mars cinematic shot",
] as const;
