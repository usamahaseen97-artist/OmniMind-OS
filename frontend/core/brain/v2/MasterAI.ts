import type { BrainPlan } from "../types";
import type { IntentMatch } from "../../agent/types";
import { agentsForTool, selectAgentsForCapabilities } from "./AgentRegistry";
import type { Brain2AgentId, Brain2Subtask } from "./types";
import type { Brain2ToolRoute } from "./types";

export type MasterAIResult = {
  intent: string;
  subtasks: Brain2Subtask[];
  selectedAgents: Brain2AgentId[];
  summary: string;
};

/** Master AI — decompose, assign, prepare merge. */
export class MasterAI {
  process(text: string, plan: BrainPlan, intent: IntentMatch | null, route: Brain2ToolRoute): MasterAIResult {
    const capabilities = route.capability ? [route.capability] : [];
    const agents = selectAgentsForCapabilities(capabilities, 6);
    const toolAgents = agentsForTool(route.toolId).slice(0, 3);

    const selectedIds = [...new Set([...agents, ...toolAgents].map((a) => a.id))].slice(0, 6);
    if (!selectedIds.includes("master_ai")) selectedIds.unshift("master_ai");

    const subtasks: Brain2Subtask[] = plan.subtasks.length
      ? plan.subtasks.map((st, i) => ({
          id: st.id,
          label: st.label,
          agentId: mapSpecialistToBrain2(st.specialistId) ?? toolAgents[0]?.id ?? "master_ai",
          toolId: st.toolId ?? route.toolId,
          status: st.status === "completed" ? "completed" : st.status === "running" ? "running" : "queued",
          parallel: i > 0 && !st.dependsOn?.length,
        }))
      : [
          {
            id: "st-master",
            label: plan.goal,
            agentId: selectedIds[1] ?? "chief_architect",
            toolId: route.toolId,
            status: "queued",
            parallel: false,
          },
        ];

    return {
      intent: intent?.reason ?? "General request",
      subtasks,
      selectedAgents: selectedIds,
      summary: `Master AI: ${plan.subtasks.length || 1} subtask(s) · ${selectedIds.length} agent(s) · route ${route.toolId}`,
    };
  }

  mergeResponses(parts: string[]): string {
    const unique = [...new Set(parts.filter(Boolean))];
    if (unique.length <= 1) return unique[0] ?? "Request processed.";
    return unique.join(" ");
  }
}

function mapSpecialistToBrain2(specialistId?: string): Brain2AgentId | undefined {
  const map: Record<string, Brain2AgentId> = {
    architect: "chief_architect",
    developer: "frontend_engineer",
    analyst: "business_consultant",
    designer: "vfx_artist",
    editor: "content_writer",
    security: "security_engineer",
    devops: "devops_engineer",
    researcher: "research_scientist",
    documentation: "content_writer",
    reviewer: "testing_engineer",
    planner: "master_ai",
  };
  return specialistId ? map[specialistId] : undefined;
}
