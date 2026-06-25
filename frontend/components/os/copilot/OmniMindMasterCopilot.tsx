"use client";

import { useState } from "react";
import { Loader2, PanelRight, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { useOmniMindEcosystem } from "../../../lib/omnimind-ecosystem-context";
import { useOmniMindMasterAgent } from "../../../lib/omnimind-master-agent-context";
import { COPILOT_TABS, type CopilotTabId } from "../../../core/agent";
import { AgentChatConsole } from "../../ide/workspace/AgentChatConsole";
import { BrainTaskPlannerView } from "../../brain/BrainTaskPlannerView";
import { BrainThinkingPipeline } from "../../brain/BrainThinkingPipeline";
import { useOmniMindBrainOptional } from "../../../lib/omnimind-brain-context";
import { OmniMindDeployStrip } from "../../ecosystem/OmniMindDeployStrip";
import { showWorkspaceUtilityDeck } from "../../../lib/workbench-utility";
import { ProjectUtilityDeck } from "../../ide/workspace/ProjectUtilityDeck";
import { OSSectionHeader } from "../primitives/OSPanel";
import { OS_TOKENS } from "../tokens";
import { cn } from "../../../lib/utils";

type OmniMindMasterCopilotProps = {
  tool: SovereignToolDef;
  designMode?: boolean;
};

function TabBar({ active, onChange }: { active: CopilotTabId; onChange: (t: CopilotTabId) => void }) {
  return (
    <div className="flex shrink-0 gap-0.5 overflow-x-auto border-b border-white/[0.06] px-1 py-1">
      {COPILOT_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-[8px] font-semibold uppercase tracking-wide transition",
            active === tab.id
              ? "bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-500/25"
              : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function MasterIntentBar({ onSubmit }: { onSubmit: (text: string) => Promise<unknown> }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="flex shrink-0 items-center gap-1 border-b border-white/[0.06] px-2 py-1.5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!text.trim() || busy) return;
        setBusy(true);
        try {
          await onSubmit(text.trim());
          setText("");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask OmniMind anything — one AI, every tool…"
        className="min-w-0 flex-1 bg-transparent text-[10px] text-zinc-200 outline-none placeholder:text-zinc-600"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-md border border-cyan-500/30 bg-cyan-500/10 p-1 text-cyan-300 disabled:opacity-40"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      </button>
    </form>
  );
}

function TasksPanel() {
  const { tasks, retryTask } = useOmniMindMasterAgent();
  const brain = useOmniMindBrainOptional();
  const brainActions = brain?.actions ?? [];

  if (!tasks.length && !brainActions.length) {
    return (
      <div className="p-2">
        <BrainTaskPlannerView />
        <p className="p-2 text-[10px] text-zinc-500">No tasks queued. Ask OmniMind Brain anything complex.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto p-2">
      <BrainTaskPlannerView />
      {brainActions.length ? (
        <div>
          <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-zinc-500">Background</p>
          <ul className="space-y-1">
            {brainActions.map((t) => (
              <li key={t.id} className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] text-zinc-200">{t.label}</span>
                  <span className="text-[8px] uppercase text-zinc-500">{t.status}</span>
                </div>
                <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full bg-indigo-500/60 transition-all" style={{ width: `${t.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {tasks.length ? (
        <div>
          <p className="mb-1 text-[8px] font-bold uppercase tracking-wider text-zinc-500">Workflow</p>
          <ul className="space-y-1">
            {tasks.map((t) => (
              <li key={t.id} className="rounded-lg border border-white/[0.06] bg-black/20 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[10px] text-zinc-200">{t.label}</span>
                  <span className="text-[8px] uppercase text-zinc-500">{t.status}</span>
                </div>
                <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full bg-cyan-500/60 transition-all" style={{ width: `${t.progress}%` }} />
                </div>
                {t.status === "failed" ? (
                  <button type="button" onClick={() => retryTask(t.id)} className="mt-1 text-[8px] text-amber-400">
                    Retry
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MemoryPanel() {
  const { agent, pinContext } = useOmniMindMasterAgent();
  const brain = useOmniMindBrainOptional();
  const mem = agent.memory.getMemory();
  const ws = mem.workspaceMemory;
  const global = brain?.brain.globalMemory.getBrainSlice();
  const [pin, setPin] = useState("");

  return (
    <div className="space-y-2 p-2 text-[10px]">
      <div className="rounded-lg border border-white/[0.06] bg-black/20 p-2">
        <p className="font-semibold text-zinc-400">Workspace</p>
        <p className="mt-1 text-zinc-500">Tool: {ws.activeTool ?? "—"}</p>
        <p className="text-zinc-500">Project: {ws.currentProject ?? "—"}</p>
        <p className="text-zinc-500">Framework: {ws.framework ?? "—"}</p>
        <p className="text-zinc-500">Database: {ws.database ?? "—"}</p>
        {global?.deploymentTargets.length ? (
          <p className="text-zinc-500">Deploy: {global.deploymentTargets.join(", ")}</p>
        ) : null}
      </div>
      {global?.businessContext.length ? (
        <div className="rounded-lg border border-white/[0.06] bg-black/20 p-2">
          <p className="font-semibold text-zinc-400">Business context</p>
          <ul className="mt-1 space-y-0.5 text-zinc-500">
            {global.businessContext.map((b) => (
              <li key={b}>• {b}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="rounded-lg border border-white/[0.06] bg-black/20 p-2">
        <p className="mb-1 font-semibold text-zinc-400">Pinned context</p>
        {ws.pinnedContext.length ? (
          <ul className="space-y-0.5 text-zinc-500">
            {ws.pinnedContext.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        ) : (
          <p className="text-zinc-600">No pins yet</p>
        )}
        <form
          className="mt-2 flex gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (!pin.trim()) return;
            if (brain) brain.pinNote(pin.trim());
            else pinContext(pin.trim());
            setPin("");
          }}
        >
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Pin context…"
            className="min-w-0 flex-1 rounded border border-white/[0.08] bg-black/30 px-2 py-1 text-[9px] outline-none"
          />
        </form>
      </div>
    </div>
  );
}

function ProjectsPanel() {
  const { projectTabs, activeProjectTabId, setActiveProjectTabId, addProjectTab } = useOmniMindEcosystem();
  return (
    <div className="space-y-1 p-2">
      {projectTabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setActiveProjectTabId(t.id)}
          className={cn(
            "flex w-full rounded-lg border px-2 py-1.5 text-left text-[10px]",
            activeProjectTabId === t.id
              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
              : "border-white/[0.06] text-zinc-500",
          )}
        >
          {t.name}
        </button>
      ))}
      <button
        type="button"
        onClick={() => addProjectTab("New Project")}
        className="w-full rounded-lg border border-dashed border-white/[0.08] py-1.5 text-[9px] text-zinc-500"
      >
        + New project
      </button>
    </div>
  );
}

function ActionsPanel() {
  const { agent, runWorkflow } = useOmniMindMasterAgent();
  const workflows = agent.workflows.list();
  return (
    <div className="space-y-2 p-2">
      {workflows.map((wf) => (
        <button
          key={wf.id}
          type="button"
          onClick={() => void runWorkflow(wf.id, wf.description)}
          className="w-full rounded-lg border border-white/[0.06] bg-black/20 px-2 py-2 text-left hover:border-cyan-500/20"
        >
          <p className="text-[10px] font-medium text-zinc-200">{wf.name}</p>
          <p className="text-[8px] text-zinc-500">{wf.steps.length} steps · {wf.description}</p>
        </button>
      ))}
    </div>
  );
}

function HistoryPanel() {
  const eco = useOmniMindEcosystem();
  const { agent } = useOmniMindMasterAgent();
  const conv = agent.memory.getMemory().conversationMemory;
  return (
    <div className="max-h-full space-y-2 overflow-y-auto p-2">
      {eco.promptHistory.map((p) => (
        <div key={p.id} className="rounded border border-white/[0.06] px-2 py-1 text-[9px] text-zinc-500">
          {p.text}
        </div>
      ))}
      {conv.slice(0, 12).map((m, i) => (
        <div key={i} className="rounded border border-white/[0.04] px-2 py-1 text-[9px] text-zinc-600">
          <span className="text-cyan-500/70">{m.role}: </span>
          {m.text}
        </div>
      ))}
    </div>
  );
}

function SuggestionsPanel() {
  const { aiSuggestions } = useOmniMindEcosystem();
  return (
    <div className="space-y-1 p-2">
      {aiSuggestions.length ? (
        aiSuggestions.map((s) => (
          <div key={s.id} className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-[9px] text-amber-100/90">
            {s.text}
          </div>
        ))
      ) : (
        <p className="p-2 text-[10px] text-zinc-500">Suggestions appear as the Master Agent analyzes your workspace.</p>
      )}
    </div>
  );
}

function LogsPanel() {
  const { logs, agent } = useOmniMindMasterAgent();
  const all = logs.length ? logs : agent.memory.getLogs();
  return (
    <div className="max-h-full overflow-y-auto p-2 font-mono text-[8px]">
      {all.map((l) => (
        <div key={l.id} className="mb-1 text-zinc-500">
          <span className={l.level === "error" ? "text-red-400" : l.level === "success" ? "text-emerald-400" : "text-cyan-500/70"}>
            [{l.level}]
          </span>{" "}
          {l.message}
        </div>
      ))}
    </div>
  );
}

/** Master Agent copilot — tabbed orchestration panel (upgrades Phase 1 copilot). */
export function OmniMindMasterCopilot({ tool, designMode }: OmniMindMasterCopilotProps) {
  const { agentPanelOpen, setAgentPanelOpen } = useOmniMindEcosystem();
  const { copilotTab, setCopilotTab, processMessage } = useOmniMindMasterAgent();
  const routeId = tool.omniRouteId ?? tool.slug;
  const showUtility = showWorkspaceUtilityDeck(tool.slug);

  if (!agentPanelOpen) {
    return (
      <button
        type="button"
        onClick={() => setAgentPanelOpen(true)}
        className="flex w-8 shrink-0 flex-col items-center justify-center gap-1 border-l text-zinc-500 transition hover:bg-white/[0.02] hover:text-cyan-300"
        style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.panel }}
        aria-label="Open Master Agent"
      >
        <PanelRight className="h-4 w-4" />
        <Sparkles className="h-3 w-3 text-cyan-400/80" />
      </button>
    );
  }

  return (
    <motion.aside
      layout
      initial={false}
      className="flex min-h-0 shrink-0 flex-col overflow-hidden border-l"
      style={{
        borderColor: OS_TOKENS.border.subtle,
        background: OS_TOKENS.bg.panel,
        width: OS_TOKENS.layout.copilotWidth,
        minWidth: OS_TOKENS.layout.copilotMin,
        maxWidth: OS_TOKENS.layout.copilotMax,
      }}
      transition={OS_TOKENS.motion.panel}
    >
      <OSSectionHeader
        title="OmniMind Brain"
        action={
          <div className="flex items-center gap-1">
            {showUtility ? <ProjectUtilityDeck toolSlug={tool.slug} /> : null}
            <button
              type="button"
              onClick={() => setAgentPanelOpen(false)}
              className="rounded p-1 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              aria-label="Collapse copilot"
            >
              <PanelRight className="h-3.5 w-3.5" />
            </button>
          </div>
        }
      />

      <MasterIntentBar onSubmit={processMessage} />
      <BrainThinkingPipeline compact />
      <TabBar active={copilotTab} onChange={setCopilotTab} />

      <div className="min-h-0 flex-1 overflow-hidden">
        {copilotTab === "chat" ? (
          <AgentChatConsole routeId={routeId} toolSlug={tool.slug} designMode={designMode} />
        ) : null}
        {copilotTab === "tasks" ? <TasksPanel /> : null}
        {copilotTab === "memory" ? <MemoryPanel /> : null}
        {copilotTab === "projects" ? <ProjectsPanel /> : null}
        {copilotTab === "actions" ? <ActionsPanel /> : null}
        {copilotTab === "history" ? <HistoryPanel /> : null}
        {copilotTab === "deploy" ? (
          <div className="overflow-y-auto p-2">
            <OmniMindDeployStrip />
          </div>
        ) : null}
        {copilotTab === "suggestions" ? <SuggestionsPanel /> : null}
        {copilotTab === "logs" ? <LogsPanel /> : null}
      </div>
    </motion.aside>
  );
}
