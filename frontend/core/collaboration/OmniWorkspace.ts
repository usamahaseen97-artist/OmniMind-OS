import { WORKSPACE_SEED } from "./constants";
import type { OrgWorkspace } from "./types";

/** OmniWorkspace — enterprise org workspaces (distinct from OmniWorkspaceManager layout presets). */
export class OmniWorkspace {
  workspaces: OrgWorkspace[] = [...WORKSPACE_SEED];
  activeWorkspaceId: string | null = WORKSPACE_SEED[0]?.id ?? null;

  list(orgId?: string) {
    return orgId ? this.workspaces.filter((w) => w.orgId === orgId) : this.workspaces;
  }

  get(id: string) {
    return this.workspaces.find((w) => w.id === id) ?? null;
  }

  setActive(id: string) {
    if (!this.get(id)) return false;
    this.activeWorkspaceId = id;
    return true;
  }

  active() {
    return this.activeWorkspaceId ? this.get(this.activeWorkspaceId) : null;
  }

  create(orgId: string, name: string) {
    const ws: OrgWorkspace = {
      id: `ows-${Date.now()}`,
      orgId,
      name,
      projectIds: [],
      storageUsedBytes: 0,
      memberIds: [],
    };
    this.workspaces.push(ws);
    return ws;
  }

  addProject(workspaceId: string, projectId: string) {
    const ws = this.get(workspaceId);
    if (!ws || ws.projectIds.includes(projectId)) return false;
    ws.projectIds.push(projectId);
    return true;
  }

  addMember(workspaceId: string, memberId: string) {
    const ws = this.get(workspaceId);
    if (!ws || ws.memberIds.includes(memberId)) return false;
    ws.memberIds.push(memberId);
    return true;
  }

  storageUsage(orgId: string) {
    return this.list(orgId).reduce((sum, w) => sum + w.storageUsedBytes, 0);
  }
}

export const omniWorkspace = new OmniWorkspace();
