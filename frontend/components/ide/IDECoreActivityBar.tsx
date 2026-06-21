"use client";

import Link from "next/link";
import { ArrowLeft, FolderTree, Hammer } from "lucide-react";
import { CORE_MODULES, type OmniCoreModule } from "../../lib/omnimind-ide-config";
import { useIDE } from "./IDEProvider";
import { cn } from "../../lib/utils";

const MODULE_ICONS: Record<OmniCoreModule, typeof Hammer> = {
  "omniforge-engine": Hammer,
};

export function IDECoreActivityBar() {
  const { coreModule, leftExplorerOpen, setLeftExplorerOpen } = useIDE();

  return (
    <aside className="flex w-12 shrink-0 flex-col items-center border-r border-white/[0.06] bg-[#0a0b0e] py-2">
      <Link
        href="/"
        title="Back"
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-white/[0.05] hover:text-[#00ffcc]"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>

      <p className="mb-2 px-1 text-center text-[7px] font-bold uppercase tracking-wider text-zinc-700">
        Core
      </p>

      {CORE_MODULES.map((mod) => {
        const Icon = MODULE_ICONS[mod.id];
        const active = coreModule === mod.id;
        return (
          <Link
            key={mod.id}
            href={mod.href}
            title={mod.label}
            className={cn(
              "mb-1.5 flex h-10 w-10 flex-col items-center justify-center rounded-md transition",
              active
                ? "bg-[#00ffcc]/12 text-[#00ffcc] ring-1 ring-[#00ffcc]/30"
                : "text-zinc-600 hover:bg-white/[0.04] hover:text-zinc-400",
            )}
          >
            <Icon className="h-4 w-4" />
          </Link>
        );
      })}

      <div className="flex-1" />

      <button
        type="button"
        title="Project explorer"
        onClick={() => setLeftExplorerOpen(!leftExplorerOpen)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md transition",
          leftExplorerOpen ? "bg-cyan-500/15 text-cyan-300" : "text-zinc-600 hover:text-zinc-400",
        )}
      >
        <FolderTree className="h-4 w-4" />
      </button>
    </aside>
  );
}
