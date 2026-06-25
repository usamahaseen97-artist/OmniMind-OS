import type { SearchResult, SearchResultKind, OmniToolSlug } from "./types";
import { omniProjectManager } from "./OmniProjectManager";
import { omniCommandPalette } from "./OmniCommandPalette";
import { omniRecentItems } from "./OmniRecentItems";
import { omniSettings } from "./OmniSettings";
import { omniAI } from "../ai/OmniAI";
import { omniAssets } from "../assets/OmniAssets";
import { omniPluginEngine } from "../plugins/omnicore-platform";

const ALL_TOOLS: { slug: OmniToolSlug; label: string }[] = [
  { slug: "omniforge-engine", label: "OmniForge Engine" },
  { slug: "visionary-studio", label: "Visionary Studio" },
  { slug: "omnimusic", label: "OmniMusic Studio" },
  { slug: "medical-diagnostic-suite", label: "Medical Diagnostic" },
  { slug: "business-analytics", label: "Business Analytics" },
  { slug: "marketing-suite", label: "Marketing Suite" },
  { slug: "vfx-engine", label: "VFX Engine" },
  { slug: "quantum-trading", label: "Quantum Trading" },
  { slug: "omnicharge", label: "OmniCharge" },
];

function push(
  results: SearchResult[],
  kind: SearchResultKind,
  title: string,
  subtitle: string,
  toolSlug: OmniToolSlug | null,
  score: number,
  id?: string,
) {
  results.push({
    id: id ?? `sr-${kind}-${title.slice(0, 24)}-${results.length}`,
    kind,
    title,
    subtitle,
    toolSlug,
    score,
  });
}

/** OS-level unified search — files, chats, projects, media, plugins, APIs (RC1). */
export class OmniGlobalSearch {
  query = "";
  private customIndex: SearchResult[] = [];

  setQuery(query: string) {
    this.query = query;
    return this.search(query);
  }

  indexExternal(items: SearchResult[]) {
    this.customIndex = items;
  }

  search(query: string): SearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.recentIndex();

    const results: SearchResult[] = [];

    omniProjectManager.list().forEach((p) => {
      if (p.name.toLowerCase().includes(q)) {
        push(results, "project", p.name, p.kind, p.toolSlugs[0] ?? null, 1, `sr-proj-${p.id}`);
      }
    });

    ALL_TOOLS.forEach((t) => {
      if (t.label.toLowerCase().includes(q) || t.slug.includes(q)) {
        push(results, "tool", t.label, t.slug, t.slug, 0.95, `sr-tool-${t.slug}`);
      }
    });

    omniCommandPalette.list().forEach((c) => {
      if (c.label.toLowerCase().includes(q) || c.keywords.some((k) => k.includes(q))) {
        push(results, "command", c.label, c.category, null, 0.9, `sr-cmd-${c.id}`);
      }
    });

    omniAI.conversations.list().forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.messages.some((m) => m.content.toLowerCase().includes(q))) {
        push(results, "ai-chat", c.title, `${c.messages.length} messages`, c.toolSlug as OmniToolSlug, 0.88, `sr-chat-${c.id}`);
      }
    });

    omniAssets.assets.assets.forEach((a) => {
      if (a.name.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q))) {
        const kind: SearchResultKind =
          a.kind === "image" ? "image"
          : a.kind === "video" ? "video"
          : a.kind === "audio" ? "music"
          : a.kind === "document" ? "document"
          : a.kind === "template" ? "template"
          : "asset";
        push(results, kind, a.name, a.kind, a.toolSlug as OmniToolSlug | null, 0.85, `sr-asset-${a.id}`);
      }
    });

    omniSettings.list().forEach((s) => {
      if (s.key.toLowerCase().includes(q)) {
        push(results, "setting", s.key, s.scope, s.toolSlug, 0.8, `sr-set-${s.key}`);
      }
    });

    omniPluginEngine.registry.list().forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.id.includes(q)) {
        push(results, "plugin", p.name, p.type, null, 0.82, `sr-plugin-${p.id}`);
      }
    });

    omniPluginEngine.marketplace.listings.forEach((m) => {
      const plugin = omniPluginEngine.registry.get(m.pluginId);
      const label = plugin?.name ?? m.pluginId;
      if (label.toLowerCase().includes(q) || m.pluginId.includes(q)) {
        push(results, "template", label, plugin?.category ?? "marketplace", null, 0.78, `sr-tpl-${m.id}`);
      }
    });

    omniAI.prompts.list().forEach((p) => {
      if (p.name.toLowerCase().includes(q)) {
        push(results, "template", p.name, p.category ?? "prompt", null, 0.75, `sr-prompt-${p.id}`);
      }
    });

    this.customIndex.forEach((item) => {
      if (item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q)) {
        results.push({ ...item, score: item.score ?? 0.7 });
      }
    });

    if (q.includes("api") || q.includes("endpoint")) {
      push(results, "api", "OmniCore API", "/api/v1/omnicore", null, 0.6, "sr-api-omnicore");
      push(results, "api", "AI Gateway", "/api/v1/omnicore/ai", null, 0.58, "sr-api-ai");
    }
    if (q.includes("database") || q.includes("mongo") || q.includes("redis")) {
      push(results, "database", "MongoDB Projects", "primary datastore", null, 0.55, "sr-db-mongo");
      push(results, "database", "Redis Cache", "session + queue", null, 0.54, "sr-db-redis");
    }

    return results.sort((a, b) => b.score - a.score).slice(0, 48);
  }

  private recentIndex(): SearchResult[] {
    return omniRecentItems.list(12).map((r) => ({
      id: `sr-recent-${r.id}`,
      kind: r.kind === "project" ? "project" : r.kind === "tool" ? "tool" : "history",
      title: r.label,
      subtitle: "Recent",
      toolSlug: r.toolSlug,
      score: 0.5,
    }));
  }

  indexItem(kind: SearchResultKind, title: string, subtitle: string, toolSlug: OmniToolSlug | null) {
    return { id: `idx-${Date.now()}`, kind, title, subtitle, toolSlug, score: 1 } satisfies SearchResult;
  }
}

export const omniGlobalSearch = new OmniGlobalSearch();
