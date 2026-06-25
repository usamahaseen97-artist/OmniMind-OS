import { omniAI } from "../ai/OmniAI";
import { omniMindUnifiedBrain } from "../brain/OmniMindUnifiedBrain";
import { omniProjectHub } from "../omnicore/OmniProjectHub";
import { omniRecentItems } from "../omnicore/OmniRecentItems";
import { omniGlobalSearch } from "../omnicore/OmniGlobalSearch";
import { omniNotificationCenter } from "../omnicore/OmniNotificationCenter";
import { omniUpdateManager } from "../omnicore/OmniUpdateManager";
import { omniQuality } from "../quality/OmniQuality";
import { omniAssets } from "../assets/OmniAssets";
import { omniProjectManager } from "../omnicore/OmniProjectManager";
import { omniEcosystemApiClient } from "./OmniEcosystemApiClient";
import type { HomeDashboardSnapshot } from "./types";

/** OmniHomeDashboard — aggregates live platform state for the Home OS surface. */
export class OmniHomeDashboard {
  async snapshot(): Promise<HomeDashboardSnapshot> {
    const remote = await omniEcosystemApiClient.fetchDashboard();
    const recent = omniProjectHub.listRecent().slice(0, 8);
    const pinned = omniProjectHub.listPinned();
    const active = omniProjectManager.active();
    const chats = omniAI.conversations.list().slice(0, 6).map((c) => ({
      id: c.id,
      title: c.title,
      toolSlug: c.toolSlug,
      updatedAt: c.updatedAt,
    }));

    const healthDash = omniQuality.health.dashboard();
    const healthScore =
      healthDash.status === "healthy" ? 95 : healthDash.status === "degraded" ? 72 : healthDash.status === "unhealthy" ? 40 : 60;
    const aiMon = omniAI.monitoring();
    const brain = omniMindUnifiedBrain.buildContext();

    const recommendations = this.buildRecommendations(brain.activeToolSlug, recent);
    const continueWorking = active
      ? {
          projectId: active.id,
          toolSlug: active.toolSlugs[0] ?? "omnimind",
          label: active.name,
        }
      : recent[0]
        ? {
            projectId: recent[0].id,
            toolSlug: recent[0].toolSlugs[0] ?? "omnimind",
            label: recent[0].name,
          }
        : null;

    const base: HomeDashboardSnapshot = {
      recentProjects: recent,
      pinnedProjects: pinned,
      recommendations,
      continueWorking,
      recentChats: chats,
      systemHealth: {
        score: healthScore,
        label: healthDash.status,
        checks: healthDash.services.map((c) => ({
          name: c.name,
          ok: c.status === "healthy",
        })),
      },
      aiActivity: {
        requestCount: aiMon.requestCount,
        latencyP50Ms: aiMon.latencyP50Ms,
      },
      runningTasks: [],
      backgroundJobs: [],
      notifications: omniNotificationCenter.list().map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        level: n.level === "success" ? "success" : n.level === "error" ? "error" : "info",
        channels: ["browser" as const],
        read: n.read,
        createdAt: n.createdAt,
      })),
      updates: (() => {
        const u = omniUpdateManager.check();
        return [{ id: "upd-current", title: u.releaseNotes, version: u.latestVersion }];
      })(),
      quickLaunch: omniGlobalSearch.search("").filter((r) => r.kind === "tool").slice(0, 8).map((r) => ({
        id: r.id,
        label: r.title,
        href: `/app/${r.toolSlug ?? "omnimind"}`,
        toolSlug: r.toolSlug ?? "omnimind",
      })),
      favorites: omniProjectHub.listFavorites().map((p) => ({
        id: p.id,
        label: p.name,
        href: `/`,
      })),
      recentFiles: omniAssets.assets.assets.slice(0, 10).map((a) => ({
        id: a.id,
        name: a.name,
        path: a.metadata.path ?? a.previewUrl ?? a.name,
      })),
      calendar: omniRecentItems.list(5).map((r, i) => ({
        id: `cal-${i}`,
        title: r.label,
        at: r.accessedAt,
      })),
      goals: [
        { id: "goal-ship", title: "Ship RC1 release", progress: 82 },
        { id: "goal-tests", title: "Maintain test coverage", progress: 75 },
      ],
    };

    if (remote?.ok && remote.dashboard) {
      const d = remote.dashboard as Partial<HomeDashboardSnapshot>;
      return { ...base, ...d, recentProjects: base.recentProjects, pinnedProjects: base.pinnedProjects };
    }
    return base;
  }

  private buildRecommendations(
    activeTool: string | null,
    recent: ReturnType<typeof omniProjectHub.listRecent>,
  ) {
    const items: { id: string; text: string; action?: string }[] = [];
    if (recent.length) {
      items.push({
        id: "rec-continue",
        text: `Continue "${recent[0].name}" — last modified recently`,
        action: `project:${recent[0].id}`,
      });
    }
    if (activeTool) {
      items.push({
        id: "rec-tool",
        text: `Resume work in ${activeTool.replace(/-/g, " ")}`,
        action: `tool:${activeTool}`,
      });
    }
    items.push({
      id: "rec-sync",
      text: "Sync workspace to cloud for cross-device continuity",
      action: "sync",
    });
    return items;
  }
}

export const omniHomeDashboard = new OmniHomeDashboard();
