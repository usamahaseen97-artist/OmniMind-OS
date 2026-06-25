import type { BrandColor, BrandIdentity, BrandLogo, BrandTypography } from "./types";

export class BrandStudioEngine {
  createColor(colors: BrandColor[], hex: string, role: BrandColor["role"]): BrandColor[] {
    return [...colors, { id: `col-${Date.now()}`, hex, role, name: role }];
  }

  createLogo(logos: BrandLogo[], name: string, variant: BrandLogo["variant"]): BrandLogo[] {
    return [...logos, { id: `logo-${Date.now()}`, name, variant, url: null }];
  }

  createFont(fonts: BrandTypography[], family: string, role: BrandTypography["role"]): BrandTypography[] {
    return [...fonts, { id: `font-${Date.now()}`, family, weight: "400", role }];
  }

  updateIdentity(identity: BrandIdentity, patch: Partial<BrandIdentity>): BrandIdentity {
    return { ...identity, ...patch };
  }
}

export const brandStudioEngine = new BrandStudioEngine();
