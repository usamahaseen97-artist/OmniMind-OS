import type { OmniNotification, NotificationLevel, OmniToolSlug } from "./types";
import { omniEventBus } from "./OmniEventBus";

/** Platform notification center — cross-tool alerts. */
export class OmniNotificationCenter {
  items: OmniNotification[] = [];

  list(unreadOnly = false) {
    return unreadOnly ? this.items.filter((n) => !n.read) : [...this.items];
  }

  show(title: string, body: string, level: NotificationLevel = "info", toolSlug: OmniToolSlug | null = null) {
    const notification: OmniNotification = {
      id: `ntf-${Date.now()}`,
      title,
      body,
      level,
      toolSlug,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.items.unshift(notification);
    omniEventBus.publish("notification:show", { id: notification.id, title });
    return notification;
  }

  markRead(id: string) {
    const n = this.items.find((x) => x.id === id);
    if (n) n.read = true;
    return n ?? null;
  }

  dismiss(id: string) {
    this.items = this.items.filter((n) => n.id !== id);
  }

  clear() {
    this.items = [];
  }
}

export const omniNotificationCenter = new OmniNotificationCenter();
