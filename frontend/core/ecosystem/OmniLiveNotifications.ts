import { omniNotificationCenter } from "../omnicore/OmniNotificationCenter";
import { omniEcosystemApiClient } from "./OmniEcosystemApiClient";
import { omniEventBus } from "../omnicore/OmniEventBus";
import type { LiveNotification, LiveNotificationChannel } from "./types";
import type { NotificationLevel } from "../omnicore/types";

/** Live Notifications — desktop, browser, email, push, progress. */
export class OmniLiveNotifications {
  channels: LiveNotificationChannel[] = ["browser", "desktop"];
  items: LiveNotification[] = [];

  async sync() {
    const remote = await omniEcosystemApiClient.listNotifications();
    if (remote?.ok) this.items = remote.notifications;
    return this.items;
  }

  push(
    title: string,
    body: string,
    level: LiveNotification["level"] = "info",
    opts: { channels?: LiveNotificationChannel[]; progress?: number } = {},
  ) {
    const n: LiveNotification = {
      id: `live-${Date.now()}`,
      title,
      body,
      level,
      channels: opts.channels ?? this.channels,
      progress: opts.progress,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.items.unshift(n);
    const omniLevel: NotificationLevel =
      level === "success" ? "success" : level === "error" ? "error" : level === "warn" ? "warning" : "info";
    omniNotificationCenter.show(title, body, omniLevel);
    omniEventBus.publish("notification:live", { id: n.id, level });
    if (typeof window !== "undefined" && opts.channels?.includes("desktop") && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(title, { body });
      } else if (Notification.permission !== "denied") {
        void Notification.requestPermission();
      }
    }
    return n;
  }

  markRead(id: string) {
    const n = this.items.find((x) => x.id === id);
    if (n) n.read = true;
    omniNotificationCenter.markRead(id);
    return n ?? null;
  }

  unread() {
    return this.items.filter((n) => !n.read);
  }

  snapshot() {
    return { unread: this.unread().length, channels: this.channels, items: this.items.slice(0, 40) };
  }
}

export const omniLiveNotifications = new OmniLiveNotifications();
