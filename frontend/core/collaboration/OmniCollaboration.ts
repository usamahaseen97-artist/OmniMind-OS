import { OMNICORE_COLLAB_VERSION } from "./constants";
import { omniActivityTimeline } from "./OmniActivityTimeline";
import { omniAdminConsole } from "./OmniAdminConsole";
import { omniAPIKeyManager } from "./OmniAPIKeyManager";
import { omniAuditCenter } from "./OmniAuditCenter";
import { omniBillingArchitecture } from "./OmniBillingArchitecture";
import { omniComments } from "./OmniComments";
import { omniCollabNotificationCenter } from "./OmniNotificationCenter";
import { omniEnterpriseSettings } from "./OmniEnterpriseSettings";
import { omniInviteManager } from "./OmniInviteManager";
import { omniOrganization } from "./OmniOrganization";
import { omniPermissionEngine } from "./OmniPermissionEngine";
import { omniPresence } from "./OmniPresence";
import { omniRealtimeHub } from "./OmniRealtimeHub";
import { omniReviewCenter } from "./OmniReviewCenter";
import { omniRoleManager } from "./OmniRoleManager";
import { omniSecurityCenter } from "./OmniSecurityCenter";
import { omniTeamManager } from "./OmniTeamManager";
import { omniWorkspace } from "./OmniWorkspace";
import type { OrgPermission } from "./types";

/** OmniCollaboration — enterprise collaboration & admin platform facade. */
export class OmniCollaboration {
  readonly version = OMNICORE_COLLAB_VERSION;

  readonly organization = omniOrganization;
  readonly orgWorkspace = omniWorkspace;
  readonly teams = omniTeamManager;
  readonly roles = omniRoleManager;
  readonly permissions = omniPermissionEngine;
  readonly presence = omniPresence;
  readonly realtime = omniRealtimeHub;
  readonly comments = omniComments;
  readonly reviews = omniReviewCenter;
  readonly activity = omniActivityTimeline;
  readonly notifications = omniCollabNotificationCenter;
  readonly audit = omniAuditCenter;
  readonly admin = omniAdminConsole;
  readonly security = omniSecurityCenter;
  readonly apiKeys = omniAPIKeyManager;
  readonly enterprise = omniEnterpriseSettings;
  readonly invites = omniInviteManager;
  readonly billing = omniBillingArchitecture;

  private booted = false;

  boot() {
    if (this.booted) return this;
    this.booted = true;
    return this;
  }

  can(userId: string, orgId: string, permission: OrgPermission) {
    return this.permissions.can(userId, orgId, permission);
  }

  snapshot() {
    const org = this.organization.active();
    return {
      version: this.version,
      activeOrgId: this.organization.activeOrgId,
      activeOrg: org?.name ?? null,
      memberCount: org ? this.organization.listMembers(org.id).length : 0,
      workspaceCount: org ? this.orgWorkspace.list(org.id).length : 0,
      onlineUsers: this.presence.onlineCount(),
      activeSessions: this.realtime.activeSessions().length,
      pendingReviews: this.reviews.pending().length,
      unreadNotifications: 0,
    };
  }
}

export const omniCollaboration = new OmniCollaboration();
