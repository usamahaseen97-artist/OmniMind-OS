import { omniOrganization } from "./OmniOrganization";
import { omniWorkspace } from "./OmniWorkspace";
import { omniAuditCenter } from "./OmniAuditCenter";

/** OmniAdminConsole — organization dashboard and enterprise administration. */
export class OmniAdminConsole {
  dashboard(orgId: string) {
    const org = omniOrganization.get(orgId);
    const members = omniOrganization.listMembers(orgId);
    const workspaces = omniWorkspace.list(orgId);
    const storageBytes = omniWorkspace.storageUsage(orgId);
    const recentAudit = omniAuditCenter.list(orgId, 10);

    return {
      org,
      memberCount: members.length,
      workspaceCount: workspaces.length,
      storageBytes,
      storageGb: Math.round((storageBytes / 1_073_741_824) * 100) / 100,
      recentAudit,
      license: { seats: members.length, used: members.filter((m) => m.status === "active").length },
    };
  }

  suspendMember(memberId: string) {
    const member = omniOrganization.members.find((m) => m.id === memberId);
    if (!member) return false;
    member.status = "suspended";
    omniAuditCenter.log(member.orgId, "system", "member.suspended", memberId);
    return true;
  }

  reactivateMember(memberId: string) {
    const member = omniOrganization.members.find((m) => m.id === memberId);
    if (!member) return false;
    member.status = "active";
    omniAuditCenter.log(member.orgId, "system", "member.reactivated", memberId);
    return true;
  }

  storageReport(orgId: string) {
    return omniWorkspace.list(orgId).map((w) => ({
      workspaceId: w.id,
      name: w.name,
      usedBytes: w.storageUsedBytes,
      projectCount: w.projectIds.length,
    }));
  }
}

export const omniAdminConsole = new OmniAdminConsole();
