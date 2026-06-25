import type { EnterpriseSettings } from "./types";

/** OmniEnterpriseSettings — SSO placeholders, retention, encryption policies. */
export class OmniEnterpriseSettings {
  settings: EnterpriseSettings[] = [
    {
      orgId: "org-1",
      ssoEnabled: false,
      ssoProvider: null,
      dataRetentionDays: 365,
      encryptionAtRest: true,
      auditRetentionDays: 730,
    },
  ];

  get(orgId: string) {
    return this.settings.find((s) => s.orgId === orgId) ?? null;
  }

  update(orgId: string, patch: Partial<Omit<EnterpriseSettings, "orgId">>) {
    let s = this.get(orgId);
    if (!s) {
      s = {
        orgId,
        ssoEnabled: false,
        ssoProvider: null,
        dataRetentionDays: 365,
        encryptionAtRest: true,
        auditRetentionDays: 730,
      };
      this.settings.push(s);
    }
    Object.assign(s, patch);
    return s;
  }

  /** SSO placeholder — returns mock redirect URL. */
  ssoLoginUrl(orgId: string) {
    const s = this.get(orgId);
    if (!s?.ssoEnabled || !s.ssoProvider) return null;
    return `https://sso.placeholder.omnimind.io/${orgId}/${s.ssoProvider}`;
  }
}

export const omniEnterpriseSettings = new OmniEnterpriseSettings();
