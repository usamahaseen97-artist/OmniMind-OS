export const SUPER_TOOL_IDS = [
  "nasa-science-solver",
  "marketing-ad-king",
  "business-software-architect",
  "ai-omnimaps",
] as const;

export type SuperToolId = (typeof SUPER_TOOL_IDS)[number];

export function isSuperTool(id: string): id is SuperToolId {
  return (SUPER_TOOL_IDS as readonly string[]).includes(id);
}

export type ScienceDomain = { id: string; label: string; icon: string };

export type MarketingPost = {
  platform: string;
  headline: string;
  caption: string;
  hashtags: string[];
  media_type: string;
  media_placeholder: string;
  cta: string;
};

export type MarketingPostsResponse = {
  strategy_summary: string;
  target_audience: string;
  posts: MarketingPost[];
};

import { getBackendUrl } from "./backend-url";

export async function fetchScienceDomains(): Promise<ScienceDomain[]> {
  const res = await fetch(`${getBackendUrl()}/science/domains`);
  if (!res.ok) return [];
  const data = (await res.json()) as { domains: ScienceDomain[] };
  return data.domains ?? [];
}

export async function streamScienceSolve(
  payload: { problem: string; domain: string; history?: { role: string; content: string }[] },
  onToken: (t: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${getBackendUrl()}/science/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Science solve failed (${res.status})`);
  await consumeSse(res.body, onToken);
}

export async function fetchMarketingPosts(body: {
  product_or_service: string;
  brand_name: string;
  platforms?: string[];
  campaign_goal?: string;
}): Promise<MarketingPostsResponse> {
  const res = await fetch(`${getBackendUrl()}/marketing/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to generate posts");
  return res.json();
}

export async function streamMarketingStrategy(
  payload: { brief: string; brand_name: string; platform?: string; tone?: string },
  onToken: (t: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${getBackendUrl()}/marketing/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Marketing stream failed (${res.status})`);
  await consumeSse(res.body, onToken);
}

export async function streamBusinessPlan(
  payload: {
    business_name: string;
    software_type: string;
    requirements: string;
    team_size?: string;
  },
  onToken: (t: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${getBackendUrl()}/business_builder/plan/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Business plan failed (${res.status})`);
  await consumeSse(res.body, onToken);
}

export async function streamBusinessAgents(
  payload: {
    business_name: string;
    use_cases: string;
    clone_founder?: boolean;
    founder_persona?: string;
  },
  onToken: (t: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${getBackendUrl()}/business_builder/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`Agents design failed (${res.status})`);
  await consumeSse(res.body, onToken);
}

async function consumeSse(
  body: ReadableStream<Uint8Array>,
  onToken: (t: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6)) as { token?: string };
        if (typeof data.token === "string") onToken(data.token);
      } catch {
        /* skip */
      }
    }
  }
}
