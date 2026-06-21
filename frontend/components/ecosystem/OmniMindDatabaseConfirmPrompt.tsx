"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { approveDatabase } from "../../lib/omniforge-deploy-api";
import { useOmniMindEcosystemOptional } from "../../lib/omnimind-ecosystem-context";
import { useOmniForgeShellOptional } from "../../lib/omniforge-shell-context";

type Props = {
  database: string;
  promptRoman?: string;
  scaffoldPrompt?: string;
  onApproved?: (files: { path: string; content: string; language?: string }[]) => void;
  onDismiss?: () => void;
};

/** Roman Urdu DB confirmation — "Main PostgreSQL connect kar doon? (Yes/No)" */
export function OmniMindDatabaseConfirmPrompt({
  database,
  promptRoman,
  scaffoldPrompt = "",
  onApproved,
  onDismiss,
}: Props) {
  const eco = useOmniMindEcosystemOptional();
  const shell = useOmniForgeShellOptional();
  const [loading, setLoading] = useState(false);

  const message = promptRoman ?? `Main ${database.toUpperCase()} connect kar doon? (Yes/No)`;

  const handle = async (approved: boolean) => {
    setLoading(true);
    try {
      const res = await approveDatabase(database, scaffoldPrompt, approved);
      if (approved && res.files?.length) {
        shell?.setApprovedDatabase(database);
        eco?.pushNotification(res.message ?? `${database} initialized`, "success");
        onApproved?.(res.files);
      } else {
        eco?.pushNotification("Database init skipped", "info");
        onDismiss?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="mx-4 w-full max-w-md rounded-xl border border-cyan-500/30 bg-[#12141c] p-4 shadow-2xl"
        style={{ boxShadow: "0 8px 40px rgba(34,211,238,0.12)" }}
      >
        <p className="text-[11px] font-semibold text-cyan-300">Database Agent</p>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-200">{message}</p>
        <p className="mt-1 text-[9px] text-zinc-500">Schemas & migrations run only after your approval.</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void handle(false)}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] text-zinc-400 hover:bg-white/[0.04]"
          >
            <X className="h-3.5 w-3.5" />
            No
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void handle(true)}
            className="flex items-center gap-1 rounded-lg bg-emerald-600/25 px-3 py-1.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40"
          >
            <Check className="h-3.5 w-3.5" />
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

/** Listens for architect DB events and shows confirmation modal. */
export function OmniMindDatabaseConfirmHost({
  onFiles,
}: {
  onFiles?: (files: { path: string; content: string; language?: string }[]) => void;
}) {
  const eco = useOmniMindEcosystemOptional();
  const [pending, setPending] = useState<{
    database: string;
    promptRoman: string;
  } | null>(null);

  useEffect(() => {
    const onArchitect = (e: Event) => {
      const detail = (e as CustomEvent<{
        phase?: string;
        database?: { recommended?: string };
        prompt_roman?: string;
      }>).detail;
      if (detail.phase !== "db_recommendation") return;
      const db = detail.database?.recommended;
      if (!db) return;
      setPending({
        database: db,
        promptRoman: detail.prompt_roman ?? `Main ${db.toUpperCase()} connect kar doon? (Yes/No)`,
      });
    };
    window.addEventListener("omnimind:omniforge-architect", onArchitect);
    return () => window.removeEventListener("omnimind:omniforge-architect", onArchitect);
  }, []);

  if (!pending) return null;

  return (
    <OmniMindDatabaseConfirmPrompt
      database={pending.database}
      promptRoman={pending.promptRoman}
      scaffoldPrompt={eco?.lastScaffoldPrompt ?? ""}
      onApproved={(files) => {
        onFiles?.(files);
        setPending(null);
      }}
      onDismiss={() => setPending(null)}
    />
  );
}
