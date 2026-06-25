import type { BroadcastAssistantSuggestion, PodcastEpisode } from "../broadcast-types";
import type { BroadcastTemplate } from "../broadcast-types";
import { BROADCAST_TEMPLATES } from "./constants";

export class BroadcastAssistantCore {
  suggest(episode: PodcastEpisode | null): BroadcastAssistantSuggestion[] {
    if (!episode) return [];
    return [
      { id: "ba-1", category: "title", title: "Title idea", detail: `${episode.title} — Deep Dive` },
      { id: "ba-2", category: "chapter", title: "Chapter at 5:00", detail: "Add chapter marker for topic shift" },
      { id: "ba-3", category: "summary", title: "Episode summary", detail: "Host and guest discuss OmniMusic broadcast features." },
      { id: "ba-4", category: "keywords", title: "SEO keywords", detail: episode.keywords.join(", ") || "podcast, audio, production" },
      { id: "ba-5", category: "clips", title: "Clip suggestion", detail: "Highlight segment at intro (0:00–1:00)" },
      { id: "ba-6", category: "social", title: "Social snippet", detail: "🎙️ New episode out now — tap to listen!" },
    ];
  }
}

export class BroadcastTemplatesCore {
  all(): BroadcastTemplate[] {
    return BROADCAST_TEMPLATES;
  }

  get(id: string) {
    return BROADCAST_TEMPLATES.find((t) => t.id === id) ?? null;
  }
}

export const broadcastAssistantCore = new BroadcastAssistantCore();
export const broadcastTemplatesCore = new BroadcastTemplatesCore();
