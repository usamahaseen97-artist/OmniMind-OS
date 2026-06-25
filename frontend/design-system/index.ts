/**
 * OmniMind V12 Enterprise Design System
 * Single visual language for every sovereign tool and future module.
 */
export * from "./tokens";
export * from "./themes";
export * from "./hooks";
export * from "./components";
export * from "./ai";

// Backward-compatible OS token bridge
export { getOSTokensFromDesignSystem, OS_TOKENS } from "./bridge/os-tokens";
