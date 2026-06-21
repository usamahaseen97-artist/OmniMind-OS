"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getBackendUrl } from "../../lib/backend-url";

const TOOLS_REGISTRY = [
  "Neural_Chatbot",
  "OmniMusic",
  "OmniMovies",
  "OmniTV",
  "OmniMap",
  "Translator",
  "ThemeHub",
  "Marketing",
  "Visionary_AI",
  "VFX_Editor",
  "Architect",
  "App_Builder",
  "Game_Dev",
  "Web_Builder",
  "NASA_Solver",
  "Business_Analytics",
  "Medical_Diagnostic",
  "Quantum_Trading",
  "Omni_Charger",
] as const;

type ToolId = (typeof TOOLS_REGISTRY)[number];

/** Maps UI tool ids to `/api/v1/omnimind/execute` tool_name aliases. */
const TOOL_API_NAME: Record<ToolId, string> = {
  Neural_Chatbot: "neural_chatbot",
  OmniMusic: "music",
  OmniMovies: "omnimovies",
  OmniTV: "omnitv",
  OmniMap: "omnimap",
  Translator: "translator",
  ThemeHub: "themehub",
  Marketing: "marketing",
  Visionary_AI: "visionary_ai",
  VFX_Editor: "vfx_editor",
  Architect: "architect",
  App_Builder: "app_builder",
  Game_Dev: "game_dev",
  Web_Builder: "web_builder",
  NASA_Solver: "nasa_solver",
  Business_Analytics: "business_analytics",
  Medical_Diagnostic: "medical_diagnostic",
  Quantum_Trading: "quantum_trading",
  Omni_Charger: "omni_charger",
};

type TerminalLine = {
  id: string;
  tone: "muted" | "info" | "success" | "payload" | "error";
  text: string;
};

function toolLabel(id: ToolId): string {
  return id.replace(/_/g, " ");
}

function toneClass(tone: TerminalLine["tone"]): string {
  switch (tone) {
    case "info":
      return "text-white font-black";
    case "success":
      return "text-cyan-400 pl-2";
    case "payload":
      return "text-amber-400 font-mono pl-2 break-all";
    case "error":
      return "text-rose-500 font-bold";
    default:
      return "text-zinc-600 italic";
  }
}

interface OmniMindMultiAgentChassisProps {
  userIdentity?: string;
}

export function OmniMindMultiAgentChassis({
  userIdentity = "Usama",
}: OmniMindMultiAgentChassisProps) {
  const [selectedTool, setSelectedTool] = useState<ToolId>("Neural_Chatbot");
  const [prompt, setPrompt] = useState(
    "Generate production data arrays for business performance tracking vectors.",
  );
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: "boot",
      tone: "muted",
      text: "OmniMind V11 Central Command: Architecture deployed successfully. Select any agent node to execute low-latency pipelines.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const appendLine = useCallback((tone: TerminalLine["tone"], text: string) => {
    setLines((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, tone, text }]);
  }, []);

  const dispatchAutonomousAgentCall = useCallback(async () => {
    const queryVal = prompt.trim();
    if (!queryVal || busy) return;

    setBusy(true);
    appendLine("info", `▶️ Handshake Dispatched -> Agent: [${toolLabel(selectedTool)}]`);

    try {
      const apiTool = TOOL_API_NAME[selectedTool];
      const url = `${getBackendUrl()}/api/v1/omnimind/execute?tool_name=${encodeURIComponent(apiTool)}&query=${encodeURIComponent(queryVal)}&user_identity=${encodeURIComponent(userIdentity)}`;
      const response = await fetch(url);
      const data = (await response.json()) as {
        status?: string;
        source?: string;
        payload?: Record<string, unknown>;
      };

      if (data.status === "success" && data.payload) {
        const p = data.payload;
        const engine = typeof p.engine === "string" ? p.engine : "V11 Cloud Pipeline";
        appendLine("success", `⚡ ${engine} (${data.source ?? "live"})`);

        if (typeof p.response_text === "string") {
          appendLine("payload", p.response_text.slice(0, 1200));
        }
        if (typeof p.image_url === "string") {
          appendLine("payload", `🖼 Image: ${p.image_url}`);
        }
        if (typeof p.media_url === "string" || typeof p.image_ad_url === "string") {
          appendLine("payload", `📢 Ad asset: ${(p.media_url ?? p.image_ad_url) as string}`);
        }
        if (typeof p.audio_node_url === "string") {
          appendLine("payload", `🎵 Audio: ${p.audio_node_url}`);
        }
        if (typeof p.cover_art_url === "string") {
          appendLine("payload", `🎨 Cover: ${p.cover_art_url}`);
        }
        if (typeof p.assistant_reply === "string") {
          appendLine("payload", `📈 Trading: ${p.assistant_reply}`);
        }
        if (Array.isArray(p.investment_guidance)) {
          p.investment_guidance.slice(0, 3).forEach((g: { symbol?: string; action?: string }) => {
            appendLine("info", `→ ${g.symbol ?? "?"}: ${g.action ?? "WATCH"}`);
          });
        }
        if (p.summary && typeof p.summary === "string") {
          appendLine("info", `Medical: ${p.summary}`);
        }
        if (!p.response_text && !p.image_url && !p.media_url) {
          appendLine("payload", `✔️ ${JSON.stringify(p).slice(0, 900)}`);
        }
      } else {
        appendLine("error", "✕ Tool execution returned an unexpected response shape.");
      }
    } catch {
      appendLine(
        "error",
        "✕ Local Node Connection Offline. Please check if your Uvicorn/FastAPI backend server is listening.",
      );
    } finally {
      setBusy(false);
    }
  }, [appendLine, busy, prompt, selectedTool, userIdentity]);

  return (
    <div
      className="max-w-7xl mx-auto my-6 p-4 md:p-8 bg-[#030712] border border-zinc-900 rounded-[36px] text-zinc-100 antialiased font-sans"
      id="omnimind-chassis"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-zinc-950/80 p-6 rounded-2xl border border-zinc-800/60 mb-6 shadow-2xl">
        <div>
          <h1 className="text-xl font-black tracking-widest text-white uppercase flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-amber-500 relative" />
            OmniMind V11 Multi-Agent Engine
          </h1>
          <p className="text-[11px] text-zinc-400 mt-1">
            Autonomous, zero-cost architecture unifying all 19 tools under open-source compilation
            matrices flawlessly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[9px] font-mono font-black uppercase tracking-wider">
          <span className="bg-zinc-900 border border-zinc-800 text-amber-400 px-3 py-1 rounded-md">
            Gemini + DALL-E Cloud
          </span>
          <span className="bg-zinc-900 border border-zinc-800 text-emerald-400 px-3 py-1 rounded-md">
            Pollinations CDN
          </span>
          <span className="bg-zinc-900 border border-zinc-800 text-cyan-400 px-3 py-1 rounded-md">
            CCXT Market Feed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-zinc-950/40 p-4 rounded-2xl border border-zinc-900/80 space-y-2">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-black px-2 mb-2">
            Available System Engines
          </div>
          <div className="grid grid-cols-2 gap-2" id="tool-matrix-grid-hook">
            {TOOLS_REGISTRY.map((tool) => {
              const active = tool === selectedTool;
              return (
                <button
                  key={tool}
                  type="button"
                  id={`btn-${tool.toLowerCase()}`}
                  onClick={() => setSelectedTool(tool)}
                  className={
                    active
                      ? "text-left text-[11px] px-3 py-2.5 rounded-xl font-black border transition-all uppercase tracking-tight bg-amber-500 text-black border-amber-500 shadow-lg"
                      : "text-left text-[11px] px-3 py-2.5 rounded-xl font-bold border transition-all uppercase tracking-tight bg-zinc-900/50 text-zinc-400 border-zinc-800/60 hover:bg-zinc-800 hover:text-white"
                  }
                >
                  {toolLabel(tool)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 md:p-6 flex flex-col justify-between min-h-[480px]">
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-3 flex justify-between items-center gap-2">
              <h3
                className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center gap-2"
                id="active-tool-title-display"
              >
                🚀 Active Engine: {toolLabel(selectedTool)}
              </h3>
              <span className="text-[9px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                State: {busy ? "Executing" : "Ready"}
              </span>
            </div>

            <div
              ref={terminalRef}
              id="v11-terminal-stream"
              className="bg-black/80 rounded-xl p-4 h-64 overflow-y-auto text-xs font-mono text-zinc-400 space-y-2 border border-zinc-900 shadow-inner"
            >
              {lines.map((line) => (
                <p key={line.id} className={toneClass(line.tone)}>
                  {line.text}
                </p>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                id="v11-system-prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void dispatchAutonomousAgentCall();
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                placeholder="Inject localized prompt parameters..."
              />
              <button
                type="button"
                onClick={() => void dispatchAutonomousAgentCall()}
                disabled={busy}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-black font-black text-xs px-6 py-3 rounded-xl tracking-wider uppercase transition-all whitespace-nowrap"
              >
                Execute Pipeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
