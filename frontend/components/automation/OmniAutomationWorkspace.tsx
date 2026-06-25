"use client";

import { useEffect, useState } from "react";
import { BookTemplate, LayoutDashboard, Plus, Wand2 } from "lucide-react";
import { omniCore } from "../../core/omnicore/OmniCore";
import type { WorkflowDefinition } from "../../core/automation/types";
import { OmniAutomationBuilder } from "./OmniAutomationBuilder";
import { OmniAutomationDashboard } from "./OmniAutomationDashboard";
import { cn } from "../../lib/utils";

type Tab = "builder" | "dashboard" | "library";

export function OmniAutomationWorkspace() {
  const [tab, setTab] = useState<Tab>("builder");
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [active, setActive] = useState<WorkflowDefinition | null>(null);
  const [suggestions, setSuggestions] = useState<Awaited<ReturnType<typeof omniCore.automation.ai.suggest>>>([]);

  useEffect(() => {
    void omniCore.automation.boot().then(() => {
      setWorkflows(omniCore.automation.builder.list());
      void omniCore.automation.ai.suggest().then(setSuggestions);
    });
  }, []);

  const createBlank = () => {
    const wf = omniCore.automation.builder.create({
      name: "New Workflow",
      description: "",
      nodes: [
        {
          id: "trigger-1",
          kind: "trigger",
          triggerId: "manual",
          label: "Manual",
          config: {},
          position: { x: 60, y: 100 },
        },
      ],
      templateId: null,
      nestedWorkflowIds: [],
      schedule: null,
      enabled: true,
      tags: [],
    });
    setWorkflows(omniCore.automation.builder.list());
    setActive(wf);
    setTab("builder");
  };

  const instantiate = (templateId: string) => {
    const wf = omniCore.automation.ai.oneClickAutomate(templateId);
    setWorkflows(omniCore.automation.builder.list());
    setActive(wf);
    setTab("builder");
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#07090f] text-zinc-100">
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
        <Wand2 className="h-5 w-5 text-cyan-400" />
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-semibold">Universal Automation Engine</h1>
          <p className="text-[10px] text-zinc-500">OmniMind V2.0 — AI-native workflows</p>
        </div>
        <nav className="flex gap-1">
          {(
            [
              ["builder", "Builder", LayoutDashboard],
              ["dashboard", "Monitor", LayoutDashboard],
              ["library", "Library", BookTemplate],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px]",
                tab === id ? "bg-cyan-500/20 text-cyan-200" : "text-zinc-500 hover:bg-white/5",
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={createBlank}
          className="flex items-center gap-1 rounded-lg border border-cyan-500/30 px-2 py-1.5 text-[10px] text-cyan-200"
        >
          <Plus className="h-3 w-3" />
          New
        </button>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="w-52 shrink-0 border-r border-white/10 p-2">
          <p className="mb-2 px-2 text-[9px] uppercase text-zinc-600">Workflows</p>
          <ul className="space-y-1">
            {workflows.map((wf) => (
              <li key={wf.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActive(wf);
                    setTab("builder");
                  }}
                  className={cn(
                    "w-full truncate rounded px-2 py-1.5 text-left text-xs",
                    active?.id === wf.id ? "bg-white/10 text-zinc-100" : "text-zinc-500 hover:bg-white/5",
                  )}
                >
                  {wf.name}
                </button>
              </li>
            ))}
          </ul>
          {suggestions.length ? (
            <>
              <p className="mb-2 mt-4 px-2 text-[9px] uppercase text-violet-400/80">AI suggests</p>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => s.templateId && instantiate(s.templateId)}
                  className="mb-1 w-full rounded border border-violet-500/20 bg-violet-500/5 px-2 py-1.5 text-left text-[10px] text-zinc-400 hover:bg-violet-500/10"
                >
                  {s.title}
                </button>
              ))}
            </>
          ) : null}
        </aside>

        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {tab === "builder" ? (
            <OmniAutomationBuilder
              workflow={active}
              onWorkflowChange={(wf) => {
                setActive(wf);
                setWorkflows(omniCore.automation.builder.list());
              }}
            />
          ) : null}
          {tab === "dashboard" ? <OmniAutomationDashboard /> : null}
          {tab === "library" ? (
            <div className="history-scroll-hover grid gap-3 overflow-y-auto p-4 md:grid-cols-2 lg:grid-cols-3">
              {omniCore.automation.library.templates().map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => instantiate(tpl.id)}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left hover:border-cyan-500/30"
                >
                  <p className="text-sm font-medium text-zinc-200">{tpl.name}</p>
                  <p className="mt-1 text-[10px] text-zinc-500">{tpl.description}</p>
                  <p className="mt-2 text-[9px] uppercase text-cyan-500/80">{tpl.category}</p>
                </button>
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
