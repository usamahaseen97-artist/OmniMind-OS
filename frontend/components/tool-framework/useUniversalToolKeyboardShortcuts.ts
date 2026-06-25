"use client";

import { useEffect } from "react";
import { useUniversalToolFramework } from "../../lib/universal-tool-framework-context";

/** Binds universal keyboard shortcuts for the active tool. */
export function useUniversalToolKeyboardShortcuts() {
  const { tool, execute, undo, redo, exportWorkspace } = useUniversalToolFramework();

  useEffect(() => {
    if (!tool) return;

    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === "s") {
        e.preventDefault();
        void execute({ actionId: "save" });
      }
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault();
        redo();
      }
      if (e.key === "e" && e.shiftKey) {
        e.preventDefault();
        exportWorkspace();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool, execute, undo, redo, exportWorkspace]);
}
