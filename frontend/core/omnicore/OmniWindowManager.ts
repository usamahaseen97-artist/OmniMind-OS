import type { WindowState } from "./types";

let zCounter = 100;

/** Floating window registry — dockable / floating panel host. */
export class OmniWindowManager {
  windows: WindowState[] = [];

  list() {
    return [...this.windows];
  }

  open(panelId: string, title: string, opts?: Partial<Pick<WindowState, "width" | "height" | "floating">>) {
    const win: WindowState = {
      id: `win-${Date.now()}`,
      panelId,
      title,
      x: 80,
      y: 60,
      width: opts?.width ?? 480,
      height: opts?.height ?? 360,
      floating: opts?.floating ?? true,
      zIndex: ++zCounter,
      visible: true,
    };
    this.windows.push(win);
    return win;
  }

  close(id: string) {
    this.windows = this.windows.filter((w) => w.id !== id);
  }

  focus(id: string) {
    const win = this.windows.find((w) => w.id === id);
    if (win) win.zIndex = ++zCounter;
    return win ?? null;
  }

  move(id: string, x: number, y: number) {
    const win = this.windows.find((w) => w.id === id);
    if (win) {
      win.x = x;
      win.y = y;
    }
    return win ?? null;
  }

  resize(id: string, width: number, height: number) {
    const win = this.windows.find((w) => w.id === id);
    if (win) {
      win.width = width;
      win.height = height;
    }
    return win ?? null;
  }

  toggleFloat(id: string, floating: boolean) {
    const win = this.windows.find((w) => w.id === id);
    if (win) win.floating = floating;
    return win ?? null;
  }
}

export const omniWindowManager = new OmniWindowManager();
