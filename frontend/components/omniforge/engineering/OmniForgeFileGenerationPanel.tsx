"use client";

import { useMemo, useState } from "react";
import { Check, HelpCircle, RefreshCw, X } from "lucide-react";
import { useOmniForgeEngineering } from "../../../lib/omniforge-engineering-context";

export function OmniForgeFileGenerationPanel() {
  const eng = useOmniForgeEngineering();
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState("");

  const active = useMemo(
    () => eng.pendingFiles.find((f) => f.id === eng.activePendingId) ?? eng.pendingFiles[eng.pendingFiles.length - 1],
    [eng.activePendingId, eng.pendingFiles],
  );

  if (!eng.filePanelOpen || !eng.pendingFiles.length) return null;

  const showDiff = active?.previousContent != null;

  return (
    <div className="absolute bottom-10 right-[21%] z-30 w-[min(420px,38vw)] rounded-lg border border-white/10 bg-[#0e1018]/98 shadow-2xl">
      <header className="flex items-center justify-between border-b border-white/8 px-3 py-2">
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">File Generation</span>
        <span className="font-mono text-[8px] text-zinc-500">
          {eng.pendingFiles.filter((f) => f.status === "accepted").length}/{eng.pendingFiles.length}
        </span>
      </header>
      <div className="max-h-28 overflow-y-auto border-b border-white/6">
        {eng.pendingFiles.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              eng.setActivePending(f.id);
              setDraft(f.content);
              setEditMode(false);
            }}
            className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[10px] ${
              f.id === active?.id ? "bg-indigo-500/10 text-cyan-200" : "text-zinc-400 hover:bg-white/[0.03]"
            }`}
          >
            <span className="truncate font-mono">{f.path}</span>
            <span className={`ml-2 shrink-0 text-[8px] ${f.reviewScore && f.reviewScore < 70 ? "text-amber-400" : "text-emerald-400"}`}>
              {f.reviewScore ?? "—"}
            </span>
          </button>
        ))}
      </div>
      {active ? (
        <>
          <div className="max-h-36 overflow-y-auto p-2 font-mono text-[9px] leading-relaxed text-zinc-300">
            {editMode ? (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-32 w-full resize-none rounded border border-white/10 bg-black/40 p-2 text-[9px] text-zinc-200 outline-none"
              />
            ) : (
              <pre className="whitespace-pre-wrap">{showDiff ? diffPreview(active.previousContent!, active.content) : active.content.slice(0, 2400)}</pre>
            )}
          </div>
          {active.reviewIssues?.length ? (
            <div className="border-t border-white/6 px-2 py-1 text-[8px] text-amber-300/90">
              {active.reviewIssues.slice(0, 3).map((i, idx) => (
                <div key={idx}>· {i.message}</div>
              ))}
            </div>
          ) : null}
          <footer className="flex flex-wrap gap-1 border-t border-white/8 p-2">
            <ActionBtn icon={Check} label="Accept" onClick={() => eng.acceptFile(active.id)} />
            <ActionBtn icon={X} label="Reject" onClick={() => eng.rejectFile(active.id)} />
            <ActionBtn icon={RefreshCw} label="Regen" onClick={() => eng.regenerateFile(active.id)} />
            <ActionBtn
              icon={HelpCircle}
              label="Explain"
              onClick={() => eng.explainFile(active.id)}
            />
            <ActionBtn
              icon={Check}
              label={editMode ? "Save" : "Edit"}
              onClick={() => {
                if (editMode) eng.editPendingFile(active.id, draft);
                else {
                  setDraft(active.content);
                  setEditMode(true);
                }
              }}
            />
          </footer>
        </>
      ) : null}
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick }: { icon: typeof Check; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 rounded px-2 py-1 text-[8px] font-semibold uppercase tracking-wide text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
    >
      <Icon className="h-3 w-3" /> {label}
    </button>
  );
}

function diffPreview(before: string, after: string): string {
  if (before === after) return after;
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const out: string[] = ["--- previous", "+++ generated"];
  const max = Math.max(beforeLines.length, afterLines.length);
  for (let i = 0; i < max; i++) {
    const b = beforeLines[i];
    const a = afterLines[i];
    if (b === a) out.push(`  ${a ?? ""}`);
    else {
      if (b !== undefined) out.push(`- ${b}`);
      if (a !== undefined) out.push(`+ ${a}`);
    }
  }
  return out.join("\n");
}
