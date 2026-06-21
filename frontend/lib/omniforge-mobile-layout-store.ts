"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIDE } from "../components/ide/IDEProvider";
import { useOmniForgeWorkspaceOptional } from "./omniforge-workspace";
import {
  buildMobileLayoutPayload,
  MOBILE_LAYOUT_PATH,
  parseMobileLayoutFromFiles,
} from "./omniforge-preview-data";

export type MobileBlockType =
  | "product-image"
  | "title-price"
  | "description"
  | "color-options"
  | "add-to-cart";

export type MobileUiBlock = {
  id: string;
  type: MobileBlockType;
};

export function useOmniForgeMobileLayout() {
  const { projectFiles, updateFileContent } = useIDE();
  const omniforge = useOmniForgeWorkspaceOptional();
  const [blocks, setBlocks] = useState<MobileUiBlock[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const saving = useRef(false);

  useEffect(() => {
    const config = parseMobileLayoutFromFiles(projectFiles);
    if (config?.blocks?.length) {
      setBlocks(config.blocks);
      setHydrated(true);
      return;
    }
    if (projectFiles.length && !hydrated) {
      setBlocks([]);
      setHydrated(true);
    }
  }, [hydrated, projectFiles]);

  const persistLayout = useCallback(
    (next: MobileUiBlock[]) => {
      if (saving.current) return;
      saving.current = true;
      const payload = buildMobileLayoutPayload(next);
      updateFileContent(MOBILE_LAYOUT_PATH, payload);
      window.dispatchEvent(
        new CustomEvent("omnimind:omniforge-file-save", {
          detail: { path: MOBILE_LAYOUT_PATH, content: payload },
        }),
      );
      window.dispatchEvent(new CustomEvent("omnimind:mobile-layout-changed", { detail: next }));
      queueMicrotask(() => {
        saving.current = false;
      });
    },
    [updateFileContent],
  );

  const reorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      setBlocks((prev) => {
        const next = [...prev];
        const [moved] = next.splice(fromIndex, 1);
        if (!moved) return prev;
        next.splice(toIndex, 0, moved);
        if (omniforge?.status === "ready") persistLayout(next);
        return next;
      });
    },
    [omniforge?.status, persistLayout],
  );

  return { blocks, reorder, hasLayout: blocks.length > 0 };
}
