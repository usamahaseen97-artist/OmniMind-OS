"use client";

import { useState, type ReactNode } from "react";
import {
  Compass,
  Eye,
  Film,
  HeartPulse,
  Layers,
  Map,
  Maximize2,
  Music,
  Pause,
  Play,
  TrendingUp,
  Tv,
  Video,
  Volume2,
  Zap,
} from "lucide-react";
import { WelcomePillBar } from "../chat/WelcomePillBar";
import type { UnifiedToolId } from "../../lib/unified-navigation";
import { formatToolLabel } from "../../lib/unified-navigation";
import { cn } from "../../lib/utils";

const PANEL =
  "w-full rounded-2xl border border-white/[0.04] bg-[#131317] shadow-[inset_0_1px_3px_rgba(255,255,255,0.03),0_20px_50px_rgba(0,0,0,0.6)]";

interface OmniMindToolWorkspaceProps {
  tool: UnifiedToolId;
  onPillSelect?: (label: string) => void;
  onOpenFullModule?: (tool: UnifiedToolId) => void;
  className?: string;
}

function InfrastructurePanel({ tool }: { tool: UnifiedToolId }) {
  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6 text-left font-mono text-xs")}>
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-2 text-gray-400">
        <span className="tracking-wider uppercase">{formatToolLabel(tool)} Matrix</span>
        <span className="text-[10px] text-gray-600">Active Node Cluster</span>
      </div>
      <div className="space-y-2 rounded-xl border border-white/[0.02] bg-[#18191e] p-4">
        <p className="text-[11px] text-gray-500">
          &gt;_ System environment initiated. Terminal sequence listening for inputs...
        </p>
        <div className="mt-1 h-4 w-2 animate-pulse bg-gray-500" />
      </div>
    </div>
  );
}

function OmniMusicPanel() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={cn(PANEL, "max-w-xl space-y-6 p-8 shadow-2xl")}>
      <div className="relative mx-auto h-44 w-44">
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full border border-white/[0.08] bg-[#1c1d24] shadow-2xl transition-transform duration-[4000ms]",
            isPlaying && "animate-spin",
          )}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.1] bg-[#111215]">
            <Music size={24} className="text-gray-400" />
          </div>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-medium text-white">AI Ambient Synthesizer Vector</h3>
        <p className="mt-1 font-mono text-xs text-[#70539b]">Streaming Live Engine Cluster</p>
      </div>
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/[0.03]">
        <div
          className={cn(
            "h-full bg-gray-400 transition-all",
            isPlaying ? "w-2/3 duration-[10000ms]" : "w-12",
          )}
        />
      </div>
      <div className="flex items-center justify-center gap-6">
        <Volume2 size={16} className="text-gray-500" />
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.06] bg-[#25262c] text-white shadow-md transition-all hover:scale-105"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <Maximize2 size={16} className="text-gray-500" />
      </div>
    </div>
  );
}

function OmniMoviesPanel() {
  const vaults = ["Cinema Vault Alpha", "Media Asset Beta", "Render Archive C"];
  return (
    <div className={cn(PANEL, "max-w-3xl space-y-5 p-6 shadow-xl")}>
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
        <span className="font-mono text-xs font-semibold tracking-wider text-gray-400 uppercase">
          3. OmniMovies Digital Vault
        </span>
        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">
          Stored Mode
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {vaults.map((movie) => (
          <div
            key={movie}
            className="group cursor-pointer rounded-xl border border-white/[0.03] bg-[#18191e] p-3 transition-all hover:border-white/[0.08]"
          >
            <div className="mb-2.5 flex aspect-[4/3] items-center justify-center rounded-lg bg-[#22232a] text-gray-600 transition-colors group-hover:text-gray-400">
              <Video size={20} />
            </div>
            <p className="truncate text-xs font-medium text-gray-300">{movie}</p>
            <p className="mt-0.5 font-mono text-[9px] text-gray-600">1080p Local Storage</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TranslatorPanel() {
  const [translationLang, setTranslationLang] = useState("Urdu");
  const langs = ["Urdu", "English", "Arabic"];

  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6")}>
      <div className="flex items-center justify-between font-mono text-xs text-gray-400">
        <span>Source Engine: Auto Detect</span>
        <div className="flex gap-2">
          {langs.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setTranslationLang(lang)}
              className={cn(
                "rounded px-2 py-0.5",
                translationLang === lang ? "bg-[#25262c] text-white" : "text-gray-600",
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <textarea
          placeholder="Type content here..."
          className="h-32 w-full resize-none rounded-xl border border-white/[0.03] bg-[#18191e] p-3 text-xs text-gray-300 outline-none focus:border-white/[0.08]"
        />
        <div className="h-32 w-full rounded-xl border border-white/[0.03] bg-[#1c1d24] p-3 font-mono text-xs text-gray-500">
          [Transformed OmniMind {translationLang} output will stream dynamically here...]
        </div>
      </div>
    </div>
  );
}

function MedicalPanel() {
  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6 font-mono text-xs")}>
      <div className="flex items-center gap-2 rounded-xl border border-rose-500/10 bg-rose-500/5 p-3 text-rose-400">
        <HeartPulse size={16} />
        <span className="font-semibold tracking-wide">16. Medical Diagnosis Processing Shell</span>
      </div>
      <div className="space-y-2.5 rounded-xl border border-white/[0.02] bg-[#18191e] p-4">
        <p className="text-[11px] text-gray-400">&gt; Enter physiological anomalies or metrics parameters:</p>
        <input
          type="text"
          placeholder="e.g. Chronic fatigue, core body temp analytics..."
          className="w-full rounded-lg border border-white/[0.04] bg-[#121316] p-2.5 text-gray-300 outline-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
        <div className="rounded-lg border border-white/[0.02] bg-white/[0.01] p-2.5">Status: Engine Nominal</div>
        <div className="rounded-lg border border-white/[0.02] bg-white/[0.01] p-2.5">
          Bio-Neural Mapping: Active
        </div>
      </div>
    </div>
  );
}

function QuantumTradingPanel() {
  const [tradingPair, setTradingPair] = useState("BTC/USDT");
  const bars = [30, 45, 35, 60, 55, 70, 65, 80, 95, 85, 110, 130, 120, 145];

  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-xs text-amber-400">
          <TrendingUp size={14} />
          <span>17. Quantum Matrix Asset Analysis</span>
        </div>
        <select
          value={tradingPair}
          onChange={(e) => setTradingPair(e.target.value)}
          className="rounded border border-white/[0.05] bg-[#18191e] p-1 font-mono text-[11px] text-gray-300 outline-none"
        >
          <option>BTC/USDT</option>
          <option>ETH/USDT</option>
          <option>SOL/USDT</option>
        </select>
      </div>
      <div className="flex h-28 items-end justify-between gap-1 overflow-hidden rounded-xl border border-white/[0.02] bg-[#18191e] p-2">
        {bars.map((val, i) => (
          <div
            key={i}
            style={{ height: `${val}%` }}
            className="w-full rounded-t-sm bg-gradient-to-t from-[#23242a] to-gray-500 opacity-80"
          />
        ))}
      </div>
      <div className="text-center font-mono text-[10px] tracking-widest text-gray-600 uppercase">
        Calculated Signals Processing Live for {tradingPair}
      </div>
    </div>
  );
}

function VisionaryAiPanel() {
  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6")}>
      <div className="font-mono text-xs text-gray-400">8. Visionary AI Image & Video Generation</div>
      <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-white/[0.02] bg-[#18191e] font-mono text-[11px] text-gray-600">
        <Eye size={24} />
        <span>Prompt Execution Canvas Workspace</span>
      </div>
      <input
        type="text"
        placeholder="Describe the ultra-realistic vector vision layout prompt..."
        className="w-full rounded-xl border border-white/[0.04] bg-[#18191e] p-3 text-xs text-gray-300 outline-none"
      />
    </div>
  );
}

function VfxEditorPanel() {
  const [selectedVfxEffect, setSelectedVfxEffect] = useState("Color Grade");
  const effects = ["Color Grade", "Motion Track", "Noise Filter"];

  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6 font-mono text-xs")}>
      <div className="text-gray-400">9. VFX Studio Layer Processing Engine</div>
      <div className="flex gap-2">
        {effects.map((fx) => (
          <button
            key={fx}
            type="button"
            onClick={() => setSelectedVfxEffect(fx)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[10px] transition-all",
              selectedVfxEffect === fx
                ? "border-white/20 bg-white/10 text-white shadow"
                : "border-white/[0.02] bg-transparent text-gray-500",
            )}
          >
            {fx}
          </button>
        ))}
      </div>
      <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-white/[0.05] bg-white/[0.01] text-[11px] text-gray-600">
        Drop targeted footage matrix assets here
      </div>
    </div>
  );
}

function ArchitecturalPanel() {
  const modes = ["Floor Plan AI", "3D Exterior", "Interior Texture", "Light Mesh"];
  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6")}>
      <div className="font-mono text-xs text-gray-400">10. Architectural 3D Space Vector Modeler</div>
      <div className="grid grid-cols-4 gap-2">
        {modes.map((arch) => (
          <div
            key={arch}
            className="cursor-pointer rounded-xl border border-white/[0.03] bg-[#18191e] p-4 text-center hover:bg-white/[0.01]"
          >
            <Layers size={16} className="mx-auto mb-2 text-gray-500" />
            <span className="font-mono text-[10px] text-gray-400">{arch}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketingPanel() {
  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6")}>
      <div className="font-mono text-xs text-gray-400">
        7. AI Optimization Marketing & Content Automation
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-white/[0.03] bg-[#18191e] p-3 text-xs">
          <span className="text-gray-400">TikTok Trend Keyword Cluster Analysis</span>
          <span className="font-mono text-[10px] text-emerald-400">[Optimized]</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-white/[0.03] bg-[#18191e] p-3 text-xs">
          <span className="text-gray-400">Ad Conversion Performance Simulation</span>
          <span className="font-mono text-[10px] text-[#70539b]">[Ready]</span>
        </div>
      </div>
    </div>
  );
}

function OmniTvPanel() {
  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6")}>
      <div className="font-mono text-xs text-gray-400">4. OmniTV Stored Broadcast Grid</div>
      <div className="relative flex aspect-video items-center justify-center rounded-xl border border-white/[0.05] bg-black font-mono text-xs text-gray-600">
        <Tv size={28} className="absolute opacity-20" />
        <span>Decoder Terminal Sync Clear // Data Mode Only</span>
      </div>
    </div>
  );
}

function OmniChargePanel() {
  return (
    <div className={cn(PANEL, "max-w-md space-y-4 p-6 text-center font-mono")}>
      <Zap size={28} className="mx-auto animate-pulse text-amber-400" />
      <h3 className="text-xs tracking-widest text-gray-300 uppercase">18. OmniCharge Grid Node</h3>
      <div className="flex justify-between rounded-xl border border-white/[0.02] bg-[#18191e] p-3 text-xs text-gray-400">
        <span>Core Bus Load:</span>
        <span className="text-amber-400">0.00% Sync</span>
      </div>
    </div>
  );
}

function OmniMapPanel() {
  return (
    <div className={cn(PANEL, "max-w-2xl space-y-4 p-6")}>
      <div className="flex items-center justify-between font-mono text-xs text-gray-400">
        <span>19. OmniMap Geolocation Router</span>
        <Compass size={14} className="animate-spin duration-[10000ms]" />
      </div>
      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-white/[0.02] bg-[#18191e] font-mono text-[11px] text-gray-600">
        [ GRID MAPPING LAYER ACTIVE ]
      </div>
    </div>
  );
}

const FULL_MODULE_TOOLS: UnifiedToolId[] = ["omni-music", "omni-movies", "omni-tv", "omni-charge"];

const INFRA_TOOLS: UnifiedToolId[] = [
  "omniforge-engine",
  "science-solver",
  "analytics-server",
];

/** Functional workspace controllers for all 19 OmniMind tools */
export function OmniMindToolWorkspace({
  tool,
  onPillSelect,
  onOpenFullModule,
  className,
}: OmniMindToolWorkspaceProps) {
  const showFullModule = onOpenFullModule && FULL_MODULE_TOOLS.includes(tool);

  let panel: ReactNode;
  switch (tool) {
    case "neural-chat":
      panel = (
        <div className={cn(PANEL, "space-y-6 p-8 text-center")}>
          <h2 className="text-2xl font-light tracking-wide text-gray-300">How can I help you today?</h2>
          <WelcomePillBar onSelect={(label) => onPillSelect?.(label)} />
        </div>
      );
      break;
    case "omni-music":
      panel = <OmniMusicPanel />;
      break;
    case "omni-movies":
      panel = <OmniMoviesPanel />;
      break;
    case "omni-tv":
      panel = <OmniTvPanel />;
      break;
    case "translator":
      panel = <TranslatorPanel />;
      break;
    case "medical-agent":
      panel = <MedicalPanel />;
      break;
    case "quantum-trading":
      panel = <QuantumTradingPanel />;
      break;
    case "visionary-ai":
      panel = <VisionaryAiPanel />;
      break;
    case "vfx-editor":
      panel = <VfxEditorPanel />;
      break;
    case "architectural-designer":
      panel = <ArchitecturalPanel />;
      break;
    case "marketing-tool":
      panel = <MarketingPanel />;
      break;
    case "omni-charge":
      panel = <OmniChargePanel />;
      break;
    case "omni-map":
      panel = <OmniMapPanel />;
      break;
    default:
      panel = INFRA_TOOLS.includes(tool) ? (
        <InfrastructurePanel tool={tool} />
      ) : (
        <InfrastructurePanel tool={tool} />
      );
  }

  return (
    <div className={cn("flex w-full max-w-3xl flex-col items-center justify-center", className)}>
      {panel}
      {showFullModule ? (
        <button
          type="button"
          onClick={() => onOpenFullModule(tool)}
          className="mt-4 font-mono text-[10px] tracking-wider text-gray-500 uppercase transition-colors hover:text-cyan-400"
        >
          Open full {formatToolLabel(tool)} module →
        </button>
      ) : null}
    </div>
  );
}
