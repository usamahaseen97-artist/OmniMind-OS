import { resolveBackendUrl } from "./backend-url";
import type { ToolDispatchResult } from "./omni-tools-api";

export type AgentResearchPayload = {
  user_id: string;
  message: string;
  agent_id?: string;
  conversation_id?: string;
  /** Image files staged from dashboard + menu */
  images?: File[];
};

/** CrewAI / Gemini researcher — powers dashboard chat + live preview panel. */
export async function runAgentResearch(
  payload: AgentResearchPayload,
  signal?: AbortSignal,
): Promise<ToolDispatchResult> {
  const base = await resolveBackendUrl();
  const imageFiles = (payload.images ?? []).filter((f) => f.type.startsWith("image/"));

  if (imageFiles.length > 0) {
    const fd = new FormData();
    fd.append("user_id", payload.user_id);
    fd.append("message", payload.message);
    if (payload.agent_id) fd.append("agent_id", payload.agent_id);
    if (payload.conversation_id) fd.append("conversation_id", payload.conversation_id);
    for (const file of imageFiles) {
      fd.append("images", file, file.name);
    }
    const res = await fetch(`${base}/api/v1/agents/research/upload`, {
      method: "POST",
      body: fd,
      signal,
    });
    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err || res.statusText, tool: "deep_research" };
    }
    return (await res.json()) as ToolDispatchResult;
  }

  const res = await fetch(`${base}/api/v1/agents/research`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: payload.user_id,
      message: payload.message,
      agent_id: payload.agent_id ?? "sovereign-core",
      conversation_id: payload.conversation_id,
    }),
    signal,
  });
  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: err || res.statusText, tool: "deep_research" };
  }
  return (await res.json()) as ToolDispatchResult;
}
