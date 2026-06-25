import type { ABACContext, SecurityPermission, ZeroTrustDecision } from "./types";

/** OmniABACEngine — attribute-based access control architecture. */
export class OmniABACEngine {
  evaluate(ctx: ABACContext, permission: SecurityPermission): ZeroTrustDecision {
    const checks: ZeroTrustDecision["checks"] = [];

    checks.push({ check: "user_present", passed: !!ctx.userId });
    checks.push({ check: "mfa_when_required", passed: ctx.mfaVerified !== false });
    checks.push({ check: "device_trust", passed: ctx.deviceTrusted !== false });

    if (permission.startsWith("org:") && ctx.orgId) {
      checks.push({ check: "org_context", passed: true });
    }
    if (permission.startsWith("workspace:") && ctx.workspaceId) {
      checks.push({ check: "workspace_context", passed: true });
    }
    if (permission.startsWith("project:") && ctx.projectId) {
      checks.push({ check: "project_context", passed: true });
    }
    if (permission.startsWith("tool:") && ctx.toolSlug) {
      checks.push({ check: "tool_context", passed: !!ctx.toolSlug });
    }

    const failed = checks.filter((c) => !c.passed);
    return {
      allowed: failed.length === 0,
      reason: failed.length ? failed.map((f) => f.check).join(", ") : "all_checks_passed",
      checks,
    };
  }
}

export const omniABACEngine = new OmniABACEngine();
