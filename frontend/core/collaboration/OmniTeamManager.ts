import type { Team } from "./types";

/** OmniTeamManager — departments, teams, and project assignments. */
export class OmniTeamManager {
  teams: Team[] = [
    { id: "team-1", orgId: "org-1", departmentId: "dept-1", name: "Platform", memberIds: ["mem-1", "mem-2"] },
    { id: "team-2", orgId: "org-1", departmentId: "dept-2", name: "UX", memberIds: ["mem-2"] },
  ];

  list(orgId: string) {
    return this.teams.filter((t) => t.orgId === orgId);
  }

  get(id: string) {
    return this.teams.find((t) => t.id === id) ?? null;
  }

  create(orgId: string, name: string, departmentId: string | null = null) {
    const team: Team = {
      id: `team-${Date.now()}`,
      orgId,
      departmentId,
      name,
      memberIds: [],
    };
    this.teams.push(team);
    return team;
  }

  addMember(teamId: string, memberId: string) {
    const team = this.get(teamId);
    if (!team || team.memberIds.includes(memberId)) return false;
    team.memberIds.push(memberId);
    return true;
  }

  removeMember(teamId: string, memberId: string) {
    const team = this.get(teamId);
    if (!team) return false;
    team.memberIds = team.memberIds.filter((id) => id !== memberId);
    return true;
  }

  assignProject(teamId: string, _projectId: string) {
    const team = this.get(teamId);
    return !!team;
  }
}

export const omniTeamManager = new OmniTeamManager();
