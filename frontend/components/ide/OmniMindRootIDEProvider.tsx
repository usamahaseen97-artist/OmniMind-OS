"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getSovereignTool, type SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import { IDEProvider } from "./IDEProvider";

const DEFAULT_TOOL_SLUG: SovereignToolSlug = "omniforge-engine";

function toolSlugFromPathname(pathname: string): SovereignToolSlug {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return DEFAULT_TOOL_SLUG;
  return getSovereignTool(segment)?.slug ?? DEFAULT_TOOL_SLUG;
}

/**
 * App-wide IDE context — pathname selects active sovereign tool slug.
 * Ensures global chrome (Quick Search, etc.) shares the same IDE tree as workbenches.
 */
export function OmniMindRootIDEProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const toolSlug = useMemo(() => toolSlugFromPathname(pathname), [pathname]);

  return <IDEProvider toolSlug={toolSlug}>{children}</IDEProvider>;
}
