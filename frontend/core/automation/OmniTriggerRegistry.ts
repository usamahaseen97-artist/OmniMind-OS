import { ACTION_CATALOG, TRIGGER_CATALOG } from "./constants";
import type { ActionDescriptor, AutomationActionId, AutomationTriggerId, TriggerDescriptor } from "./types";

export class OmniTriggerRegistry {
  list(): TriggerDescriptor[] {
    return [...TRIGGER_CATALOG];
  }

  get(id: AutomationTriggerId): TriggerDescriptor | null {
    return TRIGGER_CATALOG.find((t) => t.id === id) ?? null;
  }

  match(event: string): TriggerDescriptor[] {
    const key = event.toLowerCase();
    return TRIGGER_CATALOG.filter(
      (t) => t.id.includes(key) || t.label.toLowerCase().includes(key) || t.category.toLowerCase().includes(key),
    );
  }
}

export class OmniActionRegistry {
  list(): ActionDescriptor[] {
    return [...ACTION_CATALOG];
  }

  get(id: AutomationActionId): ActionDescriptor | null {
    return ACTION_CATALOG.find((a) => a.id === id) ?? null;
  }

  byTool(toolSlug: string): ActionDescriptor[] {
    return ACTION_CATALOG.filter((a) => a.toolSlug === toolSlug);
  }
}

export const omniTriggerRegistry = new OmniTriggerRegistry();
export const omniActionRegistry = new OmniActionRegistry();
