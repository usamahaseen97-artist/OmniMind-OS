import type { CommandCategory, OmniCommand } from "./types";
import { COMMAND_SEED } from "./constants";
import { omniEventBus } from "./OmniEventBus";

/** Keyboard-driven command palette — global commands registry. */
export class OmniCommandPalette {
  private commands: OmniCommand[] = [];
  open = false;
  query = "";

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    COMMAND_SEED.forEach((c) => {
      this.register({
        id: c.id,
        label: c.label,
        category: c.category,
        shortcutId: null,
        keywords: [c.label.toLowerCase()],
        run: () => {
          omniEventBus.publish("command:executed", { commandId: c.id });
        },
      });
    });
  }

  register(command: OmniCommand) {
    this.commands.push(command);
  }

  list(category?: CommandCategory) {
    const list = category ? this.commands.filter((c) => c.category === category) : this.commands;
    if (!this.query.trim()) return list;
    const q = this.query.toLowerCase();
    return list.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.keywords.some((k) => k.includes(q)),
    );
  }

  toggle(open?: boolean) {
    this.open = open ?? !this.open;
    if (!this.open) this.query = "";
    return this.open;
  }

  setQuery(query: string) {
    this.query = query;
    omniEventBus.publish("search:query", { query });
    return this.list();
  }

  execute(id: string) {
    const cmd = this.commands.find((c) => c.id === id);
    if (cmd) {
      cmd.run();
      omniEventBus.publish("command:executed", { commandId: id });
      this.open = false;
      this.query = "";
    }
    return cmd ?? null;
  }
}

export const omniCommandPalette = new OmniCommandPalette();
