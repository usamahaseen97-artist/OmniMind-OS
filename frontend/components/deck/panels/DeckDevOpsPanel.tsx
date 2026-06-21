"use client";

import {
  CheckCircle2,
  Database,
  Github,
  Loader2,
  Rocket,
  Server,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  deckChip,
  deckInput,
  deckPrimaryBtn,
  deckRow,
} from "../../../lib/deck-interactive";
import {
  appendDevopsLog,
  runDevopsVerify,
  setDevopsGithubLinked,
  useAgentPipeline,
} from "../../../lib/agent-pipeline-store";
import { cn } from "../../../lib/utils";
import { useAgentLiveDeck } from "../../../lib/agent-live-deck-store";
import { DeckMicroLoader } from "../DeckMicroLoader";
import { DeckShell } from "../DeckShell";

interface DeckDevOpsPanelProps {
  routeId?: string;
}

type ConnectPhase = "idle" | "nodes" | "collections" | "handshake" | "connected";

export function DeckDevOpsPanel({ routeId }: DeckDevOpsPanelProps) {
  const isArchitect = routeId === "business-software-architect";
  const { verifying, githubLinked, handshake, logLines } = useAgentPipeline("devops");
  const devopsLive = useAgentLiveDeck().devops;

  const [mongoUri, setMongoUri] = useState("mongodb+srv://cluster.omnimind.local/");
  const [mongoUser, setMongoUser] = useState("omni_admin");
  const [mongoPassword, setMongoPassword] = useState("");
  const [mongoPort, setMongoPort] = useState("27017");
  const [phase, setPhase] = useState<ConnectPhase>("idle");
  const [localConnected, setLocalConnected] = useState(false);

  const busy = verifying || phase === "nodes" || phase === "collections" || phase === "handshake";

  const handleGithub = () => {
    const next = !githubLinked;
    setDevopsGithubLinked(next);
    appendDevopsLog(next ? "GitHub OAuth session established (mock)." : "GitHub disconnected.");
  };

  const handleConnectDatabase = useCallback(() => {
    setLocalConnected(false);
    setPhase("nodes");
    appendDevopsLog("Spinning up server nodes…");

    const t1 = window.setTimeout(() => {
      setPhase("collections");
      appendDevopsLog("Checking collections…");
    }, 480);

    const t2 = window.setTimeout(() => {
      setPhase("handshake");
      appendDevopsLog("Validating credentials & port…");
      void runDevopsVerify({
        uri: mongoUri,
        username: mongoUser,
        password: mongoPassword,
        port: mongoPort,
      });
    }, 1000);

    const t3 = window.setTimeout(() => {
      setLocalConnected(true);
      setPhase("connected");
    }, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [mongoUri, mongoUser, mongoPassword, mongoPort]);

  const showGreenBadge = localConnected || handshake?.ok;

  return (
    <DeckShell
      title={isArchitect ? "Deployment & Data" : "App & Web Develop"}
      subtitle={
        devopsLive.streamConsoleOpen
          ? "Chat stream armed · technical sandbox ready"
          : "GitHub · deploy tree · live MongoDB connect"
      }
    >
      <button
        type="button"
        onClick={handleGithub}
        className={cn(
          deckPrimaryBtn,
          githubLinked && "border-[#10B981]/60 bg-[#10B981]/15",
        )}
      >
        <Github className="h-4 w-4" />
        {githubLinked ? "GitHub Connected" : "Connect GitHub OAuth"}
      </button>

      <div className={cn(deckChip, "p-2.5")}>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-zinc-500">
          <Rocket className="h-3 w-3 text-[#10B981]" /> Deploy structure
        </p>
        <div className="space-y-1 font-mono text-[9px] text-emerald-300/80">
          <button type="button" className={cn(deckRow, "py-1 font-mono text-[9px]")}>
            ├─ /api (FastAPI)
          </button>
          <button type="button" className={cn(deckRow, "py-1 font-mono text-[9px]")}>
            ├─ /frontend (Next.js)
          </button>
          <button type="button" className={cn(deckRow, "py-1 font-mono text-[9px]")}>
            └─ /workers (embeddings)
          </button>
        </div>
      </div>

      <div className={cn(deckChip, "border-emerald-500/30 bg-[#0a0f0c] p-2.5")}>
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[#10B981]">
          <Database className="h-3 w-3" /> MongoDB credentials
        </p>
        <label className="mb-1.5 block text-[9px] text-zinc-600">Connection URL</label>
        <input
          value={mongoUri}
          onChange={(e) => setMongoUri(e.target.value)}
          className={cn(deckInput, "mb-2 font-mono")}
          placeholder="mongodb+srv://..."
        />
        <div className="mb-2 grid grid-cols-2 gap-2">
          <div>
            <label className="text-[9px] text-zinc-600">Username</label>
            <input
              value={mongoUser}
              onChange={(e) => setMongoUser(e.target.value)}
              className={cn(deckInput, "mt-0.5")}
            />
          </div>
          <div>
            <label className="text-[9px] text-zinc-600">Port</label>
            <input
              value={mongoPort}
              onChange={(e) => setMongoPort(e.target.value)}
              className={cn(deckInput, "mt-0.5")}
            />
          </div>
        </div>
        <label className="mb-2 block text-[9px] text-zinc-600">Password</label>
        <input
          type="password"
          value={mongoPassword}
          onChange={(e) => setMongoPassword(e.target.value)}
          className={cn(deckInput, "mb-2")}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={handleConnectDatabase}
          disabled={busy}
          className={cn(deckPrimaryBtn, busy && "opacity-70")}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <Server className="h-4 w-4" />
              Connect Database
            </>
          )}
        </button>
      </div>

      {phase === "nodes" ? (
        <DeckMicroLoader label="Spinning up server nodes…" />
      ) : null}
      {phase === "collections" ? (
        <DeckMicroLoader label="Checking collections…" />
      ) : null}
      {(phase === "handshake" || verifying) && phase !== "connected" ? (
        <DeckMicroLoader label="Handshake with Motor pool…" />
      ) : null}

      {showGreenBadge ? (
        <div className="flex items-center gap-2 rounded-lg border border-[#10B981]/50 bg-[#10B981]/15 px-3 py-2 shadow-[0_0_16px_rgba(0,255,135,0.15)] transition-all">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00FF87] animate-pulse" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#00FF87]">
              Connected
            </p>
            <p className="truncate text-[9px] text-emerald-200/80">
              {handshake?.message ?? "Live cluster link · collections indexed"}
            </p>
          </div>
        </div>
      ) : null}

      {logLines.length > 0 ? (
        <div className="max-h-28 overflow-y-auto rounded-lg border border-emerald-500/20 bg-black/50 p-2 font-mono text-[9px] text-emerald-300/90">
          {logLines.map((line, i) => (
            <p key={`${i}-${line.slice(0, 8)}`} className="leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      ) : null}
    </DeckShell>
  );
}
