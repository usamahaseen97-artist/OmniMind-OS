"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Rocket } from "lucide-react";
import { OmniArchitectWizard } from "../../architect/OmniArchitectWizard";
import { ArchitectBottomChat } from "../../architect/ArchitectBottomChat";
import {
  parseArchitectChoiceFromContent,
  type ArchitectBuildMode,
  type ArchitectChoicePayload,
} from "../../../lib/architect-flow";
import { useIDE } from "../IDEProvider";
import { cn } from "../../../lib/utils";

const GUEST = "guest-founder";

function useArchitectBridge(mode: ArchitectBuildMode, routeId: string) {
  const { patchWorkspaceState, workspaceState } = useIDE();
  const [chatPayload, setChatPayload] = useState<ArchitectChoicePayload | null>(null);
  const [projectPrompt, setProjectPrompt] = useState("");
  const [deployHandler, setDeployHandler] = useState<(() => void) | null>(null);

  const onUserMessage = useCallback((text: string) => {
    const t = text.trim();
    if (t) setProjectPrompt((p) => (p ? `${p}\n${t}` : t));
  }, []);

  const onAssistantComplete = useCallback((text: string) => {
    const parsed = parseArchitectChoiceFromContent(text);
    if (parsed) setChatPayload(parsed);
  }, []);

  const registerDeploy = useCallback((ready: boolean, handler: () => void) => {
    patchWorkspaceState({ deployReady: ready });
    setDeployHandler(() => handler);
  }, [patchWorkspaceState]);

  const wizard = (
    <OmniArchitectWizard
      userId={GUEST}
      mode={mode}
      compact
      splitMode
      surface="workspace"
      externalPayload={chatPayload}
      projectPrompt={projectPrompt}
      onProjectPromptChange={setProjectPrompt}
      onRegisterDeploy={registerDeploy}
      onStateChange={patchWorkspaceState}
    />
  );

  const footer = (
    <>
      <button
        type="button"
        disabled={!workspaceState.deployReady}
        onClick={() => deployHandler?.()}
        className={cn(
          "omni-deploy-btn mb-3 flex w-full items-center justify-center gap-3 rounded-lg py-3.5 text-xs font-bold uppercase tracking-[0.12em] transition",
          !workspaceState.deployReady && "cursor-not-allowed opacity-40 grayscale",
        )}
      >
        <Rocket className="h-5 w-5" />
        Deploy to Staging
      </button>
      <div className="rounded-lg border border-white/[0.06] bg-[#0a0b0e]/80 px-3 py-2">
        <ArchitectBottomChat
          routeId={routeId}
          userId={GUEST}
          onUserMessage={onUserMessage}
          onAssistantComplete={onAssistantComplete}
        />
      </div>
    </>
  );

  return { wizard, footer };
}

export function WorkspaceAppDev() {
  const bridge = useArchitectBridge("app", "app-and-develop");
  return (
    <div className="flex h-full flex-col">
      <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {bridge.wizard}
        <ModuleExtrasApp />
      </div>
      <footer className="shrink-0 border-t border-white/[0.06] bg-[#0d0e12] px-4 py-3">{bridge.footer}</footer>
    </div>
  );
}

export function WorkspaceGameDev() {
  const bridge = useArchitectBridge("game", "game-app-architect");
  return (
    <div className="flex h-full flex-col">
      <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {bridge.wizard}
        <ModuleExtrasGame />
      </div>
      <footer className="shrink-0 border-t border-white/[0.06] bg-[#0d0e12] px-4 py-3">{bridge.footer}</footer>
    </div>
  );
}

export function WorkspaceBusinessSite() {
  const bridge = useArchitectBridge("app", "business-software-architect");
  return (
    <div className="flex h-full flex-col">
      <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {bridge.wizard}
        <ModuleExtrasBusiness />
      </div>
      <footer className="shrink-0 border-t border-white/[0.06] bg-[#0d0e12] px-4 py-3">{bridge.footer}</footer>
    </div>
  );
}

function FeatureCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-3 rounded-xl border border-white/[0.06] bg-[#0d0e12]/80 p-3">
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#00ffcc]/80">{title}</h4>
      {children}
    </section>
  );
}

function ModuleExtrasApp() {
  return (
    <>
      <FeatureCard title="Database schema">
        <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500">
          {["users", "sessions", "products", "orders"].map((t) => (
            <label key={t} className="flex items-center gap-1.5 rounded border border-white/[0.06] px-2 py-1">
              <input type="checkbox" defaultChecked className="accent-[#00ffcc]" /> {t}
            </label>
          ))}
        </div>
      </FeatureCard>
      <FeatureCard title="API routing">
        <select className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-zinc-300">
          <option>/api/v1 REST</option>
          <option>/graphql</option>
          <option>tRPC</option>
        </select>
      </FeatureCard>
      <FeatureCard title="Auth flow">
        <label className="flex items-center gap-2 text-[10px] text-zinc-400">
          <input type="checkbox" defaultChecked className="accent-[#00ffcc]" /> JWT + refresh tokens
        </label>
        <label className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
          <input type="checkbox" className="accent-[#00ffcc]" /> OAuth (Google)
        </label>
      </FeatureCard>
    </>
  );
}

function ModuleExtrasGame() {
  const engines = ["Phaser 3+", "Three.js", "Next.js", "HTML5 React"];
  return (
    <>
      <FeatureCard title="UI Framework engines">
        <div className="flex flex-wrap gap-1">
          {engines.map((e) => (
            <button
              key={e}
              type="button"
              className="rounded border px-2 py-1 text-[9px] transition hover:brightness-110 omni-accent-text"
              style={{ borderColor: "var(--omni-border)", background: "color-mix(in srgb, var(--omni-accent) 8%, var(--omni-panel))" }}
            >
              {e}
            </button>
          ))}
        </div>
      </FeatureCard>
      <FeatureCard title="Sprite asset manager">
        <div className="flex flex-wrap gap-1">
          {["player.png", "enemy.png", "tileset.png"].map((s) => (
            <span key={s} className="rounded border border-violet-500/25 bg-violet-950/30 px-2 py-0.5 text-[9px] text-violet-200">
              {s}
            </span>
          ))}
        </div>
      </FeatureCard>
      <FeatureCard title="State machine map">
        <select className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-zinc-300">
          <option>Idle → Run → Jump → Attack</option>
          <option>Menu → Play → GameOver</option>
        </select>
      </FeatureCard>
      <FeatureCard title="SFX triggers">
        <label className="flex items-center gap-2 text-[10px] text-zinc-400">
          <input type="checkbox" defaultChecked className="accent-[#00ffcc]" /> jump.wav
        </label>
        <label className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
          <input type="checkbox" defaultChecked className="accent-[#00ffcc]" /> coin pickup
        </label>
      </FeatureCard>
    </>
  );
}

function ModuleExtrasBusiness() {
  return (
    <>
      <FeatureCard title="SEO tag generator">
        <input
          placeholder="Meta title…"
          className="mb-1 w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-zinc-300"
        />
        <input
          placeholder="Meta description…"
          className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-zinc-300"
        />
      </FeatureCard>
      <FeatureCard title="Theme swapper">
        <div className="flex gap-1">
          {["Corporate", "Startup", "Agency"].map((t) => (
            <button
              key={t}
              type="button"
              className="rounded border border-white/10 px-2 py-1 text-[9px] text-zinc-400 hover:border-[#00ffcc]/30"
            >
              {t}
            </button>
          ))}
        </div>
      </FeatureCard>
      <FeatureCard title="Payment gateway">
        <label className="flex items-center gap-2 text-[10px] text-zinc-400">
          <input type="checkbox" className="accent-[#00ffcc]" /> Stripe
        </label>
        <label className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
          <input type="checkbox" className="accent-[#00ffcc]" /> PayPal
        </label>
      </FeatureCard>
    </>
  );
}
