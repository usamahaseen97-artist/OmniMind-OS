import type { AccessibilityPreferences } from "../types";

const STORAGE_KEY = "omnimind-medical-a11y";

/** Enterprise accessibility preferences */
export class AccessibilityArchitecture {
  private prefs: AccessibilityPreferences = {
    highContrast: false,
    reducedMotion: false,
    fontScale: 1,
    screenReaderOptimized: false,
    keyboardNavigation: true,
  };

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) this.prefs = { ...this.prefs, ...JSON.parse(stored) };
      } catch { /* ignore */ }
    }
  }

  getPreferences() {
    return { ...this.prefs };
  }

  update(partial: Partial<AccessibilityPreferences>) {
    this.prefs = { ...this.prefs, ...partial };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
        document.documentElement.style.setProperty("--medical-font-scale", String(this.prefs.fontScale));
        document.documentElement.classList.toggle("medical-high-contrast", this.prefs.highContrast);
        document.documentElement.classList.toggle("medical-reduced-motion", this.prefs.reducedMotion);
      } catch { /* ignore */ }
    }
    return this.prefs;
  }

  getAriaProps(label: string) {
    return {
      "aria-label": label,
      role: this.prefs.screenReaderOptimized ? ("region" as const) : undefined,
    };
  }
}

let a11y: AccessibilityArchitecture | null = null;

export function getAccessibilityArchitecture() {
  if (!a11y) a11y = new AccessibilityArchitecture();
  return a11y;
}
