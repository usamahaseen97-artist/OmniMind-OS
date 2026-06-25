import { getBackendUrl } from "../../../lib/backend-url";
import { getOmniMindBrain } from "../../../core/brain/OmniMindBrain";
import { getOmniPluginManager } from "../../../core/plugins/PluginManager";
import { getMarketplaceManager } from "../../../core/marketplace/MarketplaceManager";
import { applyDesignSystemTheme, ENTERPRISE_THEMES } from "../../../design-system/themes";
import { getSDKEventBus } from "../events";
import { verifyManifest } from "../../shared/validation";
import type { SDKModuleManifest } from "../../shared/types";

/** Core SDK — platform identity, events, lifecycle entry */
export class CoreSDK {
  readonly version = "12.0.0";
  readonly events = getSDKEventBus();

  getPlatformInfo() {
    return {
      version: this.version,
      minPlatform: "12.0.0",
      backend: typeof window !== "undefined" ? getBackendUrl() : "http://127.0.0.1:8001",
    };
  }
}

/** UI SDK — design system bridge */
export class UISDK {
  applyTheme(id: keyof typeof ENTERPRISE_THEMES = "deep-purple") {
    applyDesignSystemTheme(ENTERPRISE_THEMES[id]);
  }

  themes() {
    return ENTERPRISE_THEMES;
  }
}

/** AI SDK — chat, streaming, reasoning */
export class AISDK {
  async chat(text: string, ctx?: { toolId?: string; routeId?: string }) {
    const brain = getOmniMindBrain();
    return brain.processRequest(text, {
      activeToolId: ctx?.toolId,
      routeId: ctx?.routeId,
      pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
    });
  }

  async stream(text: string, onToken: (chunk: string) => void) {
    const result = await this.chat(text);
    if (result.response) onToken(result.response);
    return result;
  }

  reasoning(intent: string) {
    return getOmniMindBrain().reasoning.reason(intent, null);
  }
}

/** Memory SDK */
export class MemorySDK {
  private brain = getOmniMindBrain();

  pin(note: string) {
    this.brain.globalMemory.pinNote(note);
  }

  getPreferences() {
    return this.brain.globalMemory.getBrainSlice().preferences;
  }

  setPreference(key: string, value: string) {
    this.brain.globalMemory.setPreference(key, value);
  }

  recordToolUse(toolId: string) {
    this.brain.globalMemory.rememberTool(toolId);
  }
}

/** Brain SDK */
export class BrainSDK {
  private brain = getOmniMindBrain();

  processRequest = this.brain.processRequest.bind(this.brain);
  get brain2() {
    return this.brain.brain2;
  }
  get orchestrator() {
    return this.brain.orchestrator;
  }
}

/** Plugin SDK — wraps universal plugin manager */
export class PluginSDKPackage {
  private pm = getOmniPluginManager();
  private marketplace = getMarketplaceManager();

  install = this.pm.install.bind(this.pm);
  uninstall = this.pm.uninstall.bind(this.pm);
  list = this.pm.list.bind(this.pm);
  execute = this.pm.executeAction.bind(this.pm);
  get sdk() {
    return this.marketplace.sdk;
  }
}

/** Voice SDK */
export class VoiceSDK {
  private voice = getOmniMindBrain().voice;
  speak = this.voice.synthesizeSpeech.bind(this.voice);
  listen = this.voice.startListening.bind(this.voice);
  stopListening = this.voice.stopListening.bind(this.voice);
}

/** Auth SDK */
export class AuthSDK {
  async getSession() {
    if (typeof window === "undefined") return null;
    try {
      const res = await fetch(`${getBackendUrl()}/api/v1/auth/me`, { credentials: "include" });
      if (res.ok) return res.json();
    } catch {
      /* guest */
    }
    return { user: "guest", role: "developer" };
  }
}

/** Storage SDK */
export class StorageSDK {
  get(key: string) {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`omnimind:sdk:${key}`);
  }

  set(key: string, value: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(`omnimind:sdk:${key}`, value);
  }

  remove(key: string) {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`omnimind:sdk:${key}`);
  }
}

/** Database SDK */
export class DatabaseSDK {
  async query(collection: string, body: Record<string, unknown> = {}) {
    const res = await fetch(`${getBackendUrl()}/api/v1/chats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: Object.keys(body).length ? JSON.stringify(body) : undefined,
    });
    void collection;
    return res.ok ? res.json() : null;
  }
}

/** Networking SDK */
export class NetworkingSDK {
  baseUrl = getBackendUrl;

  async fetch(path: string, init?: RequestInit) {
    return fetch(`${getBackendUrl()}${path}`, init);
  }

  async gatewayExecute(tool: string, payload: Record<string, unknown>) {
    return this.fetch("/api/v1/gateway/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, ...payload }),
    }).then((r) => r.json());
  }
}

/** Deployment SDK */
export class DeploymentSDK {
  async deploy(target: string, config: Record<string, unknown> = {}) {
    const res = await fetch(`${getBackendUrl()}/api/v1/build-engine/omniforge/deploy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, ...config }),
    });
    getSDKEventBus().publish("DeploymentComplete", { moduleId: "sdk", target });
    return res.json().catch(() => ({ ok: res.ok, target }));
  }
}

/** Security SDK */
export class SecuritySDK {
  private pm = getOmniPluginManager();

  async requestPermission(pluginId: string, scope: string, reason = "SDK module request") {
    return this.pm.permissions.request(
      pluginId,
      scope as import("../../../core/plugins/types").PluginPermissionScope,
      reason,
    );
  }

  validateSignature(manifest: { signature?: string; author: string }) {
    return !!manifest.signature || manifest.author === "OmniMind";
  }
}

/** Analytics SDK */
export class AnalyticsSDK {
  private mp = getMarketplaceManager();

  recordDownload = this.mp.analytics.recordDownload.bind(this.mp.analytics);
  getMetrics = this.mp.analytics.get.bind(this.mp.analytics);
}

/** Developer Tools SDK (browser) — manifest validation only; doctor is Node-only */
export class DevToolsSDK {
  verify(manifest: SDKModuleManifest) {
    return verifyManifest(manifest);
  }
}

/** Testing SDK */
export class TestingSDK {
  createMockSDK = () => import("../testing/mocks").then((m) => m.createMockSDK());
  mockAI = () => import("../testing/mocks").then((m) => m.mockAI);
}
