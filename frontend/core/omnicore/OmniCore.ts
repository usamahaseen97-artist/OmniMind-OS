import { OMNICORE_VERSION } from "./constants";
import { omniAccessibility } from "./OmniAccessibility";
import { omniClipboard } from "./OmniClipboard";
import { omniCommandPalette } from "./OmniCommandPalette";
import { omniDockManager } from "./OmniDockManager";
import { omniEventBus } from "./OmniEventBus";
import { omniGlobalSearch } from "./OmniGlobalSearch";
import { omniLayoutManager } from "./OmniLayoutManager";
import { omniLocalization } from "./OmniLocalization";
import { omniNotificationCenter } from "./OmniNotificationCenter";
import { omniProjectManager } from "./OmniProjectManager";
import { omniRecentItems } from "./OmniRecentItems";
import { omniSessionManager } from "./OmniSessionManager";
import { omniSettings } from "./OmniSettings";
import { omniShortcutManager } from "./OmniShortcutManager";
import { omniStateManager } from "./OmniStateManager";
import { omniThemeEngine } from "./OmniThemeEngine";
import { omniUndoRedo } from "./OmniUndoRedo";
import { omniUpdateManager } from "./OmniUpdateManager";
import { omniWindowManager } from "./OmniWindowManager";
import { omniWorkspaceManager } from "./OmniWorkspaceManager";
import { omniAI } from "../ai";
import { omniAssets } from "../assets";
import { omniPluginEngine } from "../plugins/omnicore-platform";
import { omniCollaboration } from "../collaboration";
import { omniSecurity } from "../security";
import { omniQuality } from "../quality";
import { omniMindUnifiedBrain } from "../brain/OmniMindUnifiedBrain";
import { omniProjectHub } from "./OmniProjectHub";
import { omniPlatformSync } from "./OmniPlatformSync";
import { omniEcosystemOS } from "../ecosystem/OmniEcosystemOS";
import { omniUniversalAutomationEngine } from "../automation/OmniUniversalAutomationEngine";
import { omniMissionControl } from "../mission-control/OmniMissionControl";
import { omniCloudPlatform } from "../omnicloud/OmniCloudPlatform";

/** OmniCore — unified operating system foundation facade. */
export class OmniCore {
  readonly version = OMNICORE_VERSION;

  readonly brain = omniMindUnifiedBrain;
  readonly projectHub = omniProjectHub;
  readonly platformSync = omniPlatformSync;
  readonly ecosystem = omniEcosystemOS;
  readonly automation = omniUniversalAutomationEngine;
  readonly missionControl = omniMissionControl;
  readonly cloud = omniCloudPlatform;
  readonly ai = omniAI;
  readonly assets = omniAssets;
  readonly plugins = omniPluginEngine;
  readonly collaboration = omniCollaboration;
  readonly security = omniSecurity;
  readonly quality = omniQuality;

  readonly eventBus = omniEventBus;
  readonly state = omniStateManager;
  readonly projects = omniProjectManager;
  readonly workspace = omniWorkspaceManager;
  readonly windows = omniWindowManager;
  readonly layout = omniLayoutManager;
  readonly dock = omniDockManager;
  readonly notifications = omniNotificationCenter;
  readonly commandPalette = omniCommandPalette;
  readonly search = omniGlobalSearch;
  readonly recent = omniRecentItems;
  readonly clipboard = omniClipboard;
  readonly shortcuts = omniShortcutManager;
  readonly undo = omniUndoRedo;
  readonly theme = omniThemeEngine;
  readonly settings = omniSettings;
  readonly i18n = omniLocalization;
  readonly accessibility = omniAccessibility;
  readonly session = omniSessionManager;
  readonly updates = omniUpdateManager;

  private booted = false;

  boot() {
    if (this.booted) return this;
    this.booted = true;
    this.ai.boot();
    this.assets.boot();
    this.plugins.boot();
    this.collaboration.boot();
    this.security.boot();
    this.quality.boot();
    this.brain.boot();
    void this.ecosystem.boot();
    void this.automation.boot();
    void this.missionControl.boot();
    void this.cloud.boot();
    this.session.start();
    this.accessibility.applyDocumentHints();
    this.notifications.show("OmniCore ready", "Platform foundation initialized.", "success");
    return this;
  }

  snapshot() {
    return {
      version: this.version,
      state: this.state.snapshot(),
      projects: this.projects.projects,
      activeProjectId: this.projects.activeProjectId,
      workspace: this.workspace.activePresetId,
      layout: this.layout.activeLayoutId,
      dock: this.dock.snapshot(),
      session: this.session.get(),
      settings: this.settings.list(),
      ai: this.ai.monitoring(),
      assets: this.assets.snapshot(),
      plugins: this.plugins.snapshot(),
      collaboration: this.collaboration.snapshot(),
      security: this.security.snapshot(),
      quality: this.quality.snapshot(),
      brain: this.brain.snapshot(),
      projectHub: {
        recent: this.projectHub.listRecent().slice(0, 5).map((p) => p.id),
        pinned: this.projectHub.listPinned().map((p) => p.id),
      },
      platformSync: this.platformSync.snapshot(),
      ecosystem: this.ecosystem.snapshot(),
      automation: this.automation.snapshot(),
      missionControl: this.missionControl.snapshot(),
      cloud: this.cloud.snapshot(),
    };
  }
}

export const omniCore = new OmniCore();
