import { AUTOMATION_ENGINE_VERSION } from "./constants";
import { omniTriggerRegistry, omniActionRegistry } from "./OmniTriggerRegistry";
import { omniWorkflowBuilder } from "./OmniWorkflowBuilder";
import { omniWorkflowExecutor } from "./OmniWorkflowExecutor";
import { omniWorkflowLibrary } from "./OmniWorkflowLibrary";
import { omniAutomationAI } from "./OmniAutomationAI";
import { omniAutomationQueue } from "./OmniAutomationQueue";
import { omniAutomationMonitor } from "./OmniAutomationMonitor";

/** OmniUniversalAutomationEngine — V2.0 AI-native automation platform facade. */
export class OmniUniversalAutomationEngine {
  readonly version = AUTOMATION_ENGINE_VERSION;

  readonly triggers = omniTriggerRegistry;
  readonly actions = omniActionRegistry;
  readonly builder = omniWorkflowBuilder;
  readonly executor = omniWorkflowExecutor;
  readonly library = omniWorkflowLibrary;
  readonly ai = omniAutomationAI;
  readonly queue = omniAutomationQueue;
  readonly monitor = omniAutomationMonitor;

  private booted = false;

  async boot() {
    if (this.booted) return this;
    await this.builder.boot();
    await this.monitor.refresh();
    this.booted = true;
    return this;
  }

  snapshot() {
    return {
      version: this.version,
      booted: this.booted,
      workflowCount: this.builder.list().length,
      templateCount: this.library.templates().length,
      queue: this.queue.snapshot(),
      monitor: this.monitor.dashboard(),
    };
  }
}

export const omniUniversalAutomationEngine = new OmniUniversalAutomationEngine();
