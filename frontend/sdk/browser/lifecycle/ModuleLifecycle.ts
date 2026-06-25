import { getSDKEventBus } from "../events";
import type { SDKModuleManifest, SDKModuleState } from "../../shared/types";

export type LifecycleHook = () => void | Promise<void>;

export type ModuleLifecycleHooks = {
  onInitialize?: LifecycleHook;
  onLoad?: LifecycleHook;
  onReady?: LifecycleHook;
  onActive?: LifecycleHook;
  onSleep?: LifecycleHook;
  onPause?: LifecycleHook;
  onResume?: LifecycleHook;
  onShutdown?: LifecycleHook;
  onDestroy?: LifecycleHook;
  onRecovery?: LifecycleHook;
};

/** Module lifecycle — Initialize → Load → Ready → Active → Sleep/Pause/Resume → Shutdown → Destroy */
export class ModuleLifecycle {
  private state: SDKModuleState = "initialize";
  private hooks: ModuleLifecycleHooks = {};

  constructor(
    readonly manifest: SDKModuleManifest,
    hooks?: ModuleLifecycleHooks,
  ) {
    if (hooks) this.hooks = hooks;
  }

  getState() {
    return this.state;
  }

  setHooks(hooks: ModuleLifecycleHooks) {
    this.hooks = { ...this.hooks, ...hooks };
  }

  private async transition(next: SDKModuleState, hook?: LifecycleHook) {
    this.state = next;
    getSDKEventBus().publish("ModuleStateChanged", {
      moduleId: this.manifest.id,
      state: next,
    });
    if (hook) await hook();
  }

  async initialize() {
    await this.transition("initialize", this.hooks.onInitialize);
  }

  async load() {
    await this.transition("load", this.hooks.onLoad);
  }

  async ready() {
    await this.transition("ready", this.hooks.onReady);
  }

  async activate() {
    await this.transition("active", this.hooks.onActive);
  }

  async sleep() {
    await this.transition("sleep", this.hooks.onSleep);
  }

  async pause() {
    await this.transition("pause", this.hooks.onPause);
  }

  async resume() {
    await this.transition("resume", this.hooks.onResume);
  }

  async shutdown() {
    await this.transition("shutdown", this.hooks.onShutdown);
  }

  async destroy() {
    await this.transition("destroy", this.hooks.onDestroy);
  }

  async recovery() {
    await this.transition("recovery", this.hooks.onRecovery);
  }

  /** Full boot sequence */
  async boot() {
    await this.initialize();
    await this.load();
    await this.ready();
    await this.activate();
  }
}
