"use client";

import { useEffect, useState } from "react";
import { DS_BREAKPOINTS } from "../tokens/spacing";

export type DSBreakpoint = "mobile" | "tablet" | "laptop" | "desktop" | "ultrawide";

function resolveBreakpoint(width: number): DSBreakpoint {
  if (width >= DS_BREAKPOINTS.ultrawide) return "ultrawide";
  if (width >= DS_BREAKPOINTS.desktop) return "desktop";
  if (width >= DS_BREAKPOINTS.laptop) return "laptop";
  if (width >= DS_BREAKPOINTS.tablet) return "tablet";
  return "mobile";
}

export function useBreakpoint(): DSBreakpoint {
  const [bp, setBp] = useState<DSBreakpoint>("desktop");

  useEffect(() => {
    const update = () => setBp(resolveBreakpoint(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

export function useIsMobile() {
  const bp = useBreakpoint();
  return bp === "mobile";
}
