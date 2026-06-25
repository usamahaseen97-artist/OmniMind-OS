/**
 * OmniMind V12 Official SDK — canonical browser entry (default).
 *
 * Layout:
 * - `sdk/browser/` — browser/React runtime (canonical client SDK)
 * - `sdk/node/`     — CLI, generators, doctor (canonical Node SDK)
 * - `sdk/shared/`   — types and validation (canonical shared layer)
 *
 * Import paths:
 * - `@omnimind/sdk` or `@/sdk/browser` — browser
 * - `@omnimind/sdk/node`               — Node/CLI
 * - `@omnimind/sdk/shared`             — shared types
 */
export * from "./browser";
