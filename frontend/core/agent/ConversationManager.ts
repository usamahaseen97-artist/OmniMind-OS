import type { ConversationThread } from "./types";

const STORAGE_KEY = "omnimind_master_conversations_v1";

export class ConversationManager {
  private threads: ConversationThread[] = [];

  constructor() {
    this.load();
  }

  private load() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.threads = JSON.parse(raw);
    } catch {
      /* */
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.threads));
    } catch {
      /* */
    }
  }

  list(): ConversationThread[] {
    return this.threads;
  }

  getActive(activeId?: string): ConversationThread | undefined {
    if (!activeId) return this.threads[0];
    return this.threads.find((t) => t.id === activeId);
  }

  create(title: string, toolId?: string): ConversationThread {
    const thread: ConversationThread = {
      id: `conv-${Date.now()}`,
      title,
      toolId,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    this.threads = [thread, ...this.threads].slice(0, 30);
    this.persist();
    return thread;
  }

  appendMessage(threadId: string, role: "user" | "assistant" | "system", text: string) {
    const idx = this.threads.findIndex((t) => t.id === threadId);
    if (idx === -1) return;
    const thread = this.threads[idx]!;
    thread.messages = [...thread.messages, { role, text, at: new Date().toISOString() }].slice(-100);
    thread.updatedAt = new Date().toISOString();
    this.threads[idx] = thread;
    this.persist();
  }
}
