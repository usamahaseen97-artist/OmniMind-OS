import type { AiAgent, AiAgentId } from "./types";
import { AGENT_SEED } from "./constants";

/** Universal agent registry — tools register agents here. */
export class OmniAgentRegistry {
  agents: AiAgent[] = AGENT_SEED.map((a) => ({ ...a }));

  list(toolSlug?: string) {
    if (!toolSlug) return [...this.agents];
    return this.agents.filter((a) => a.toolSlug === toolSlug || a.toolSlug === "*");
  }

  get(id: AiAgentId) {
    return this.agents.find((a) => a.id === id) ?? null;
  }

  register(agent: AiAgent) {
    const existing = this.agents.findIndex((a) => a.id === agent.id);
    if (existing >= 0) this.agents[existing] = agent;
    else this.agents.push(agent);
    return agent;
  }

  unregister(id: AiAgentId) {
    this.agents = this.agents.filter((a) => a.id !== id);
  }

  forTool(toolSlug: string) {
    return this.list(toolSlug).filter((a) => a.enabled);
  }
}

export const omniAgentRegistry = new OmniAgentRegistry();
