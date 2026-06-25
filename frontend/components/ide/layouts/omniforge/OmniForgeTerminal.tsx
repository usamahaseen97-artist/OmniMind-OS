"use client";

import { useEffect, useRef, useState } from "react";
import { useIDE } from "../../IDEProvider";
import { executeTerminal } from "../../../../lib/omniforge-api";
import { useDevTerminalWs } from "../../../../lib/use-dev-terminal-ws";
import { useOmniForgeShell } from "../../../../lib/omniforge-shell-context";
import type { TerminalPanelTab } from "../../../../lib/omniforge-shell-context";
import { OF } from "./omniforge-theme";
import { OmniForgeProblemsPanel } from "../../../omniforge/enterprise/OmniForgeProblemsPanel";
import { OmniForgeTasksPanel } from "../../../omniforge/enterprise/OmniForgeTasksPanel";
import { OmniForgeProfilerPanel } from "../../../omniforge/enterprise/OmniForgeProfilerPanel";

const TABS: { id: TerminalPanelTab; label: string }[] = [
  { id: "terminal", label: "Terminal" },
  { id: "output", label: "Output" },
  { id: "problems", label: "Problems" },
  { id: "debug", label: "Debug Console" },
  { id: "ports", label: "Ports" },
  { id: "logs", label: "Logs" },
  { id: "tasks", label: "Tasks" },
  { id: "profiler", label: "Profiler" },
];

export function OmniForgeTerminal({ onClose }: { onClose?: () => void }) {
  const { terminalLines, appendTerminal, clearTerminal, toolSlug } = useIDE();
  const { terminalTab, setTerminalTab } = useOmniForgeShell();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);
  const { sendCommand, connected } = useDevTerminalWs(
    toolSlug === "omniforge-engine" ? "omniforge-engine" : null,
    { appendTerminal, clearTerminal },
    true,
  );

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    if (!terminalLines.length) appendTerminal("> sandbox ready · ws :8091");
  }, [appendTerminal, terminalLines.length]);

  useEffect(() => {
    const onScaffoldLog = (e: Event) => {
      const lines = (e as CustomEvent<{ lines: string[] }>).detail?.lines ?? [];
      for (const line of lines) appendTerminal(line);
    };
    window.addEventListener("omnimind:omniforge-scaffold-log", onScaffoldLog);
    return () => window.removeEventListener("omnimind:omniforge-scaffold-log", onScaffoldLog);
  }, [appendTerminal]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [terminalLines, terminalTab]);

  const runHttp = async (cmd: string) => {
    appendTerminal(`$ ${cmd}`);
    try {
      const res = await executeTerminal(cmd);
      if (res.stdout) appendTerminal(res.stdout.trimEnd());
      if (res.stderr) appendTerminal(res.stderr.trimEnd());
    } catch (err) {
      appendTerminal(err instanceof Error ? err.message : "Command failed");
    }
  };

  const submit = () => {
    const cmd = input.trim();
    if (!cmd) return;
    if (cmd === "clear" || cmd === "cls") {
      clearTerminal();
      setInput("");
      return;
    }
    if (sendCommand(cmd)) {
      setInput("");
      return;
    }
    void runHttp(cmd);
    setInput("");
  };

  const panelContent = () => {
    if (terminalTab === "ports") {
      return (
        <div className="space-y-1 p-3 text-[10px]" style={{ color: OF.textMuted }}>
          <p>8003 — FastAPI gateway</p>
          <p>8091 — Terminal WebSocket</p>
          <p>8001 — Scaffold monolith</p>
          <p>3000 — Next.js frontend</p>
        </div>
      );
    }
    if (terminalTab === "problems") {
      return <OmniForgeProblemsPanel />;
    }
    if (terminalTab === "tasks") {
      return <OmniForgeTasksPanel />;
    }
    if (terminalTab === "profiler") {
      return <OmniForgeProfilerPanel />;
    }
    if (terminalTab === "output" || terminalTab === "debug" || terminalTab === "logs") {
      return (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-[11px]">
          {terminalLines.map((line, i) => (
            <div key={`${i}-${line}`} style={{ color: line.startsWith(">") || line.includes("✓") ? OF.terminalGreen : OF.textMuted }}>
              {line}
            </div>
          ))}
        </div>
      );
    }
    return (
      <>
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-3 font-mono text-[11px]">
          {terminalLines.map((line, i) => (
            <div key={`${i}-${line}`} style={{ color: line.startsWith(">") || line.includes("✓") ? OF.terminalGreen : OF.textMuted }}>
              {line}
            </div>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2 border-t px-2 py-1.5" style={{ borderColor: OF.border }}>
          <span style={{ color: OF.cyan }}>{">"}</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Enter command…"
            className="min-w-0 flex-1 bg-transparent font-mono text-[11px] outline-none"
            style={{ color: OF.text }}
          />
        </div>
      </>
    );
  };

  return (
    <section className="flex h-full min-h-0 flex-col border-t font-mono" style={{ borderColor: OF.glassBorder, background: OF.bgDeep }}>
      <header className="flex shrink-0 items-center justify-between border-b px-2 py-1" style={{ borderColor: OF.glassBorder, background: OF.panelAlt }}>
        <div className="flex min-w-0 flex-1 gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTerminalTab(tab.id)}
              className="shrink-0 px-2.5 py-1 text-[9px] transition"
              style={{
                color: terminalTab === tab.id ? OF.text : OF.textMuted,
                borderBottom: terminalTab === tab.id ? `2px solid ${OF.cyan}` : "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="shrink-0 text-[8px]" style={{ color: connected ? OF.terminalGreen : OF.textMuted }}>
          {connected ? "WS :8091" : "HTTP"}
        </span>
        {onClose ? (
          <button type="button" onClick={onClose} className="ml-2 text-sm" style={{ color: OF.textMuted }}>
            ×
          </button>
        ) : null}
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{panelContent()}</div>
    </section>
  );
}
