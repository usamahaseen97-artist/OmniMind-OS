import type { OmniProject, OmniSession, OmniSetting, RecentItem } from "../../core/omnicore/types";
import { omniCoreApiClient } from "../../core/omnicore/OmniCoreApiClient";

/** @deprecated Prefer omniCoreApiClient — retained for bridge backward compatibility. */
export const omnicoreApi = {
  listProjects() {
    return omniCoreApiClient.listProjects();
  },
  saveProjects(projects: OmniProject[]) {
    return omniCoreApiClient.saveProjects(projects);
  },
  saveWorkspace(projectId: string, state: unknown) {
    return omniCoreApiClient.saveWorkspace(projectId, state);
  },
  search(query: string) {
    return omniCoreApiClient.search(query);
  },
  saveSettings(settings: OmniSetting[]) {
    return omniCoreApiClient.saveSettings(settings);
  },
  saveSession(session: OmniSession) {
    return omniCoreApiClient.saveSession(session);
  },
  listRecent() {
    return omniCoreApiClient.listRecent();
  },
  saveRecent(items: RecentItem[]) {
    return omniCoreApiClient.saveRecent(items);
  },
};
