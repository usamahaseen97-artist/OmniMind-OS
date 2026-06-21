import { OMNIFORGE_API_BASE } from "./omniforge-api";

export type ExecuteActionType = "execute" | "navigate_back" | "switch_tool";

export type ExecuteRequest = {
  domain: string;
  command: string;
  current_project?: string;
  action_type?: ExecuteActionType;
};

export type NavMatrixItem = {
  id: string;
  label: string;
  href: string;
  breadcrumb?: string;
};

export type ExecuteResponse = {
  status: string;
  action?: string;
  domain?: string;
  previous_domain?: string;
  target_route?: string;
  msg?: string;
  navigation_menu?: NavMatrixItem[];
  execution_plan?: { steps?: string[]; confidence?: string };
  output_data?: Record<string, unknown>;
};

export function domainFromPathname(pathname: string): string {
  if (pathname.startsWith("/omniforge-engine")) return "omniforge";
  if (pathname.startsWith("/omnimusic")) return "omnimusic";
  if (pathname.startsWith("/creative-visionary") || pathname.startsWith("/vfx")) return "omnivision";
  if (pathname.startsWith("/business-analytics")) return "analytics";
  if (pathname.startsWith("/dashboard") || pathname === "/") return "omnichat";
  return "omniforge";
}

/** Ecosystem Routing Matrix — POST /api/execute on backend-fastapi (:8003). */
export async function postOmniMindExecute(body: ExecuteRequest): Promise<ExecuteResponse> {
  const res = await fetch(`${OMNIFORGE_API_BASE}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      domain: body.domain,
      command: body.command,
      current_project: body.current_project ?? "Default Project",
      action_type: body.action_type ?? "execute",
    }),
  });
  if (!res.ok) {
    throw new Error(`execute failed (${res.status})`);
  }
  return res.json();
}

export const DEFAULT_NAV_MATRIX: NavMatrixItem[] = [
  { id: "omnichat", label: "Neural Chatbot", href: "/", breadcrumb: "OmniChat" },
  { id: "omniforge", label: "OmniForge", href: "/omniforge-engine", breadcrumb: "OmniForge" },
  { id: "omnimusic", label: "OmniMusic", href: "/omnimusic", breadcrumb: "OmniMusic" },
  { id: "omnivision", label: "OmniVision", href: "/creative-visionary", breadcrumb: "OmniVision" },
  { id: "omnideploy", label: "OmniDeploy", href: "/omniforge-engine?panel=deploy", breadcrumb: "OmniDeploy" },
  { id: "settings", label: "Settings", href: "/?settings=1", breadcrumb: "Settings" },
];
