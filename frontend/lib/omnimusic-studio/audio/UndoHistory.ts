import type { UndoEntry } from "../audio-types";
import type { OmniMusicProject, TimelineClip } from "../types";
import type { WaveformData } from "../audio-types";

const MAX_STACK = 64;

export class UndoHistoryEngine {
  private undoStack: UndoEntry[] = [];
  private redoStack: UndoEntry[] = [];

  push(
    label: string,
    project: OmniMusicProject,
    waveforms: Record<string, WaveformData>,
    clips: TimelineClip[],
  ): void {
    this.undoStack.push({
      id: `undo-${Date.now()}`,
      label,
      timestamp: new Date().toISOString(),
      project: structuredClone(project),
      waveforms: structuredClone(waveforms),
      clips: structuredClone(clips),
    });
    if (this.undoStack.length > MAX_STACK) this.undoStack.shift();
    this.redoStack = [];
  }

  undo(): UndoEntry | null {
    const entry = this.undoStack.pop();
    if (!entry) return null;
    this.redoStack.push(entry);
    return entry;
  }

  redo(): UndoEntry | null {
    const entry = this.redoStack.pop();
    if (!entry) return null;
    this.undoStack.push(entry);
    return entry;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  history(): { undo: string[]; redo: string[] } {
    return {
      undo: this.undoStack.map((e) => e.label),
      redo: this.redoStack.map((e) => e.label),
    };
  }
}

export const undoHistoryEngine = new UndoHistoryEngine();
