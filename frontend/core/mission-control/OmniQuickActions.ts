import { QUICK_ACTIONS } from "./constants";
import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import { omniPlatformSync } from "../omnicore/OmniPlatformSync";
import { omniProjectManager } from "../omnicore/OmniProjectManager";
import { omniQuality } from "../quality/OmniQuality";
import { omniUpdateManager } from "../omnicore/OmniUpdateManager";
import { omniSystemLogs } from "./OmniSystemLogs";

/** Quick Actions — one-click project, deploy, sync, diagnostics. */
export class OmniQuickActions {
  list() {
    return [...QUICK_ACTIONS];
  }

  async run(actionId: string) {
    const action = QUICK_ACTIONS.find((a) => a.id === actionId);
    if (!action) return { ok: false };

    omniSystemLogs.log("frontend", `Quick action: ${action.label}`, "info");

    switch (action.action) {
      case "create-project":
        omniProjectManager.create("New Mission Project", "universal", []);
        break;
      case "sync":
        await omniPlatformSync.syncAll();
        break;
      case "diagnostics":
        await omniQuality.runHealthProbes();
        break;
      case "update":
        omniUpdateManager.check();
        break;
      default:
        break;
    }

    const remote = await omniMissionControlApiClient.runQuickAction(action.action);
    return remote ?? { ok: true };
  }
}

export const omniQuickActions = new OmniQuickActions();
