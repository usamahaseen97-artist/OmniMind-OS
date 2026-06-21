"use client";

import { useEffect, useRef } from "react";
import type { DevFileTreeSlug } from "./dev-file-trees";
import { isDevFileTreeSlug } from "./dev-file-trees";
import {
  connectDevWatchBuild,
  fetchDevDiagnostics,
  initDevWorkspace,
} from "./dev-engine-api";
import { appendWorkbenchLog } from "./workbench-live-store";
import { emitDevTerminalLine } from "./dev-terminal-telemetry";

/** Boot sandbox + file-watch SSE for Group A dev tools. */
export function useDevEngineWorkbench(toolSlug: string) {
  const booted = useRef(false);

  useEffect(() => {
    if (!isDevFileTreeSlug(toolSlug)) return;

    let stopWatch: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        const init = await initDevWorkspace(toolSlug);
        if (cancelled) return;
        appendWorkbenchLog(`✓ Sandbox ready · ${init.tool_type} · ${init.files?.length ?? 0} files`);
        if (init.files?.length) {
          emitDevTerminalLine(`GET /api/dev/init-workspace 200 in 420ms`, "route");
        }
        booted.current = true;
      } catch (err) {
        appendWorkbenchLog(
          `⚠ Sandbox init: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      stopWatch = connectDevWatchBuild(toolSlug, (payload) => {
        appendWorkbenchLog(`↻ hot-reload · ${payload.path}`);
      });

      try {
        const diag = await fetchDevDiagnostics(toolSlug as DevFileTreeSlug);
        if (!cancelled) {
          for (const line of diag.terminal_lines.slice(-6)) appendWorkbenchLog(line);
        }
      } catch {
        /* diagnostics optional on boot */
      }
    })();

    return () => {
      cancelled = true;
      stopWatch?.();
    };
  }, [toolSlug]);
}
