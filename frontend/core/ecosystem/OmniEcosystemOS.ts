import { omniHomeDashboard } from "./OmniHomeDashboard";
import { omniMindHub } from "./OmniMindHub";
import { omniUniversalSidebar } from "./OmniUniversalSidebar";
import { omniActivityCenter } from "./OmniActivityCenter";
import { omniSystemTaskManager } from "./OmniSystemTaskManager";
import { omniAITaskCenter } from "./OmniAITaskCenter";
import { omniProjectManagerPro } from "./OmniProjectManagerPro";
import { omniBackgroundAgents } from "./OmniBackgroundAgents";
import { omniLiveNotifications } from "./OmniLiveNotifications";
import { omniGlobalSearch } from "../omnicore/OmniGlobalSearch";

export const ECOSYSTEM_OS_VERSION = "1.0.0-ecosystem";

/** OmniEcosystemOS — Enterprise Operating System layer facade. */
export class OmniEcosystemOS {
  readonly version = ECOSYSTEM_OS_VERSION;

  readonly home = omniHomeDashboard;
  readonly hub = omniMindHub;
  readonly sidebar = omniUniversalSidebar;
  readonly activity = omniActivityCenter;
  readonly systemTasks = omniSystemTaskManager;
  readonly aiTasks = omniAITaskCenter;
  readonly projects = omniProjectManagerPro;
  readonly backgroundAgents = omniBackgroundAgents;
  readonly notifications = omniLiveNotifications;
  readonly search = omniGlobalSearch;

  private booted = false;

  async boot() {
    if (this.booted) return this;
    await Promise.all([
      this.sidebar.boot(),
      this.activity.boot(),
      this.backgroundAgents.boot(),
      this.notifications.sync(),
      this.systemTasks.refresh(),
    ]);
    this.booted = true;
    return this;
  }

  searchAll(query: string) {
    const base = this.search.search(query);
    const q = query.trim().toLowerCase();
    if (!q) return base;
    const activityHits = this.activity.items
      .filter((a) => a.title.toLowerCase().includes(q) || (a.detail ?? "").toLowerCase().includes(q))
      .map((a) => ({
        id: `sr-act-${a.id}`,
        kind: "history" as const,
        title: a.title,
        subtitle: `${a.kind} · ${a.status}`,
        toolSlug: (a.toolSlug as import("../omnicore/types").OmniToolSlug) ?? null,
        score: 0.72,
      }));
    return [...base, ...activityHits].sort((a, b) => b.score - a.score).slice(0, 48);
  }

  snapshot() {
    return {
      version: this.version,
      booted: this.booted,
      hub: this.hub.snapshot(),
      sidebar: this.sidebar.snapshot(),
      activity: this.activity.snapshot(),
      system: this.systemTasks.snapshot(),
      aiTasks: this.aiTasks.snapshot(),
      backgroundAgents: this.backgroundAgents.snapshot(),
      notifications: this.notifications.snapshot(),
    };
  }
}

export const omniEcosystemOS = new OmniEcosystemOS();
