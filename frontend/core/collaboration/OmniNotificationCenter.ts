import type { CollabNotification } from "./types";

/** OmniCollaborationNotificationCenter — enterprise real-time notifications (distinct from OmniCore UI toasts). */
export class OmniCollaborationNotificationCenter {
  items: CollabNotification[] = [];

  push(orgId: string, userId: string, title: string, body: string) {
    const n: CollabNotification = {
      id: `cn-${Date.now()}`,
      orgId,
      userId,
      title,
      body,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.items.unshift(n);
    return n;
  }

  forUser(userId: string, orgId?: string) {
    return this.items.filter(
      (n) => n.userId === userId && (!orgId || n.orgId === orgId),
    );
  }

  unread(userId: string) {
    return this.items.filter((n) => n.userId === userId && !n.read);
  }

  markRead(id: string) {
    const n = this.items.find((i) => i.id === id);
    if (!n) return false;
    n.read = true;
    return true;
  }

  markAllRead(userId: string) {
    this.items.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
  }

  clear(userId: string) {
    this.items = this.items.filter((n) => n.userId !== userId);
  }
}

export const omniCollabNotificationCenter = new OmniCollaborationNotificationCenter();
