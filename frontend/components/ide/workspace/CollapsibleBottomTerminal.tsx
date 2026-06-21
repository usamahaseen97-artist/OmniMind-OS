"use client";

import { AlertTriangle, ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback, type RefObject } from "react";
import { IDE_BOTTOM_TABS } from "../../../lib/omnimind-ide-config";
import {
  classifyTerminalLine,
  type TerminalLine,
  type DevWarning,
} from "../../../lib/dev-terminal-telemetry";
import { executeTerminal } from "../../../lib/omniforge-api";
import { useIDE } from "../IDEProvider";
import { useWorkbenchZones, toggleTerminalPanel } from "../../../lib/workbench-zone-store";
import { cn } from "../../../lib/utils";
import { DevTelemetryMetrics } from "./DevTelemetryMetrics";
import type { DevTrioSlug } from "../../../lib/dev-trio";
import { isDevFileTreeSlug } from "../../../lib/dev-file-trees";
import { useDevTerminalWs } from "../../../lib/use-dev-terminal-ws";

function lineClass(kind: TerminalLine["kind"]): string {
  return `omni-dev-terminal-line--${kind}`;
}

function TerminalBody({
  lines,
  scrollRef,
}: {
  lines: TerminalLine[];
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, scrollRef]);

  return (
    <div
      ref={scrollRef}
      className="ide-pane-scroll omni-pro-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed tracking-tight"
    >
      {lines.map((line, i) => (
        <p key={`${line.id}-${i}`} className={lineClass(line.kind)}>
          {line.text}
        </p>
      ))}
    </div>
  );
}

function WarningRail({ warnings }: { warnings: DevWarning[] }) {
  if (!warnings.length) {
    return (
      <aside className="omni-dev-warn-rail flex w-[88px] shrink-0 flex-col border-l px-2 py-2">
        <p className="mb-2 text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--omni-text-muted)" }}>
          Alerts
        </p>
        <p className="text-[9px]" style={{ color: "var(--omni-emerald)" }}>
          All clear
        </p>
      </aside>
    );
  }

  return (
    <aside className="omni-dev-warn-rail flex w-[88px] shrink-0 flex-col gap-2 border-l px-2 py-2">
      <p className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--omni-text-muted)" }}>
        Alerts
      </p>
      {warnings.map((w) => (
        <div key={w.id} className="flex flex-col gap-0.5" title={w.detail}>
          <AlertTriangle
            className="h-3.5 w-3.5"
            style={{ color: w.severity === "error" ? "var(--omni-error)" : "var(--omni-warn)" }}
          />
          <span className="text-[8px] leading-tight" style={{ color: "var(--omni-text-muted)" }}>
            {w.label}
          </span>
        </div>
      ))}
    </aside>
  );
}

/** Professional bottom terminal — live telemetry, warning rail, monospace stream */
export function CollapsibleBottomTerminal() {
  const { bottomTab, setBottomTab, terminalLines, workspaceState, appendTerminal, clearTerminal, toolSlug, projectFiles } =
    useIDE();
  const { terminalOpen } = useWorkbenchZones();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootedRef = useRef(false);

  const devSlug = isDevFileTreeSlug(toolSlug) ? (toolSlug as DevTrioSlug) : null;
  const { sendCommand, connected, status: wsStatus } = useDevTerminalWs(
    devSlug,
    { appendTerminal, clearTerminal },
    Boolean(devSlug && terminalOpen),
  );

  useEffect(() => {
    if (connected) bootedRef.current = true;
  }, [connected]);

  const runRestCommand = useCallback(
    async (cmd: string) => {
      appendTerminal(`$ ${cmd}`);
      try {
        const result = await executeTerminal(cmd);
        if (result.stdout) {
          for (const line of result.stdout.split(/\r?\n/).filter(Boolean)) appendTerminal(line);
        }
        if (result.stderr) {
          for (const line of result.stderr.split(/\r?\n/).filter(Boolean)) {
            appendTerminal(`[stderr] ${line}`);
          }
        }
        appendTerminal(result.ok ? "exit 0" : `exit ${result.code ?? 1}`);
      } catch (err) {
        appendTerminal(`terminal error: ${err instanceof Error ? err.message : String(err)}`);
      }
    },
    [appendTerminal],
  );

  useEffect(() => {
    const onLine = (e: Event) => {
      const line = (e as CustomEvent<TerminalLine>).detail;
      if (!line?.text) return;
      appendTerminal(line.text);
    };
    const onCommand = (e: Event) => {
      const cmd = (e as CustomEvent<{ command: string }>).detail?.command?.trim();
      if (!cmd) return;
      if (sendCommand(cmd)) return;
      if (cmd === "clear" || cmd === "cls") clearTerminal();
      else void runRestCommand(cmd);
    };
    window.addEventListener("omnimind:dev-terminal-line", onLine);
    window.addEventListener("omnimind:terminal-command", onCommand);
    return () => {
      window.removeEventListener("omnimind:dev-terminal-line", onLine);
      window.removeEventListener("omnimind:terminal-command", onCommand);
    };
  }, [appendTerminal, clearTerminal, runRestCommand, sendCommand]);

  const displayLines = useMemo(
    () =>
      terminalLines.map((text, i) => ({
        id: `line-${i}`,
        text,
        kind: classifyTerminalLine(text),
        ts: Date.now(),
      })),
    [terminalLines],
  );

  const warnings = useMemo((): DevWarning[] => {
    const out: DevWarning[] = [];
    const fileCount = projectFiles.filter((f) => !f.isFolder).length;
    if (fileCount === 0) {
      out.push({
        id: "no-files",
        label: "Uncompiled",
        detail: "No source files in workspace — agent scaffold pending",
        severity: "warn",
      });
    }
    if (workspaceState.loading) {
      out.push({
        id: "pipeline",
        label: "Pipeline",
        detail: "Model inference latency elevated",
        severity: "warn",
      });
    }
    return out;
  }, [projectFiles, workspaceState.loading]);

  const submit = () => {
    const cmd = input.trim();
    if (!cmd) return;
    if (sendCommand(cmd)) {
      setInput("");
      return;
    }
    if (cmd === "clear" || cmd === "cls") {
      clearTerminal();
      setInput("");
      return;
    }
    void runRestCommand(cmd);
    setInput("");
  };

  if (!terminalOpen) {
    return (
      <button
        type="button"
        onClick={() => toggleTerminalPanel()}
        className="omni-dev-terminal flex shrink-0 items-center justify-center gap-2 border-t py-1.5 font-mono text-[10px] tracking-tight"
        style={{ color: "var(--omni-amber)" }}
        aria-label="Expand terminal"
      >
        <Terminal className="h-3 w-3" />
        Terminal · {connected ? "WS live" : "HTTP"} · 8090
        <ChevronUp className="h-3 w-3 opacity-60" />
      </button>
    );
  }

  return (
    <section className="omni-dev-terminal flex h-[min(38vh,220px)] shrink-0 flex-col border-t">
      <DevTelemetryMetrics active={terminalOpen} />

      <div className="flex shrink-0 items-center border-b pr-1 omni-dev-panel-header">
        <div className="flex min-w-0 flex-1 gap-0 overflow-x-auto px-1">
          {IDE_BOTTOM_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBottomTab(tab.id)}
              className={cn(
                "shrink-0 px-3 py-1.5 font-mono text-[10px] font-medium tracking-tight transition",
                bottomTab === tab.id ? "border-b-2" : "",
              )}
              style={{
                borderBottomColor: bottomTab === tab.id ? "var(--omni-amber)" : "transparent",
                color: bottomTab === tab.id ? "var(--omni-amber)" : "var(--omni-text-muted)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => toggleTerminalPanel()}
          className="shrink-0 px-2 py-1"
          style={{ color: "var(--omni-text-muted)" }}
          aria-label="Collapse terminal"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {bottomTab === "terminal" ? (
            <>
              <TerminalBody lines={displayLines} scrollRef={scrollRef} />
              <div className="flex shrink-0 items-center border-t px-2 py-1.5 omni-dev-panel-header">
                <span
                  className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: connected ? "var(--omni-emerald)" : "var(--omni-text-muted)",
                    boxShadow: connected ? "0 0 6px var(--omni-emerald-glow)" : undefined,
                  }}
                  title={connected ? `WS ${wsStatus}` : "WebSocket offline"}
                />
                <span className="mr-2 font-mono text-xs tracking-tight" style={{ color: "var(--omni-emerald)" }}>
                  $
                </span>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder="clear · status"
                  className="min-w-0 flex-1 bg-transparent font-mono text-xs tracking-tight outline-none"
                  style={{ color: "var(--omni-text)" }}
                />
              </div>
            </>
          ) : bottomTab === "output" ? (
            <div className="p-3 font-mono text-xs tracking-tight" style={{ color: "var(--omni-text-muted)" }}>
              {workspaceState.status ?? "Build output streams after agent codegen."}
            </div>
          ) : bottomTab === "problems" ? (
            <div className="p-3 font-mono text-xs tracking-tight" style={{ color: "var(--omni-text-muted)" }}>
              {warnings.length
                ? warnings.map((w) => <p key={w.id}>⚠ {w.detail}</p>)
                : "No problems detected."}
            </div>
          ) : bottomTab === "debug" ? (
            <div className="p-3 font-mono text-xs tracking-tight" style={{ color: "var(--omni-text-muted)" }}>
              Debug console ready · attach OmniMind trace
            </div>
          ) : (
            <div className="p-3 font-mono text-xs tracking-tight" style={{ color: "var(--omni-text-muted)" }}>
              <span style={{ color: "var(--omni-emerald)" }}>3000</span> frontend ·{" "}
              <span style={{ color: "var(--omni-amber)" }}>8080</span> gateway ·{" "}
              <span style={{ color: "var(--omni-text-muted)" }}>8090 terminal</span>
            </div>
          )}
        </div>
        {bottomTab === "terminal" ? <WarningRail warnings={warnings} /> : null}
      </div>
    </section>
  );
}
