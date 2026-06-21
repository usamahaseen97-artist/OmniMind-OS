"use client";

import {
  Clock,
  Database,
  FolderTree,
  GitBranch,
  Image,
  Puzzle,
  Search,
  Webhook,
} from "lucide-react";
import { useOmniForgeShell, type ExplorerView } from "../../../../../lib/omniforge-shell-context";
import type { IdeModuleId } from "../../../../../lib/omniforge-ide-modules";

const RAIL: { id: ExplorerView | IdeModuleId; icon: typeof FolderTree; label: string; kind: "explorer" | "module" }[] = [
  { id: "tree", icon: FolderTree, label: "Explorer", kind: "explorer" },
  { id: "search", icon: Search, label: "Search", kind: "explorer" },
  { id: "git", icon: GitBranch, label: "Git", kind: "explorer" },
  { id: "recent", icon: Clock, label: "Recent", kind: "explorer" },
  { id: "assets", icon: Image, label: "Assets", kind: "explorer" },
  { id: "database", icon: Database, label: "Database", kind: "module" },
  { id: "api_tester", icon: Webhook, label: "API", kind: "module" },
  { id: "extensions", icon: Puzzle, label: "Extensions", kind: "module" },
];

/** VS-style activity rail — injected left of file explorer without changing theme. */
export function OmniForgeExplorerActivityRail() {
  const { explorerView, setExplorerView, activeIdeModule, setActiveIdeModule } = useOmniForgeShell();

  return (
    <nav className="flex w-9 shrink-0 flex-col gap-0.5 border-r border-white/[0.06] bg-[#0e1016] py-1">
      {RAIL.map((item) => {
        const active =
          item.kind === "explorer"
            ? explorerView === item.id && !activeIdeModule
            : activeIdeModule === item.id;
        return (
          <button
            key={item.id}
            type="button"
            title={item.label}
            onClick={() => {
              if (item.kind === "explorer") {
                setActiveIdeModule(null);
                setExplorerView(item.id as ExplorerView);
              } else {
                setActiveIdeModule(item.id as IdeModuleId);
              }
            }}
            className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md transition ${
              active ? "bg-indigo-500/20 text-cyan-300" : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </nav>
  );
}
