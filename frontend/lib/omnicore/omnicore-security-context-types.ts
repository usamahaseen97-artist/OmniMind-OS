export type OmniCoreSecurityContextSlice = {
  securityReady: boolean;
  securityVersion: string;
  securitySnapshot: ReturnType<typeof import("../../core/security/OmniSecurity").omniSecurity.snapshot>;
  authorizeAction: (userId: string, permission: string) => boolean;
};
