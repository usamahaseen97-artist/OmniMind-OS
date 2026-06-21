"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, FolderTree } from "lucide-react";
import { ACTIVITY_BAR_WIDTH_PX } from "../../lib/activity-bar";
import { isDevFileTreeSlug } from "../../lib/dev-file-trees";
import { getLayoutFlags } from "../../lib/workbench-layout";
import { type SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import { useIDE } from "./IDEProvider";
import { cn } from "../../lib/utils";

const DynamicActivityToolsDrawer = dynamic(
  () => import("./ActivityToolsDrawer").then((m) => ({ default: m.ActivityToolsDrawer })),
  { ssr: false },
);

/** ZONE 1 — minimal rail: back · tools overlay · dev file tree only */
export function SovereignActivityBar() {
  const pathname = usePathname();
  const { leftExplorerOpen, setLeftExplorerOpen, setRightExplorerOpen, setRightView } = useIDE();
  const [toolsOpen, setToolsOpen] = useState(false);
  const currentSlug = pathname.replace("/", "") as SovereignToolSlug;
  const flags = getLayoutFlags(currentSlug);
  const showFiles = isDevFileTreeSlug(currentSlug) && (flags.showLeftExplorer || flags.showFilesToggle);

  const toggleExplorer = () => {
    if (flags.showLeftExplorer) {
      setLeftExplorerOpen(!leftExplorerOpen);
    } else if (flags.showFilesToggle) {
      setRightExplorerOpen(true);
      setRightView("files");
    }
  };

  return (
    <>
      {toolsOpen ? (
        <button
          type="button"
          aria-label="Close tools menu"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px]"
          style={{ left: ACTIVITY_BAR_WIDTH_PX }}
          onClick={() => setToolsOpen(false)}
        />
      ) : null}

      <DynamicActivityToolsDrawer
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        currentSlug={currentSlug}
      />

      <aside
        className="relative z-50 flex h-full shrink-0 flex-col items-center justify-between border-r py-2"
        style={{
          width: ACTIVITY_BAR_WIDTH_PX,
          background: "#0B0F19",
          borderColor: "#1E293B",
        }}
        aria-label="Activity bar"
      >
        <div className="flex flex-col items-center gap-2">
          <Link
            href="/"
            title="Back to dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[14px] transition hover:bg-white/[0.05] omni-state-ring"
            aria-label="Back to dashboard"
          >
            ⬅️
          </Link>

          <button
            type="button"
            title="Open tools menu"
            onClick={() => setToolsOpen((o) => !o)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-[15px] transition omni-state-ring",
              toolsOpen ? "omni-accent-bg" : "hover:bg-white/[0.04]",
            )}
            aria-label="Tools menu"
          >
            🎛️
          </button>

          {showFiles ? (
            <button
              type="button"
              title="Project files"
              onClick={toggleExplorer}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition omni-state-ring",
                leftExplorerOpen ? "omni-accent-bg omni-accent-text" : "hover:bg-white/[0.04]",
              )}
              style={!leftExplorerOpen ? { color: "var(--omni-text-muted)" } : undefined}
              aria-label="Project file tree"
            >
              <FolderTree className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>
      </aside>
    </>
  );
}
