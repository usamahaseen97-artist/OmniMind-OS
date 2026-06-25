"use client";

import { useEffect } from "react";
import { getOmniMindSDK } from "@/sdk/browser";

/** Boot OmniMind SDK — exposes global API on window for dev tools */
export function SDKBoot() {
  useEffect(() => {
    const sdk = getOmniMindSDK();
    if (typeof window !== "undefined") {
      (window as unknown as { OmniMindSDK: typeof sdk }).OmniMindSDK = sdk;
    }
  }, []);
  return null;
}
