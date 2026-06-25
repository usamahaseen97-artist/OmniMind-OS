import {
  AISDK,
  AnalyticsSDK,
  AuthSDK,
  BrainSDK,
  CoreSDK,
  DatabaseSDK,
  DeploymentSDK,
  DevToolsSDK,
  MemorySDK,
  NetworkingSDK,
  PluginSDKPackage,
  SecuritySDK,
  StorageSDK,
  TestingSDK,
  UISDK,
  VoiceSDK,
} from "../packages";
import { getAutoRegistration } from "../registration";
import { getSDKEventBus } from "../events";
import { ModuleLifecycle } from "../lifecycle";
import type { SDKModuleManifest, SDKRegistrationResult } from "../../shared/types";

/**
 * Universal API — single facade for all OmniMind SDK capabilities.
 * Every future tool inherits Brain, Memory, Design System, Marketplace, and Plugins.
 */
export class UniversalAPI {
  readonly core = new CoreSDK();
  readonly ui = new UISDK();
  readonly ai = new AISDK();
  readonly memory = new MemorySDK();
  readonly brain = new BrainSDK();
  readonly plugin = new PluginSDKPackage();
  readonly voice = new VoiceSDK();
  readonly auth = new AuthSDK();
  readonly storage = new StorageSDK();
  readonly database = new DatabaseSDK();
  readonly networking = new NetworkingSDK();
  readonly deployment = new DeploymentSDK();
  readonly security = new SecuritySDK();
  readonly analytics = new AnalyticsSDK();
  readonly devtools = new DevToolsSDK();
  readonly testing = new TestingSDK();
  readonly events = getSDKEventBus();

  async registerModule(manifest: SDKModuleManifest): Promise<SDKRegistrationResult> {
    return getAutoRegistration().register(manifest);
  }

  createLifecycle(manifest: SDKModuleManifest) {
    return new ModuleLifecycle(manifest);
  }

  /** Shorthand namespaces */
  get chat() {
    return this.ai.chat.bind(this.ai);
  }
  get stream() {
    return this.ai.stream.bind(this.ai);
  }
  get permissions() {
    return this.security.requestPermission.bind(this.security);
  }
  get workflow() {
    return {
      complete: (moduleId: string, workflowId: string) =>
        this.events.publish("WorkflowCompleted", { moduleId, workflowId }),
    };
  }
  get notifications() {
    return {
      emit: (title: string, body: string) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("omnimind:notification", { detail: { title, body } }));
        }
      },
    };
  }
  get search() {
    return {
      index: (moduleId: string, terms: string[]) => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("omnimind:search-index", { detail: { moduleId, terms } }));
        }
      },
    };
  }
}

let api: UniversalAPI | null = null;

export function getUniversalAPI(): UniversalAPI {
  if (!api) api = new UniversalAPI();
  return api;
}
