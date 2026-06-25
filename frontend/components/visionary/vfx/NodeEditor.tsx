"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { NODE_TEMPLATES } from "../../../lib/visionary/vfx/constants";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function NodeEditor({ full = false }: { full?: boolean }) {
  const {
    nodes,
    connections,
    selectedNodeId,
    setSelectedNodeId,
    addNode,
    moveNode,
    connectNodes,
  } = useVisionaryVFX();
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const onNodePointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string) => {
      e.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      dragRef.current = { id: nodeId, ox: e.clientX - node.x, oy: e.clientY - node.y };
      setSelectedNodeId(nodeId);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [nodes, setSelectedNodeId],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      moveNode(dragRef.current.id, e.clientX - dragRef.current.ox, e.clientY - dragRef.current.oy);
    },
    [moveNode],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const onNodeClick = useCallback(
    (nodeId: string) => {
      if (connectFrom && connectFrom !== nodeId) {
        connectNodes(connectFrom, nodeId);
        setConnectFrom(null);
      } else {
        setConnectFrom(nodeId);
      }
    },
    [connectFrom, connectNodes],
  );

  return (
    <div className={cn("node-editor flex flex-col bg-[#0a0c10]", full ? "h-full" : "h-64")}>
      <div className="flex shrink-0 flex-wrap gap-1 border-b border-white/[0.06] p-2">
        {NODE_TEMPLATES.slice(0, 8).map((t) => (
          <button
            key={t.type}
            type="button"
            onClick={() => addNode(t.type, t.label, 120 + Math.random() * 200, 80 + Math.random() * 120)}
            className="rounded border border-white/[0.08] px-1.5 py-0.5 text-[8px] text-slate-400 hover:border-fuchsia-500/30 hover:text-fuchsia-200"
          >
            + {t.label}
          </button>
        ))}
        {connectFrom ? (
          <span className="text-[9px] text-fuchsia-400">Connect to target node…</span>
        ) : null}
      </div>
      <div
        ref={canvasRef}
        className="relative min-h-0 flex-1 overflow-auto"
        style={{
          backgroundImage: "radial-gradient(circle, #1e293b 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full min-h-[400px] min-w-[800px]">
          {connections.map((c) => {
            const from = nodes.find((n) => n.id === c.fromNodeId);
            const to = nodes.find((n) => n.id === c.toNodeId);
            if (!from || !to) return null;
            return (
              <line
                key={c.id}
                x1={from.x + 90}
                y1={from.y + 24}
                x2={to.x}
                y2={to.y + 24}
                stroke="#c084fc"
                strokeWidth={2}
                opacity={0.6}
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <div
            key={node.id}
            role="button"
            tabIndex={0}
            onPointerDown={(e) => onNodePointerDown(e, node.id)}
            onClick={() => onNodeClick(node.id)}
            className={cn(
              "absolute w-[180px] cursor-grab rounded-lg border bg-[#12161f] px-2 py-2 active:cursor-grabbing",
              selectedNodeId === node.id ? "border-fuchsia-400 shadow-lg shadow-fuchsia-500/20" : "border-white/10",
              connectFrom === node.id && "ring-2 ring-fuchsia-500/50",
            )}
            style={{ left: node.x, top: node.y }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-wider text-fuchsia-400/80">{node.type}</p>
            <p className="text-[11px] text-slate-200">{node.label}</p>
            {node.comment ? <p className="text-[8px] text-slate-600">{node.comment}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
