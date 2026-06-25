import type { AiAgent, AiModel, AiProvider, PromptTemplate } from "./types";

export const AI_PROVIDERS: AiProvider[] = [
  { id: "openai", label: "OpenAI", baseUrl: "https://api.openai.com/v1", enabled: true, priority: 1, status: "online" },
  { id: "google", label: "Google AI", baseUrl: "https://generativelanguage.googleapis.com", enabled: true, priority: 2, status: "online" },
  { id: "anthropic", label: "Anthropic", baseUrl: "https://api.anthropic.com", enabled: true, priority: 3, status: "online" },
  { id: "openrouter", label: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", enabled: true, priority: 4, status: "online" },
  { id: "lmstudio", label: "LM Studio", baseUrl: "http://localhost:1234/v1", enabled: false, priority: 5, status: "offline" },
  { id: "ollama", label: "Ollama", baseUrl: "http://localhost:11434", enabled: false, priority: 6, status: "offline" },
  { id: "azure-openai", label: "Azure OpenAI", baseUrl: "", enabled: false, priority: 7, status: "offline" },
  { id: "aws-bedrock", label: "AWS Bedrock", baseUrl: "", enabled: false, priority: 8, status: "offline" },
  { id: "omni-future", label: "Omni Models (Future)", baseUrl: "", enabled: false, priority: 9, status: "offline" },
  { id: "local", label: "Local Models", baseUrl: "http://localhost:8080", enabled: false, priority: 10, status: "offline" },
];

export const AI_MODELS: AiModel[] = [
  { id: "gpt-4o", providerId: "openai", name: "GPT-4o", capabilities: ["chat", "reasoning"], contextWindow: 128000, costPer1kInput: 0.005, costPer1kOutput: 0.015, available: true },
  { id: "gemini-2.0-flash", providerId: "google", name: "Gemini 2.0 Flash", capabilities: ["chat", "reasoning"], contextWindow: 1000000, costPer1kInput: 0.001, costPer1kOutput: 0.004, available: true },
  { id: "claude-sonnet", providerId: "anthropic", name: "Claude Sonnet", capabilities: ["chat", "reasoning"], contextWindow: 200000, costPer1kInput: 0.003, costPer1kOutput: 0.015, available: true },
  { id: "openrouter/auto", providerId: "openrouter", name: "OpenRouter Auto", capabilities: ["chat"], contextWindow: 128000, costPer1kInput: 0.002, costPer1kOutput: 0.008, available: true },
  { id: "local-llm", providerId: "local", name: "Local LLM", capabilities: ["chat"], contextWindow: 8192, costPer1kInput: 0, costPer1kOutput: 0, available: false },
];

export const AGENT_SEED: AiAgent[] = [
  { id: "forge-agent", name: "Forge Agent", toolSlug: "omniforge-engine", description: "Software engineering assistant", defaultModelId: "gpt-4o", systemPrompt: "You are the OmniForge engineering agent.", enabled: true, capabilities: ["code", "debug", "deploy"] },
  { id: "medical-agent", name: "Medical Agent", toolSlug: "medical-diagnostic-suite", description: "Clinical intelligence assistant", defaultModelId: "claude-sonnet", systemPrompt: "You are the Medical Diagnostic agent.", enabled: true, capabilities: ["imaging", "clinical"] },
  { id: "visionary-agent", name: "Visionary Agent", toolSlug: "visionary-studio", description: "Creative production assistant", defaultModelId: "gemini-2.0-flash", systemPrompt: "You are the Visionary Studio agent.", enabled: true, capabilities: ["video", "design"] },
  { id: "music-agent", name: "Music Agent", toolSlug: "omnimusic", description: "Music composition assistant", defaultModelId: "gpt-4o", systemPrompt: "You are the OmniMusic agent.", enabled: true, capabilities: ["compose", "mix"] },
  { id: "business-agent", name: "Business Agent", toolSlug: "business-analytics", description: "Analytics and strategy", defaultModelId: "gpt-4o", systemPrompt: "You are the Business Analytics agent.", enabled: true, capabilities: ["analytics", "reports"] },
  { id: "trading-agent", name: "Trading Agent", toolSlug: "quantum-trading", description: "Quantitative trading assistant", defaultModelId: "claude-sonnet", systemPrompt: "You are the Quantum Trading agent.", enabled: true, capabilities: ["markets", "signals"] },
  { id: "developer-agent", name: "Developer Agent", toolSlug: "*", description: "General developer assistant", defaultModelId: "gpt-4o", systemPrompt: "You are a developer assistant.", enabled: true, capabilities: ["code"] },
  { id: "research-agent", name: "Research Agent", toolSlug: "*", description: "Research and analysis", defaultModelId: "claude-sonnet", systemPrompt: "You are a research agent.", enabled: true, capabilities: ["research"] },
  { id: "writing-agent", name: "Writing Agent", toolSlug: "*", description: "Content writing", defaultModelId: "gpt-4o", systemPrompt: "You are a writing agent.", enabled: true, capabilities: ["writing"] },
  { id: "design-agent", name: "Design Agent", toolSlug: "*", description: "UI/UX design assistant", defaultModelId: "gemini-2.0-flash", systemPrompt: "You are a design agent.", enabled: true, capabilities: ["design"] },
];

export const PROMPT_LIBRARY_SEED: PromptTemplate[] = [
  { id: "pt-summarize", name: "Summarize", category: "general", template: "Summarize the following:\n\n{{content}}", variables: [{ key: "content", required: true }], version: 1, tags: ["summary"] },
  { id: "pt-code-review", name: "Code Review", category: "developer", template: "Review this {{language}} code:\n\n{{code}}", variables: [{ key: "language", required: true, defaultValue: "typescript" }, { key: "code", required: true }], version: 1, tags: ["code", "review"] },
  { id: "pt-agent-system", name: "Agent System Prompt", category: "agent", template: "You are {{agentName}} for {{toolName}}. {{instructions}}", variables: [{ key: "agentName", required: true }, { key: "toolName", required: true }, { key: "instructions", required: false }], version: 1, tags: ["agent"] },
];

export const OMNIAI_VERSION = "2.0.0-phase2";

export const DEFAULT_FALLBACK_CHAIN = {
  primary: "openai" as const,
  fallbacks: ["google", "anthropic", "openrouter"] as const,
};
