import type { AiAgentId } from "./types";
import { omniAgentRegistry } from "./OmniAgentRegistry";
import { omniModelRouter } from "./OmniModelRouter";

/** Active agent session manager. */
export class OmniAgentManager {
  activeAgentId: AiAgentId | null = "developer-agent";

  active() {
    return this.activeAgentId ? omniAgentRegistry.get(this.activeAgentId) : null;
  }

  select(id: AiAgentId) {
    const agent = omniAgentRegistry.get(id);
    if (agent?.enabled) this.activeAgentId = id;
    return agent;
  }

  run(prompt: string, agentId?: AiAgentId) {
    const agent = agentId ? omniAgentRegistry.get(agentId) : this.active();
    if (!agent) return null;
    const route = omniModelRouter.route({
      prompt,
      modelId: agent.defaultModelId,
      agentId: agent.id,
    });
    return { agent, route };
  }
}

export const omniAgentManager = new OmniAgentManager();
