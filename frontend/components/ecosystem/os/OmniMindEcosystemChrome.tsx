"use client";

import { usePathname } from "next/navigation";
import {
  Activity,
  Bot,
  Cpu,
  Home,
  LayoutGrid,
  ListTodo,
  Wand2,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { useEcosystemOS, type EcosystemPanel } from "../../../lib/ecosystem-os-context";
import { OmniMindHubPanel } from "./OmniMindHubPanel";
import { OmniMindActivityCenter } from "./OmniMindActivityCenter";
import { OmniMindSystemTaskManager } from "./OmniMindSystemTaskManager";
import { OmniMindAITaskCenter } from "./OmniMindAITaskCenter";
import { OmniMindUniversalSidebar } from "./OmniMindUniversalSidebar";
import { cn } from "../../../lib/utils";
import Link from "next/link";
import { shouldHideEcosystemChrome } from "../../../lib/omnimind-os-pilot";

function DockButton({
  panel,
  activePanel,
  Icon,
  label,
  onToggle,
}: {
  panel: EcosystemPanel;
  activePanel: EcosystemPanel;
  Icon: LucideIcon;
  label: string;
  onToggle: (p: EcosystemPanel) => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={() => onToggle(panel)}
      className={cn(
        "rounded-lg p-2 transition",
        activePanel === panel ? "bg-cyan-500/20 text-cyan-200" : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/** Global Enterprise Ecosystem chrome — sidebar, hub, activity center, task managers. */
export function OmniMindEcosystemChrome() {
  const pathname = usePathname() ?? "/";
  const { activePanel, togglePanel, closePanel } = useEcosystemOS();

  if (shouldHideEcosystemChrome(pathname)) {
    return null;
  }

  return (
    <>
      <OmniMindUniversalSidebar />
      <OmniMindHubPanel open={activePanel === "hub"} onClose={closePanel} />
      <OmniMindActivityCenter open={activePanel === "activity"} onClose={closePanel} />
      <OmniMindSystemTaskManager open={activePanel === "tasks"} onClose={closePanel} />
      <OmniMindAITaskCenter open={activePanel === "ai-tasks"} onClose={closePanel} />

      <div className="fixed bottom-4 right-4 z-[130] flex flex-col gap-1 rounded-xl border border-white/10 bg-[#0a0d14]/95 p-1.5 shadow-xl backdrop-blur-md">
        <Link href="/" className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-cyan-300" title="Home">
          <Home className="h-4 w-4" />
        </Link>
        <DockButton panel="hub" activePanel={activePanel} Icon={LayoutGrid} label="OmniMind Hub" onToggle={togglePanel} />
        <DockButton panel="activity" activePanel={activePanel} Icon={Activity} label="Activity Center" onToggle={togglePanel} />
        <DockButton panel="tasks" activePanel={activePanel} Icon={Cpu} label="Task Manager" onToggle={togglePanel} />
        <DockButton panel="ai-tasks" activePanel={activePanel} Icon={Bot} label="AI Task Center" onToggle={togglePanel} />
        <DockButton panel="projects" activePanel={activePanel} Icon={ListTodo} label="Projects" onToggle={togglePanel} />
        <Link href="/automation-engine" className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-amber-300" title="Automation">
          <Wand2 className="h-4 w-4" />
        </Link>
        <Link href="/mission-control" className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-cyan-300" title="Mission Control">
          <Gauge className="h-4 w-4" />
        </Link>
      </div>
    </>
  );
}
