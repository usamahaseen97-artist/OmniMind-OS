"use client";

import { useCallback, useState } from "react";
import { GripVertical, Play, Sparkles } from "lucide-react";
import { omniCore } from "../../core/omnicore/OmniCore";
import type { WorkflowDefinition, WorkflowNode } from "../../core/automation/types";
import { cn } from "../../lib/utils";

type Props = {
  workflow: WorkflowDefinition | null;
  onWorkflowChange: (wf: WorkflowDefinition) => void;
};

export function OmniAutomationBuilder({ workflow, onWorkflowChange }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [nlPrompt, setNlPrompt] = useState("");

  const triggers = omniCore.automation.triggers.list();
  const actions = omniCore.automation.actions.list();

  const addNode = useCallback(
    (kind: WorkflowNode["kind"], extra: Partial<WorkflowNode> = {}) => {
      if (!workflow) return;
      const node: WorkflowNode = {
        id: `node-${Date.now()}`,
        kind,
        label: extra.label ?? kind,
        config: {},
        position: { x: 80 + workflow.nodes.length * 40, y: 80 + (workflow.nodes.length % 3) * 100 },
        ...extra,
      };
      const updated = { ...workflow, nodes: [...workflow.nodes, node] };
      onWorkflowChange(updated);
      omniCore.automation.builder.addNode(workflow.id, node);
    },
    [workflow, onWorkflowChange],
  );

  const onDrag = (nodeId: string, x: number, y: number) => {
    if (!workflow) return;
    omniCore.automation.builder.moveNode(workflow.id, nodeId, { x, y });
    const nodes = workflow.nodes.map((n) => (n.id === nodeId ? { ...n, position: { x, y } } : n));
    onWorkflowChange({ ...workflow, nodes });
  };

  const generateNL = async () => {
    if (!nlPrompt.trim()) return;
    const wf = await omniCore.automation.ai.generateFromNaturalLanguage(nlPrompt);
    if (wf) onWorkflowChange(wf);
  };

  if (!workflow) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        Select or create a workflow
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
        <input
          value={nlPrompt}
          onChange={(e) => setNlPrompt(e.target.value)}
          placeholder="Describe workflow in natural language…"
          className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-zinc-200"
        />
        <button
          type="button"
          onClick={() => void generateNL()}
          className="flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2 py-1.5 text-xs text-violet-200"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Generate
        </button>
        <select
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-[10px] text-zinc-300"
          onChange={(e) => {
            const t = triggers.find((x) => x.id === e.target.value);
            if (t) addNode("trigger", { label: t.label, triggerId: t.id });
            e.target.value = "";
          }}
          defaultValue=""
        >
          <option value="" disabled>
            + Trigger
          </option>
          {triggers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          className="rounded border border-white/10 bg-black/30 px-2 py-1.5 text-[10px] text-zinc-300"
          onChange={(e) => {
            const a = actions.find((x) => x.id === e.target.value);
            if (a) addNode("action", { label: a.label, actionId: a.id });
            e.target.value = "";
          }}
          defaultValue=""
        >
          <option value="" disabled>
            + Action
          </option>
          {actions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => addNode("condition", { label: "Condition" })}
          className="rounded border border-white/10 px-2 py-1.5 text-[10px] text-zinc-400"
        >
          + Branch
        </button>
        <button
          type="button"
          onClick={() => addNode("parallel", { label: "Parallel", childIds: [] })}
          className="rounded border border-white/10 px-2 py-1.5 text-[10px] text-zinc-400"
        >
          + Parallel
        </button>
        <button
          type="button"
          onClick={() => void omniCore.automation.executor.run(workflow.id, { background: true })}
          className="ml-auto flex items-center gap-1 rounded-lg bg-cyan-600/80 px-3 py-1.5 text-xs text-white"
        >
          <Play className="h-3.5 w-3.5" />
          Run
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.04)_1px,transparent_0)] bg-[length:24px_24px] p-4">
        {workflow.nodes.map((node) => (
          <div
            key={node.id}
            draggable
            onDragStart={() => setDragId(node.id)}
            onDragEnd={(e) => {
              const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
              if (rect && dragId === node.id) {
                onDrag(node.id, e.clientX - rect.left - 80, e.clientY - rect.top - 40);
              }
              setDragId(null);
            }}
            style={{ left: node.position.x, top: node.position.y }}
            className={cn(
              "absolute w-44 cursor-grab rounded-lg border px-2 py-2 shadow-lg active:cursor-grabbing",
              node.kind === "trigger" && "border-emerald-500/40 bg-emerald-500/10",
              node.kind === "action" && "border-cyan-500/40 bg-cyan-500/10",
              node.kind === "condition" && "border-amber-500/40 bg-amber-500/10",
              node.kind === "parallel" && "border-violet-500/40 bg-violet-500/10",
              node.kind === "loop" && "border-rose-500/40 bg-rose-500/10",
            )}
          >
            <div className="flex items-center gap-1">
              <GripVertical className="h-3 w-3 text-zinc-600" />
              <span className="truncate text-[10px] font-medium text-zinc-200">{node.label}</span>
            </div>
            <p className="mt-1 text-[8px] uppercase text-zinc-500">{node.kind}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
