"use client";

import { useIDE } from "../IDEProvider";
import { LiveSimulationViewport } from "../../architect/LiveSimulationViewport";
import { useStreamPreviewGateway } from "../../../hooks/useStreamPreviewGateway";

function BrowserPreviewFrame({
  url,
  title,
  srcDoc,
}: {
  url: string;
  title: string;
  srcDoc: string;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0d0e12]">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <div className="flex gap-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex-1 rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-[9px] text-zinc-500">
          {url}
        </div>
      </div>
      <iframe title={title} className="min-h-0 flex-1 border-0 bg-white" srcDoc={srcDoc} />
    </div>
  );
}

/** App & Website — iframe-style web container with HMR badge */
export function LiveSimAppWeb() {
  const { workspaceState, topTab } = useIDE();
  useStreamPreviewGateway("app-builder");

  if (topTab === "browser") {
    return (
      <BrowserPreviewFrame
        url="http://localhost:3000/preview"
        title="App preview"
        srcDoc="<!DOCTYPE html><html><body style='margin:0;font-family:system-ui;background:#0B0C10;color:#00ffcc;display:flex;align-items:center;justify-content:center;height:100vh'><div style='text-align:center'><h1>OmniMind SaaS Preview</h1><p style='color:#888'>Hot reload active</p></div></body></html>"
      />
    );
  }

  return <LiveSimulationViewport mode="app" selections={workspaceState.selections} />;
}

export function LiveSimGameDev() {
  const { workspaceState, topTab } = useIDE();
  useStreamPreviewGateway("game-dev");

  if (topTab === "browser") {
    return (
      <BrowserPreviewFrame
        url="http://localhost:3000/game-preview"
        title="Game preview"
        srcDoc="<!DOCTYPE html><html><body style='margin:0;background:#050508;color:#00ffcc;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh'><div style='text-align:center'><canvas id='c' width='320' height='180' style='border:1px solid #00ffcc33;background:#111'></canvas><p style='color:#666;margin-top:12px;font-size:12px'>Phaser · WebGL viewport</p></div></body></html>"
      />
    );
  }

  return (
    <div className="relative h-full">
      <LiveSimulationViewport mode="game" selections={workspaceState.selections} />
      <div className="absolute right-3 top-12 rounded border border-[#00ffcc]/20 bg-black/70 px-2 py-1 font-mono text-[9px] text-[#00ffcc]">
        FPS 60 · WebGL
      </div>
      <div className="absolute left-3 top-12 rounded border border-cyan-500/20 bg-black/50 px-2 py-0.5 text-[8px] text-cyan-300/80">
        player bbox · sprite nodes
      </div>
    </div>
  );
}

export function LiveSimBusinessSite() {
  const { topTab } = useIDE();
  useStreamPreviewGateway("business-site-maker");

  if (topTab === "browser") {
    return (
      <BrowserPreviewFrame
        url="https://your-business-site.com"
        title="Business site preview"
        srcDoc="<!DOCTYPE html><html><body style='margin:0;font-family:Georgia,serif;background:#fff;color:#111'><header style='padding:24px;border-bottom:1px solid #eee'><h1 style='margin:0;font-size:28px'>Your Business</h1></header><main style='padding:32px;max-width:720px;margin:0 auto'><p style='color:#666;line-height:1.6'>Corporate landing page preview — drag-and-drop sections render here.</p></main></body></html>"
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#15171e] to-[#0B0C10]">
      <div className="border-b border-white/10 p-4">
        <div className="mb-2 h-6 w-2/3 rounded bg-[#00ffcc]/20" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-lg border border-white/[0.06] bg-white/[0.03]" />
        ))}
      </div>
    </div>
  );
}
