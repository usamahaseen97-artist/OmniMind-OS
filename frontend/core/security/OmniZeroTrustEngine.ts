import { omniABACEngine } from "./OmniABACEngine";
import { omniAuthorizationEngine } from "./OmniAuthorizationEngine";
import { omniTrustedDeviceManager } from "./OmniTrustedDeviceManager";
import type { ABACContext, SecurityPermission, ZeroTrustDecision } from "./types";

/** OmniZeroTrustEngine — validate every request; least privilege. */
export class OmniZeroTrustEngine {
  validateRequest(ctx: ABACContext, permission: SecurityPermission): ZeroTrustDecision {
    const rbac = omniAuthorizationEngine.can(ctx.userId, permission);
    const abac = omniABACEngine.evaluate(
      {
        ...ctx,
        deviceTrusted: omniTrustedDeviceManager.isTrusted(ctx.userId, ctx.attributes?.deviceFingerprint as string ?? ""),
      },
      permission,
    );

    return {
      allowed: rbac && abac.allowed,
      reason: !rbac ? "rbac_denied" : abac.reason,
      checks: [
        { check: "rbac", passed: rbac },
        ...abac.checks,
      ],
    };
  }

  /** Service-to-service auth placeholder — mTLS / signed service tokens. */
  validateServiceToken(token: string, requiredScope: string) {
    const valid = token.startsWith("svc_") && token.length > 16;
    return { valid, scope: valid ? requiredScope : null };
  }
}

export const omniZeroTrustEngine = new OmniZeroTrustEngine();
