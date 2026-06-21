export type NavItem = {
  id: string;
  label: string;
  domain: string;
  locked?: boolean;
  badge?: string;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const MAIN_NAV: NavSection = {
  items: [
    { id: "command-console", label: "Command Console", domain: "sovereign" },
    { id: "project-console", label: "Project Console", domain: "general" },
    { id: "v11-sovereign", label: "V11 Sovereign", domain: "sovereign" },
    { id: "subscription", label: "Subscription", domain: "general" },
    { id: "power-domains", label: "Power Domains", domain: "general" },
  ],
};

export const POWER_SUITE: NavSection = {
  title: "V11 Power Suite",
  items: [
    { id: "universal-compiler", label: "Universal Compiler", domain: "auto_coder", locked: true },
    { id: "game-engine", label: "Game Engine V11", domain: "game_generation", locked: true },
    { id: "web-architect", label: "Web Architect", domain: "auto_coder" },
    { id: "logic-translator", label: "Logic Translator", domain: "general" },
    { id: "trade-oracle", label: "Trade-Oracle", domain: "trading" },
    { id: "bio-digital-scan", label: "Bio-Digital Scan", domain: "medical_scans" },
    { id: "omni-vision", label: "Omni-Vision", domain: "general" },
    { id: "sovereign-vault", label: "Sovereign Vault", domain: "cyber_shield" },
  ],
};

export const INTEGRATION_HUBS: NavSection = {
  title: "Integration Hubs",
  items: [
    { id: "core-ai", label: "Core AI & Search", domain: "general", badge: "AI" },
    { id: "apps-dev", label: "Apps & Web Dev", domain: "auto_coder", badge: "DEV" },
    { id: "medical-ai", label: "Medical AI", domain: "medical_scans", badge: "MED" },
    { id: "trading-hub", label: "Trading & Analytics", domain: "trading", badge: "FX" },
    { id: "media-workflow", label: "Video & Image", domain: "creative", badge: "VFX" },
    { id: "workflow-auto", label: "Workflow Automation", domain: "general", badge: "FLOW" },
    { id: "analyze-tools", label: "Analyze & Data", domain: "data_analytics", badge: "DATA" },
  ],
};

export const INTEGRATION_CATALOG: Record<
  string,
  { name: string; envKey: string; description: string }[]
> = {
  "core-ai": [
    { name: "Hugging Face", envKey: "HUGGINGFACE_API_KEY", description: "Model inference & embeddings" },
    { name: "Gemini", envKey: "GEMINI_API_KEY", description: "Primary sovereign reasoning" },
    { name: "Grok", envKey: "GROK_API_KEY", description: "Console-grade reasoning" },
    { name: "Tavily", envKey: "TAVILY_API_KEY", description: "Advanced web search" },
    { name: "WAN 2.5", envKey: "WAN_API_KEY", description: "Multimodal generation" },
    { name: "ComfyUI", envKey: "COMFYUI_API_KEY", description: "Image workflow nodes" },
    { name: "Local LLM", envKey: "LOCAL_LLM_URL", description: "http://127.0.0.1:1234/v1" },
    { name: "LM Studio Auth", envKey: "OPENAI_API_KEY", description: "sk-lm-* token (backend .env)" },
  ],
  "apps-dev": [
    { name: "Supabase", envKey: "SUPABASE_URL", description: "Auth, DB & realtime" },
    { name: "MongoDB", envKey: "MONGODB_URI", description: "Neural chat persistence" },
    { name: "Expo", envKey: "EXPO_TOKEN", description: "Mobile app deployment" },
  ],
  "medical-ai": [
    { name: "Endless Medical", envKey: "ENDLESS_MEDICAL_API_KEY", description: "Clinical sandbox API" },
    { name: "Mediscan.ai", envKey: "MEDISCAN_API_KEY", description: "Imaging & scan analysis" },
  ],
  "trading-hub": [
    { name: "Finnhub", envKey: "FINNHUB_API_KEY", description: "Live equities data" },
    { name: "Alpha Vantage", envKey: "ALPHA_VANTAGE_API_KEY", description: "Market indicators" },
    { name: "CoinGecko", envKey: "COINGECKO_API_KEY", description: "Crypto pricing" },
    { name: "NewsAPI", envKey: "NEWS_API_KEY", description: "Market sentiment feed" },
  ],
  "media-workflow": [
    { name: "Replicate", envKey: "REPLICATE_API_TOKEN", description: "Cloud GPU pipelines" },
    { name: "Hunyuan", envKey: "HUNYUAN_API_KEY", description: "Video synthesis" },
    { name: "FaceFusion / SadTalker", envKey: "MEDIA_TOOLS_PATH", description: "Local headless media tools" },
  ],
  "workflow-auto": [
    { name: "Flowise", envKey: "FLOWISE_API_KEY", description: "Agent orchestration" },
    { name: "Architect API", envKey: "ARCHITECT_API_KEY", description: "Infrastructure automation" },
    { name: "Weather", envKey: "WEATHER_API_KEY", description: "Geo & climate context" },
  ],
  "analyze-tools": [
    { name: "Pandas / OpenPyXL", envKey: "N/A", description: "Sheet analytics (local)" },
    { name: "LangChain", envKey: "N/A", description: "AI orchestration layer" },
    { name: "Power BI", envKey: "POWERBI_WORKSPACE", description: "Executive dashboards" },
  ],
};

export function findNavItem(id: string): NavItem | undefined {
  return [...MAIN_NAV.items, ...POWER_SUITE.items, ...INTEGRATION_HUBS.items].find(
    (item) => item.id === id
  );
}
