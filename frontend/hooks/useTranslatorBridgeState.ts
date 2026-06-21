"use client";

import { useSyncExternalStore } from "react";
import {
  getTranslatorBridgeState,
  subscribeTranslatorBridge,
  type TranslatorBridgeState,
} from "../lib/translator-bridge";

export function useTranslatorBridgeState(): TranslatorBridgeState {
  return useSyncExternalStore(
    subscribeTranslatorBridge,
    getTranslatorBridgeState,
    getTranslatorBridgeState,
  );
}
