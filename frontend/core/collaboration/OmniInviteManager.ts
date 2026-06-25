import type { OrgInvitation, OrgRole } from "./types";

/** OmniInviteManager — organization member invitations. */
export class OmniInviteManager {
  invitations: OrgInvitation[] = [];

  list(orgId: string) {
    return this.invitations.filter((i) => i.orgId === orgId);
  }

  pending(orgId: string) {
    return this.invitations.filter((i) => i.orgId === orgId && i.status === "pending");
  }

  invite(orgId: string, email: string, role: OrgRole) {
    const inv: OrgInvitation = {
      id: `inv-${Date.now()}`,
      orgId,
      email,
      role,
      status: "pending",
      invitedAt: new Date().toISOString(),
    };
    this.invitations.push(inv);
    return inv;
  }

  accept(id: string) {
    const inv = this.invitations.find((i) => i.id === id);
    if (!inv || inv.status !== "pending") return false;
    inv.status = "accepted";
    return true;
  }

  revoke(id: string) {
    const inv = this.invitations.find((i) => i.id === id);
    if (!inv) return false;
    inv.status = "expired";
    return true;
  }
}

export const omniInviteManager = new OmniInviteManager();
