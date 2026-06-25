import type { OmniShortcut, OmniToolSlug, ShortcutConflict, ShortcutScope } from "./types";
import { GLOBAL_SHORTCUTS } from "./constants";
import { omniEventBus } from "./OmniEventBus";

/** Global and per-tool shortcut registry with conflict detection. */
export class OmniShortcutManager {
  shortcuts: OmniShortcut[] = GLOBAL_SHORTCUTS.map((s) => ({ ...s }));
  activeProfileId = "default";

  list(scope?: ShortcutScope, toolSlug?: OmniToolSlug) {
    return this.shortcuts.filter((s) => {
      if (s.profileId !== this.activeProfileId) return false;
      if (scope && s.scope !== scope) return false;
      if (toolSlug && s.toolSlug && s.toolSlug !== toolSlug) return false;
      return true;
    });
  }

  register(shortcut: OmniShortcut) {
    this.shortcuts.push(shortcut);
    return shortcut;
  }

  detectConflicts(): ShortcutConflict[] {
    const conflicts: ShortcutConflict[] = [];
    const byKeys = new Map<string, OmniShortcut[]>();
    this.shortcuts.forEach((s) => {
      const k = s.keys.toLowerCase();
      if (!byKeys.has(k)) byKeys.set(k, []);
      byKeys.get(k)!.push(s);
    });
    byKeys.forEach((group, keys) => {
      if (group.length > 1) {
        group.slice(1).forEach((s) => {
          conflicts.push({
            shortcutId: s.id,
            conflictsWith: group[0]!.id,
            keys,
          });
        });
      }
    });
    return conflicts;
  }

  trigger(id: string) {
    const sc = this.shortcuts.find((s) => s.id === id);
    if (sc) omniEventBus.publish("shortcut:triggered", { shortcutId: id });
    return sc ?? null;
  }

  setProfile(profileId: string) {
    this.activeProfileId = profileId;
  }
}

export const omniShortcutManager = new OmniShortcutManager();
