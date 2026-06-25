import type { OmniToolSlug, UndoEntry, UndoStack } from "./types";
import { omniEventBus } from "./OmniEventBus";

const MAX_UNDO = 100;

/** Global and per-tool undo/redo — project and timeline aware. */
export class OmniUndoRedo {
  stacks = new Map<string, UndoStack>();

  private stackKey(toolSlug: OmniToolSlug, projectId: string | null) {
    return `${toolSlug}:${projectId ?? "global"}`;
  }

  getStack(toolSlug: OmniToolSlug, projectId: string | null = null) {
    const key = this.stackKey(toolSlug, projectId);
    if (!this.stacks.has(key)) {
      this.stacks.set(key, { id: key, toolSlug, projectId, undo: [], redo: [] });
    }
    return this.stacks.get(key)!;
  }

  push(toolSlug: OmniToolSlug, label: string, projectId: string | null = null, beat: number | null = null) {
    const stack = this.getStack(toolSlug, projectId);
    const entry: UndoEntry = {
      id: `undo-${Date.now()}`,
      label,
      toolSlug,
      projectId,
      beat,
      timestamp: new Date().toISOString(),
    };
    stack.undo.unshift(entry);
    stack.redo = [];
    if (stack.undo.length > MAX_UNDO) stack.undo.length = MAX_UNDO;
    omniEventBus.publish("undo:push", { stackId: stack.id, label });
    return entry;
  }

  undo(toolSlug: OmniToolSlug, projectId: string | null = null) {
    const stack = this.getStack(toolSlug, projectId);
    const entry = stack.undo.shift();
    if (entry) stack.redo.unshift(entry);
    return entry ?? null;
  }

  redo(toolSlug: OmniToolSlug, projectId: string | null = null) {
    const stack = this.getStack(toolSlug, projectId);
    const entry = stack.redo.shift();
    if (entry) stack.undo.unshift(entry);
    return entry ?? null;
  }

  canUndo(toolSlug: OmniToolSlug, projectId: string | null = null) {
    return this.getStack(toolSlug, projectId).undo.length > 0;
  }

  canRedo(toolSlug: OmniToolSlug, projectId: string | null = null) {
    return this.getStack(toolSlug, projectId).redo.length > 0;
  }
}

export const omniUndoRedo = new OmniUndoRedo();
