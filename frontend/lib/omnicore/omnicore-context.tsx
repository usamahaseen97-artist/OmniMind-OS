"use client";

import { createContext, useContext, type ReactNode } from "react";
import { omniCore } from "../../core/omnicore";
import type { OmniCoreContextSlice } from "./omnicore-context-types";
import { useOmniCoreBridge } from "./use-omnicore-bridge";
import "./register-api-auth";

export type OmniCoreContextValue = OmniCoreContextSlice & {
  core: typeof omniCore;
};

const OmniCoreContext = createContext<OmniCoreContextValue | null>(null);

export function OmniCoreProvider({ children }: { children: ReactNode }) {
  const bridge = useOmniCoreBridge();
  const value: OmniCoreContextValue = { ...bridge, core: omniCore };
  return <OmniCoreContext.Provider value={value}>{children}</OmniCoreContext.Provider>;
}

export function useOmniCore(): OmniCoreContextValue {
  const ctx = useContext(OmniCoreContext);
  if (!ctx) throw new Error("useOmniCore must be used within OmniCoreProvider");
  return ctx;
}

/** Optional hook — returns null outside provider (for gradual adoption). */
export function useOmniCoreOptional(): OmniCoreContextValue | null {
  return useContext(OmniCoreContext);
}
