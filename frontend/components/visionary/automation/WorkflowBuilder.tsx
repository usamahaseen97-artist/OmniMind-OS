"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { WORKFLOW_NODE_TEMPLATES } from "../../../lib/visionary/automation/constants";
import { useVisionaryAutomation } from "../../../lib/visionary/automation-context";

export function WorkflowBuilder({ full = false }: { full?: boolean }) {
  const {
    project,
    activeWorkflow,
    setActiveWorkflowId,
    addWorkflow,
    workflowNodes,
    workflowConnections,
    selectedNodeId,
    setSelectedNodeId,
    addWorkflowNode,
    moveWorkflowNode,
    connectWorkflowNodes,
  } = useVisionaryAutomation();
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      e.stopPropagation();
      const node = workflowNodes.find((n) => n.id === id);
      if (!node) return;
      dragRef.current = { id, ox: e.clientX - node.x, oy: e.clientY - node.y };
      setSelectedNodeId(id);
    },
    [workflowNodes, setSelectedNodeId],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      moveWorkflowNode(dragRef.current.id, e.clientX - dragRef.current.ox, e.clientY - dragRef.current.oy);
    },
    [moveWorkflowNode],
  );

  return (
    <div className={cn("workflow-builder flex flex-col", full ? "h-full" : "h-64")}>
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b border-white/[0.06] p-2">
        <button type="button" onClick={() => addWorkflow("New Workflow", "manual")} className="text-[9px] text-indigo-400">+ Workflow</button>
        {project.workflows.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setActiveWorkflowId(w.id)}
            className={cn("rounded px-2 py-0.5 text-[8px]", project.activeWorkflowId === w.id ? "bg-indigo-500/15 text-indigo-200" : "text-slate-600")}
          >
            {w.name}
          </button>
        ))}
        <span className="mx-1 text-slate-700">|</span>
        {WORKFLOW_NODE_TEMPLATES.map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => addWorkflowNode(t.type, t.label, 100 + Math.random() * 200, 60 + Math.random() * 100)}
            className="rounded border border-white/[0.06] px-1 py-0.5 text-[7px] text-slate-500"
          >
            + {t.label}
          </button>
        ))}
      </div>
      <div
        className="relative min-h-0 flex-1 overflow-auto"
        style={{ backgroundImage: "radial-gradient(circle, #1e293b 1px, transparent 1px)", backgroundSize: "18px 18px" }}
        onPointerMove={onPointerMove}
        onPointerUp={() => { dragRef.current = null; }}
      >
        <svg className="pointer-events-none absolute inset-0 min-h-[360px] min-w-[700px] h-full w-full">
          {workflowConnections.map((c) => {
            const from = workflowNodes.find((n) => n.id === c.fromNodeId);
            const to = workflowNodes.find((n) => n.id === c.toNodeId);
            if (!from || !to) return null;
            return <line key={c.id} x1={from.x + 80} y1={from.y + 20} x2={to.x} y2={to.y + 20} stroke="#818cf8" strokeWidth={2} opacity={0.5} />;
          })}
        </svg>
        {workflowNodes.map((node) => (
          <div
            key={node.id}
            role="button"
            tabIndex={0}
            onPointerDown={(e) => onPointerDown(e, node.id)}
            onClick={() => {
              if (connectFrom && connectFrom !== node.id) {
                connectWorkflowNodes(connectFrom, node.id);
                setConnectFrom(null);
              } else setConnectFrom(node.id);
            }}
            className={cn(
              "absolute w-40 cursor-grab rounded-lg border bg-[#12161f] px-2 py-2 active:cursor-grabbing",
              selectedNodeId === node.id ? "border-indigo-400" : "border-white/10",
            )}
            style={{ left: node.x, top: node.y }}
          >
            <p className="text-[8px] uppercase text-indigo-400/80">{node.type}</p>
            <p className="text-[10px] text-slate-200">{node.label}</p>
          </div>
        ))}
        {activeWorkflow?.variables.length ? (
          <p className="absolute bottom-2 left-2 text-[8px] text-slate-600">Variables: {activeWorkflow.variables.map((v) => v.key).join(", ")}</p>
        ) : null}
      </div>
    </div>
  );
}
