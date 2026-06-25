import type { AccessibilityPrefs } from "./types";

/** Platform accessibility preferences. */
export class OmniAccessibility {
  prefs: AccessibilityPrefs = {
    reduceMotion: false,
    highContrast: false,
    largeText: false,
    screenReaderHints: true,
    keyboardNavigation: true,
  };

  get() {
    return { ...this.prefs };
  }

  update(patch: Partial<AccessibilityPrefs>) {
    this.prefs = { ...this.prefs, ...patch };
    return this.prefs;
  }

  applyDocumentHints() {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.toggle("omnicore-reduce-motion", this.prefs.reduceMotion);
    root.classList.toggle("omnicore-high-contrast", this.prefs.highContrast);
    root.classList.toggle("omnicore-large-text", this.prefs.largeText);
  }
}

export const omniAccessibility = new OmniAccessibility();
