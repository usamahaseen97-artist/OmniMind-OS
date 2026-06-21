"use client";

import { useEffect } from "react";
import type { DevFileWritten } from "../../../lib/dev-engine-api";
import { languageForPath } from "../../../lib/omnimind-ide-config";
import type { SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { isDevFileTreeSlug } from "../../../lib/dev-file-trees";
import { IDEProjectFileTree } from "../IDEProjectFileTree";
import { useIDE } from "../IDEProvider";
const PORTFOLIO_TITLE = "Save Project Portfolio Configuration Storage";

/** Compact portfolio explorer — dynamic files only */
export function DevFileTreePanel({ toolSlug }: { toolSlug: SovereignToolSlug }) {
  const { mergeGenerated, openFile } = useIDE();

  useEffect(() => {
    if (!isDevFileTreeSlug(toolSlug)) return;
    const onWritten = (e: Event) => {
      const file = (e as CustomEvent<DevFileWritten>).detail;
      if (!file?.path) return;
      mergeGenerated([
        {
          path: file.path,
          content: file.content,
          language: languageForPath(file.path),
        },
      ]);
      openFile({
        path: file.path,
        content: file.content,
        language: languageForPath(file.path),
      });
    };
    window.addEventListener("omnimind:dev-file-written", onWritten);
    return () => window.removeEventListener("omnimind:dev-file-written", onWritten);
  }, [mergeGenerated, openFile]);

  if (!isDevFileTreeSlug(toolSlug)) return null;

  return (
    <div
      className="flex max-h-[180px] shrink-0 flex-col overflow-hidden border-b"
      style={{ borderColor: "#1E293B", background: "#0B0F19" }}
    >
      <p className="shrink-0 px-2 py-1 text-[8px] font-bold uppercase tracking-wider omni-accent-text">
        {PORTFOLIO_TITLE}
      </p>
      <div className="min-h-0 flex-1 overflow-hidden">
        <IDEProjectFileTree compact showExplorerHeader />
      </div>
    </div>
  );
}
