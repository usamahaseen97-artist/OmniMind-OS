import type { ApprovalRequest, TeamComment, TeamMember, TeamRole, VersionEntry } from "./types";

export class TeamWorkspaceEngine {
  addMember(members: TeamMember[], name: string, email: string, role: TeamRole): TeamMember[] {
    const colors = ["#f472b6", "#38bdf8", "#a78bfa", "#34d399", "#fbbf24"];
    return [
      ...members,
      { id: `tm-${Date.now()}`, name, email, role, avatarColor: colors[members.length % colors.length]! },
    ];
  }

  addComment(comments: TeamComment[], assetId: string, authorId: string, body: string): TeamComment[] {
    return [
      ...comments,
      { id: `cmt-${Date.now()}`, assetId, authorId, body, createdAt: new Date().toISOString(), resolved: false },
    ];
  }

  requestApproval(requests: ApprovalRequest[], itemId: string, itemType: ApprovalRequest["itemType"], by: string): ApprovalRequest[] {
    return [
      ...requests,
      { id: `apr-${Date.now()}`, itemId, itemType, status: "pending", requestedBy: by, reviewerId: null },
    ];
  }

  snapshot(versions: VersionEntry[], label: string, authorId: string): VersionEntry[] {
    return [
      { id: `ver-${Date.now()}`, label, authorId, timestamp: new Date().toISOString() },
      ...versions,
    ];
  }
}

export const teamWorkspaceEngine = new TeamWorkspaceEngine();
