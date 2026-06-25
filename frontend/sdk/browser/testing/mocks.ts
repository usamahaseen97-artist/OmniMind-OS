import type { UniversalAPI } from "../api/UniversalAPI";
import type { SDKModuleManifest } from "../../shared/types";

/** Mock SDK for integration tests — no browser or backend required */
export function createMockSDK() {
  const events: { name: string; payload: unknown }[] = [];

  const api = {
    core: { version: "12.0.0", events: { publish: (n: string, p: unknown) => events.push({ name: n, payload: p }) } },
    ai: {
      chat: async (text: string) => ({ response: `[mock] ${text}`, intent: null }),
      stream: async (text: string, onToken: (c: string) => void) => {
        onToken(`[mock] ${text}`);
        return { response: text };
      },
      reasoning: () => ({ summary: "mock", goals: [], constraints: [], domains: ["test"], confidence: 1 }),
    },
    memory: { pin: () => {}, setPreference: () => {}, recordToolUse: () => {}, getPreferences: () => ({}) },
    plugin: { install: async () => ({ ok: true }), list: () => [], execute: async () => ({ ok: true }) },
    events: { publish: (n: string, p: unknown) => events.push({ name: n, payload: p }), subscribe: () => () => {} },
    networking: { fetch: async () => ({ ok: true, json: async () => ({}) }) },
    auth: { getSession: async () => ({ user: "mock", role: "developer" }) },
  } as unknown as UniversalAPI;

  return {
    api,
    events,
    register: async (manifest: SDKModuleManifest) => ({
      moduleId: manifest.id,
      targets: {
        brain: true,
        memory: true,
        actions: true,
        theme: true,
        plugins: true,
        marketplace: true,
        permissions: true,
        analytics: true,
        notifications: true,
        search: true,
        "command-palette": true,
        workspace: true,
        "recent-activity": true,
        navigation: true,
        "global-search": true,
      },
      errors: [],
    }),
  };
}

export const mockAI = { chat: async (t: string) => `[mock-ai] ${t}` };
export const mockDatabase = { query: async () => ({ rows: [] }) };
export const mockMemory = { get: () => ({}), set: () => {} };
export const mockPlugins = { install: async () => ({ ok: true }) };
export const mockUsers = { current: () => ({ id: "mock-user", role: "developer" }) };
