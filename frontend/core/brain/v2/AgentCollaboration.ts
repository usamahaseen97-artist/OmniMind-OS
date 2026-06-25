import type { Brain2AgentId, Brain2CollaborationMessage } from "./types";
import { getBrain2Agent } from "./AgentRegistry";

type CollaborationRule = { from: Brain2AgentId; to: Brain2AgentId; trigger: RegExp };

const RULES: CollaborationRule[] = [
  { from: "medical_specialist", to: "research_scientist", trigger: /research|study|clinical/i },
  { from: "frontend_engineer", to: "security_engineer", trigger: /auth|secure|owasp/i },
  { from: "marketing_specialist", to: "vfx_artist", trigger: /video|visual|creative/i },
  { from: "music_producer", to: "vfx_artist", trigger: /sync|soundtrack|video/i },
  { from: "business_consultant", to: "financial_analyst", trigger: /analytics|forecast|revenue/i },
  { from: "backend_engineer", to: "database_engineer", trigger: /schema|migration|database/i },
];

/** Inter-agent collaboration — hidden from user. */
export class AgentCollaboration {
  run(text: string, activeAgents: Brain2AgentId[]): Brain2CollaborationMessage[] {
    const messages: Brain2CollaborationMessage[] = [];
    const active = new Set(activeAgents);

    for (const rule of RULES) {
      if (!active.has(rule.from) || !rule.trigger.test(text)) continue;
      const from = getBrain2Agent(rule.from);
      const to = getBrain2Agent(rule.to);
      if (!from || !to) continue;

      const id = `collab-${Date.now()}-${rule.from}`;
      messages.push({
        id,
        from: rule.from,
        to: rule.to,
        question: `${from.name} requests input from ${to.name}`,
        answer: `${to.name}: Applied ${to.capabilities[0]} perspective.`,
        at: new Date().toISOString(),
      });
    }

    return messages;
  }
}
