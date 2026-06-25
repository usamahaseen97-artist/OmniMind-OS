import type { Brain2AgentDefinition, Brain2AgentId } from "./types";

/** Full specialist agent registry — Brain 2.0 multi-agent ecosystem. */
export const BRAIN2_AGENT_REGISTRY: Brain2AgentDefinition[] = [
  agent("master_ai", "Master AI", "Central orchestrator — one voice to the user", ["orchestrate", "merge", "intent"], 100, ["*"], "read_write", "admin"),
  agent("chief_architect", "Chief Architect", "System design & scalability", ["architecture", "blueprint", "microservices"], 95, ["omniforge-engine", "architectural-designer"], "read_write", "execute"),
  agent("frontend_engineer", "Frontend Engineer", "UI, React, Next.js", ["generate-code", "ui"], 88, ["omniforge-engine", "app-website-builder"], "read_write", "execute"),
  agent("backend_engineer", "Backend Engineer", "APIs, services", ["generate-code", "api"], 88, ["omniforge-engine"], "read_write", "execute"),
  agent("database_engineer", "Database Engineer", "Schema, migrations", ["database", "analyze-data"], 85, ["omniforge-engine", "business-analytics"], "read_write", "execute"),
  agent("devops_engineer", "DevOps Engineer", "CI/CD, deploy", ["deploy", "docker"], 84, ["omniforge-engine"], "read_write", "deploy"),
  agent("security_engineer", "Security Engineer", "OWASP, auth, compliance", ["security", "audit"], 90, ["omniforge-engine"], "read", "execute"),
  agent("medical_specialist", "Medical Specialist", "Diagnostics & triage", ["analyze-medical-image"], 92, ["medical-diagnostic"], "read", "execute"),
  agent("marketing_specialist", "Marketing Specialist", "Campaigns & ads", ["marketing-campaign"], 80, ["digital-marketing-hub", "creative-visionary"], "read_write", "execute"),
  agent("music_producer", "Music Producer", "Composition & audio", ["generate-music"], 82, ["omnimusic"], "read_write", "execute"),
  agent("video_editor", "Video Editor", "Cuts & timeline", ["edit-video"], 83, ["vfx-master"], "read_write", "execute"),
  agent("vfx_artist", "VFX Artist", "Cinematic effects", ["generate-video", "edit-video"], 84, ["vfx-master", "creative-visionary"], "read_write", "execute"),
  agent("business_consultant", "Business Consultant", "Strategy & ops", ["analyze-data", "marketing-campaign"], 86, ["business-analytics", "digital-marketing-hub"], "read", "execute"),
  agent("financial_analyst", "Financial Analyst", "Markets & forecasts", ["financial-analysis", "analyze-data"], 87, ["business-analytics", "quantum-trading"], "read", "execute"),
  agent("quantum_trading_expert", "Quantum Trading Expert", "Signals & risk", ["financial-analysis"], 88, ["quantum-trading"], "read", "execute"),
  agent("architectural_designer", "Architectural Designer", "Buildings & landscape", ["create-architecture"], 85, ["architectural-designer", "interior-landscape"], "read_write", "execute"),
  agent("research_scientist", "Research Scientist", "Physics & simulation", ["scientific-simulation"], 89, ["nasa-solver"], "read", "execute"),
  agent("translator", "Translator", "Bilingual bridge", ["translate", "voice-processing"], 81, ["omnitranslator"], "read", "execute"),
  agent("legal_assistant", "Legal Assistant", "Compliance drafts", ["research", "documentation"], 75, ["business-analytics"], "read", "read"),
  agent("content_writer", "Content Writer", "Copy & docs", ["documentation", "marketing-campaign"], 78, ["digital-marketing-hub"], "read_write", "write"),
  agent("prompt_engineer", "Prompt Engineer", "Prompt optimization", ["orchestrate"], 80, ["omniforge-engine"], "read_write", "execute"),
  agent("testing_engineer", "Testing Engineer", "QA & coverage", ["testing", "validate"], 82, ["omniforge-engine"], "read_write", "execute"),
  agent("debugger", "Debugger", "Error resolution", ["debug", "generate-code"], 83, ["omniforge-engine"], "read_write", "execute"),
  agent("performance_engineer", "Performance Engineer", "Profiling & optimization", ["performance"], 84, ["omniforge-engine", "business-analytics"], "read", "execute"),
];

function agent(
  id: Brain2AgentId,
  name: string,
  identity: string,
  capabilities: string[],
  priority: number,
  tools: string[],
  memoryAccess: "read" | "read_write",
  permissionLevel: Brain2AgentDefinition["permissionLevel"],
): Brain2AgentDefinition {
  return { id, name, identity, capabilities, priority, tools, memoryAccess, permissionLevel, status: "idle" };
}

export function getBrain2Agent(id: Brain2AgentId): Brain2AgentDefinition | undefined {
  return BRAIN2_AGENT_REGISTRY.find((a) => a.id === id);
}

export function selectAgentsForCapabilities(capabilities: string[], limit = 5): Brain2AgentDefinition[] {
  const scored = BRAIN2_AGENT_REGISTRY.map((a) => {
    const overlap = a.capabilities.filter((c) => capabilities.includes(c) || capabilities.some((cap) => a.capabilities.includes(cap))).length;
    return { agent: a, score: overlap * 10 + a.priority * 0.1 };
  });
  return scored
    .filter((s) => s.score > 0 || s.agent.id === "master_ai")
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => ({ ...s.agent, status: "selected" as const }));
}

export function agentsForTool(toolId: string): Brain2AgentDefinition[] {
  return BRAIN2_AGENT_REGISTRY.filter((a) => a.tools.includes(toolId) || a.tools.includes("*"));
}
