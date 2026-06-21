"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOmniForgeShell } from "../../../../lib/omniforge-shell-context";
import {
  parseTargetStackParam,
  targetStackFromLegacyRoute,
} from "../../../../lib/omniforge-project-profile";

/** Applies ?stack= and legacy slug hints to the shell target stack. */
export function OmniForgeStackBootstrap({ legacySlug }: { legacySlug?: string }) {
  const params = useSearchParams();
  const { setTargetStack } = useOmniForgeShell();

  useEffect(() => {
    const fromQuery = parseTargetStackParam(params.get("stack"));
    if (fromQuery) {
      setTargetStack(fromQuery);
      return;
    }
    if (legacySlug) {
      setTargetStack(targetStackFromLegacyRoute(legacySlug));
    }
  }, [legacySlug, params, setTargetStack]);

  return null;
}
