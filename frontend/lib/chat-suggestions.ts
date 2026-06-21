import type { OmniRouteId } from "./omni-tools";
import { isWorkbenchTool } from "./omni-tools";

export const DEFAULT_QUICK_SUGGESTIONS = [
  "Explain photosynthesis for a class 10 student",
  "Write a one-page report on climate change with headings",
  "Generate a neon SaaS hero image concept",
  "Solve: if 2x + 5 = 17, find x step by step",
] as const;

/** Neural Chatbot — general Q&A, notes, files, images, debugging. */
export const DASHBOARD_SUGGESTIONS = [
  "Explain quantum computing in simple words with examples",
  "Summarize this topic and create bullet-point study notes",
  "/image futuristic city skyline at sunset cinematic style",
  "Analyze my code error and suggest a step-by-step fix",
  "Write a professional email draft for a client project update",
] as const;

/** Per-route quick prompts (4 each) — wired to ChatSuggestions + SuperTool panels. */
export const TOOL_SUGGESTION_LISTS: Partial<Record<OmniRouteId, readonly string[]>> = {
  dashboard: DASHBOARD_SUGGESTIONS,
  "app-and-develop": [
    "Scaffold a production Next.js 15 app with App Router, Tailwind, and ESLint strict mode…",
    "Design REST + WebSocket FastAPI routes with Pydantic v2 models and OpenAPI tags…",
    "Add Supabase Auth (email + OAuth) with RLS policies for a multi-tenant SaaS…",
    "Ship a CI pipeline (GitHub Actions) with typecheck, lint, and preview deploy…",
  ],
  "vfx-editor": [
    "Cut a 60s talking-head clip: remove silence, add lower-thirds, export 1080p…",
    "Match colour grade across two shots using a reference still from the same scene…",
    "Stabilise handheld footage and add subtle film grain + letterbox 2.39:1…",
    "Replace green screen with a cyberpunk skyline; add realistic edge spill…",
  ],
  "creative-visionary": [
    "Generate a 15s cinematic product ad with dolly push and rim lighting…",
    "Batch 4 ultra-realistic human portrait variations — editorial key light…",
    "Wide-angle sci-fi corridor plate with volumetric neon haze…",
    "Macro luxury watch shot on black glass — 8K texture detail…",
  ],
  "vfx-master": [
    "Color grade timeline clips to cinematic teal-orange with film grain…",
    "Replace sky with cyberpunk night overlay and match edge spill…",
    "Apply 3D lightning overlay synced to audio transients…",
    "Export ProRes proxy with shot metadata JSON handoff…",
  ],
  "ai-omnimaps": [
    "Find top-rated halal restaurants near me with parking and open now…",
    "Plot a scenic driving route from Clifton to Airport with toll avoidance…",
    "Search EV charging stations within 5 km and sort by fastest charger…",
    "Voice-style query: safest late-night route home with street lighting preference…",
  ],
  "business-software-architect": [
    "Blueprint a multi-tenant CRM: leads, pipelines, RBAC, audit log, webhooks…",
    "Design an inventory module with barcode scan, low-stock alerts, and FIFO costing…",
    "Agent swarm: triage support tickets → summarise → draft reply for human approval…",
    "ERP integration map: chart of accounts sync from QuickBooks + idempotency keys…",
  ],
  "marketing-ad-king": [
    "Launch campaign: SaaS analytics tool — bold tone, LinkedIn + X thread pack…",
    "Write 5 UGC-style scripts (15s) for TikTok with hooks and CTA variants…",
    "A/B email sequence for trial users: day 0, 3, 7 with behavioural triggers…",
    "Creative brief: Ramadan tech promo — respectful copy + emerald visual cues…",
  ],
  "nasa-science-solver": [
    "Estimate delta-v for a Hohmann transfer Earth → Mars at next launch window…",
    "Explain gravitational time dilation near a black hole event horizon intuitively…",
    "Derive rocket equation implications when staging mass ratio changes by 10%…",
    "Compare JWST vs Hubble resolution for detecting exoplanet atmospheric bands…",
  ],
  "architectural-designer": [
    "3-bed corner plot 40×60 ft: optimise daylight, courtyard, and parking stack…",
    "Produce room-by-room area schedule + FAR check for a duplex high-rise core…",
    "Material palette: heat-reflective façade for Karachi climate + cross-ventilation…",
    "Export concept massing with floor plates and vertical circulation diagram…",
  ],
  "business-analytics": [
    "Clean this sales CSV: outliers, missing dates, currency normalisation plan…",
    "Suggest 6 KPIs + SQL or pandas snippets for cohort retention by channel…",
    "Build an executive one-pager: revenue bridge, variance, and forecast bands…",
    "Anomaly detection narrative: what changed week-over-week in conversion…",
  ],
  "quantum-trading": [
    "Screen momentum + low-volatility equities with risk caps and sector limits…",
    "Summarise macro catalysts this week with sources and confidence tags…",
    "Backtest outline: SMA crossover vs buy-and-hold on BTC with slippage model…",
    "Options flow interpretation: unusual call volume — what to validate next…",
  ],
  "medical-diagnostic": [
    "Triage checklist: chest pain red flags vs likely musculoskeletal — cite guidelines…",
    "Explain lab panel (CBC, CMP) in patient-friendly language with next steps…",
    "Structured differential for chronic fatigue — questions to narrow cause…",
    "Imaging request: what CT vs MRI adds for suspected appendicitis in adults…",
  ],
  "game-app-architect": [
    "Unity mobile prototype: joystick move, camera follow, pooled projectiles…",
    "Expo React Native auth flow with secure token storage and deep links…",
    "Game economy loop: soft currency earn, sink, and anti-grind pacing table…",
    "Netcode outline: client prediction + server reconciliation for 4-player arena…",
  ],
  "meta-agent": [
    "Route this task to the best OmniMind module and explain why in one table…",
    "Orchestrate: maps lookup → marketing copy → analytics KPI suggestion chain…",
    "Summarise all active integrations from System Modules and flag gaps…",
    "Plan a multi-step build: backend contract → frontend scaffold → smoke tests…",
  ],
  "system-modules": [
    "Verify MongoDB Atlas URI format and list required collections for chat…",
    "Kafka on-demand: when to enable lazy load vs always-on for production…",
    "Checklist: CORS, rate limits, and HTTPS reverse proxy before public launch…",
    "Compare LM Studio vs cloud LLM for latency-sensitive OmniMind routes…",
  ],
  about: [
    "What is OmniMind V11 and who is it built for?",
    "Which modules need API keys vs work offline?",
    "How does on-demand Kafka / Spark work in this deployment?",
    "Where is chat history stored and how do I export it?",
  ],
  "neural-history": [
    "Show my most recent conversations sorted by updated time…",
    "Find chats that mention deployment or Docker…",
    "Open the last dashboard thread I used for video ideas…",
    "Tips: naming chats for faster search in Neural History…",
  ],
};

export function getQuickSuggestions(routeId: OmniRouteId | string): readonly string[] {
  const list = TOOL_SUGGESTION_LISTS[routeId as OmniRouteId];
  if (list?.length) return list;
  return DEFAULT_QUICK_SUGGESTIONS;
}

/** Rich input (upload column) on dashboard + all workbench chat routes. */
export function hasRichChatAttachmentPanel(routeId: OmniRouteId | string): boolean {
  return routeId === "dashboard" || isWorkbenchTool(routeId);
}

/** Chips fill textarea only — avoids accidental sends; keeps chat history stable. */
export function isSuggestionFillOnlyRoute(routeId: OmniRouteId | string): boolean {
  return routeId === "dashboard" || isWorkbenchTool(routeId);
}
