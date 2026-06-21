"use client";

import { useEffect, useRef } from "react";
import { useIDE } from "../../IDEProvider";
import { useOmniForgeLayout } from "../../../../lib/omniforge-layout-context";
import type { GeneratedFileAsset } from "../../../../lib/execution-preview";

const CODE_EXT = /\.(js|jsx|ts|tsx|py|css|json|md|html)$/i;

function pickFirstCodeFile(files: GeneratedFileAsset[]) {
  const code = files.filter((f) => !f.isFolder && CODE_EXT.test(f.path));
  return code.sort((a, b) => a.path.localeCompare(b.path))[0];
}

/** Opens tabs when real files arrive from the API (never injects dummy files). */
export function OmniForgeWorkspaceBoot() {
  const { projectFiles, openFile } = useIDE();
  const { openFileTab, setActiveTab } = useOmniForgeLayout();
  const openedPaths = useRef<Set<string>>(new Set());

  const syncFromFiles = (files: GeneratedFileAsset[]) => {
    if (!files.length) return;
    const codeFiles = files.filter((f) => !f.isFolder && CODE_EXT.test(f.path));
    for (const f of codeFiles) {
      if (openedPaths.current.has(f.path)) continue;
      openedPaths.current.add(f.path);
      const label = f.path.split("/").pop() ?? f.path;
      openFileTab(f.path, label);
    }

    const first = pickFirstCodeFile(files);
    if (first) {
      openFile({ ...first, isFolder: false });
      const label = first.path.split("/").pop() ?? first.path;
      setActiveTab({ kind: "file", path: first.path, label });
    }
  };

  useEffect(() => {
    const onLoaded = (e: Event) => {
      const detail = (e as CustomEvent<{ files: GeneratedFileAsset[] }>).detail;
      syncFromFiles(detail?.files ?? []);
    };
    window.addEventListener("omnimind:omniforge-files-loaded", onLoaded);
    return () => window.removeEventListener("omnimind:omniforge-files-loaded", onLoaded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!projectFiles.length) return;
    syncFromFiles(projectFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectFiles]);

  return null;
}
