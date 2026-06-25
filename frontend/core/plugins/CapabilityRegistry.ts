import type { CapabilityMatch, OmniCapability } from "./types";

const CAPABILITY_PATTERNS: Record<OmniCapability, RegExp[]> = {
  "generate-code": [/build|scaffold|code|react|next\.?js|full[\s-]?stack|website|app\b|api\b|deploy/i],
  "generate-video": [/video|cinematic|scene|footage|generate\s+video|movie\s+clip/i],
  "analyze-data": [/excel|spreadsheet|analytics|sales|trend|dashboard|bi\b|dataset|forecast|karachi/i],
  "analyze-medical-image": [/medical|diagnos|x-?ray|scan|triage|lab\s+report|vitals/i],
  "edit-video": [/vfx|edit\s+video|timeline|grade|cut\s+video|retention/i],
  "create-architecture": [/villa|architect|exterior|landscape|floor\s*plan|interior|bedroom/i],
  translate: [/translat|bilingual|meeting|urdu|roman|speech/i],
  "generate-music": [/song|music|audio|melody|compose|omnimusic/i],
  "voice-processing": [/voice|speech|listen|transcribe|tts/i],
  "financial-analysis": [/trading|crypto|forex|stock|finance|portfolio|signals/i],
  "scientific-simulation": [/nasa|physics|aerospace|equation|science\s+solver|simulate/i],
  deploy: [/deploy|vercel|netlify|hosting|publish\s+live/i],
  "marketing-campaign": [/marketing|campaign|ad\s+copy|social\s+media|ads\b/i],
  "navigation-maps": [/map|route|navigation|omnimap|directions/i],
  "entertainment-streaming": [/omnitv|omnimovies|stream|channel|cinema|watch/i],
};

type CapabilityEntry = {
  pluginId: string;
  toolId: string;
  capability: OmniCapability;
};

/** Maps capabilities → plugins for Brain discovery (no hardcoded tool names). */
export class CapabilityRegistry {
  private byCapability = new Map<OmniCapability, CapabilityEntry[]>();
  private pluginCapabilities = new Map<string, OmniCapability[]>();

  register(pluginId: string, toolId: string, capabilities: OmniCapability[]) {
    this.pluginCapabilities.set(pluginId, capabilities);
    for (const cap of capabilities) {
      const list = this.byCapability.get(cap) ?? [];
      const filtered = list.filter((e) => e.pluginId !== pluginId);
      filtered.push({ pluginId, toolId, capability: cap });
      this.byCapability.set(cap, filtered);
    }
  }

  unregister(pluginId: string) {
    const caps = this.pluginCapabilities.get(pluginId) ?? [];
    for (const cap of caps) {
      const list = (this.byCapability.get(cap) ?? []).filter((e) => e.pluginId !== pluginId);
      this.byCapability.set(cap, list);
    }
    this.pluginCapabilities.delete(pluginId);
  }

  getPluginsForCapability(cap: OmniCapability): CapabilityEntry[] {
    return [...(this.byCapability.get(cap) ?? [])];
  }

  listCapabilities(pluginId: string): OmniCapability[] {
    return [...(this.pluginCapabilities.get(pluginId) ?? [])];
  }

  /** Match user intent text to capabilities and plugins. */
  matchIntent(text: string): CapabilityMatch[] {
    const normalized = text.trim();
    if (!normalized) return [];

    const matches: CapabilityMatch[] = [];

    for (const [capability, patterns] of Object.entries(CAPABILITY_PATTERNS) as [OmniCapability, RegExp[]][]) {
      const hit = patterns.some((p) => p.test(normalized));
      if (!hit) continue;
      const plugins = this.getPluginsForCapability(capability);
      for (const p of plugins) {
        matches.push({
          pluginId: p.pluginId,
          toolId: p.toolId,
          capability,
          confidence: 0.82,
          reason: `Capability match: ${capability}`,
        });
      }
    }

    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  bestMatch(text: string): CapabilityMatch | null {
    return this.matchIntent(text)[0] ?? null;
  }
}

let registry: CapabilityRegistry | null = null;

export function getCapabilityRegistry(): CapabilityRegistry {
  if (!registry) registry = new CapabilityRegistry();
  return registry;
}
