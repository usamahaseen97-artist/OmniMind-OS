import type { AiAgentId, Conversation, ConversationMessage } from "./types";

/** Conversation database — per agent / tool. */
export class OmniConversationManager {
  conversations: Conversation[] = [];
  activeConversationId: string | null = null;
  private maxConversations = 100;
  private maxMessagesPerConversation = 200;

  create(agentId: AiAgentId, toolSlug: string, title: string): Conversation {
    const conv: Conversation = {
      id: `conv-${Date.now()}`,
      agentId,
      toolSlug,
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.conversations.unshift(conv);
    this.activeConversationId = conv.id;
    this.pruneConversations();
    return conv;
  }

  get(id: string) {
    return this.conversations.find((c) => c.id === id) ?? null;
  }

  active() {
    return this.activeConversationId ? this.get(this.activeConversationId) : null;
  }

  append(conversationId: string, role: ConversationMessage["role"], content: string) {
    const conv = this.get(conversationId);
    if (!conv) return null;
    const msg: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      tokenCount: Math.ceil(content.length / 4),
    };
    conv.messages.push(msg);
    conv.updatedAt = new Date().toISOString();
    if (conv.messages.length > this.maxMessagesPerConversation) {
      conv.messages = conv.messages.slice(-this.maxMessagesPerConversation);
    }
    return msg;
  }

  list(toolSlug?: string) {
    return toolSlug ? this.conversations.filter((c) => c.toolSlug === toolSlug) : [...this.conversations];
  }

  /** Prune oldest conversations and trim message history for token optimization. */
  prune(maxConversations = this.maxConversations) {
    this.maxConversations = maxConversations;
    this.pruneConversations();
    this.conversations.forEach((c) => {
      if (c.messages.length > this.maxMessagesPerConversation) {
        c.messages = c.messages.slice(-this.maxMessagesPerConversation);
      }
    });
  }

  private pruneConversations() {
    if (this.conversations.length <= this.maxConversations) return;
    this.conversations = this.conversations.slice(0, this.maxConversations);
    if (this.activeConversationId && !this.get(this.activeConversationId)) {
      this.activeConversationId = this.conversations[0]?.id ?? null;
    }
  }
}

export const omniConversationManager = new OmniConversationManager();
