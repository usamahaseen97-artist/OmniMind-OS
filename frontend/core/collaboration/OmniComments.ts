import type { CommentMessage, CommentThread } from "./types";

/** OmniComments — inline, file, asset, and timeline comment threads. */
export class OmniComments {
  threads: CommentThread[] = [];

  list(resourceId?: string) {
    return resourceId
      ? this.threads.filter((t) => t.resourceId === resourceId)
      : this.threads;
  }

  get(threadId: string) {
    return this.threads.find((t) => t.id === threadId) ?? null;
  }

  create(
    resourceType: CommentThread["resourceType"],
    resourceId: string,
    authorId: string,
    body: string,
    mentions: string[] = [],
  ) {
    const msg: CommentMessage = {
      id: `cmt-${Date.now()}`,
      authorId,
      body,
      mentions,
      attachments: [],
      createdAt: new Date().toISOString(),
    };
    const thread: CommentThread = {
      id: `thread-${Date.now()}`,
      resourceType,
      resourceId,
      resolved: false,
      messages: [msg],
    };
    this.threads.push(thread);
    return thread;
  }

  reply(threadId: string, authorId: string, body: string, mentions: string[] = []) {
    const thread = this.get(threadId);
    if (!thread) return null;
    const msg: CommentMessage = {
      id: `cmt-${Date.now()}`,
      authorId,
      body,
      mentions,
      attachments: [],
      createdAt: new Date().toISOString(),
    };
    thread.messages.push(msg);
    return msg;
  }

  resolve(threadId: string) {
    const thread = this.get(threadId);
    if (!thread) return false;
    thread.resolved = true;
    return true;
  }

  reopen(threadId: string) {
    const thread = this.get(threadId);
    if (!thread) return false;
    thread.resolved = false;
    return true;
  }

  attach(threadId: string, messageId: string, attachmentId: string) {
    const thread = this.get(threadId);
    const msg = thread?.messages.find((m) => m.id === messageId);
    if (!msg) return false;
    msg.attachments.push(attachmentId);
    return true;
  }

  unresolved(resourceId?: string) {
    return this.list(resourceId).filter((t) => !t.resolved);
  }
}

export const omniComments = new OmniComments();
