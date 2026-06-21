"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  FolderTree,
  GitBranch,
  Image,
  Search,
  ChevronsUpDown,
} from "lucide-react";
import Link from "next/link";
import { SOVEREIGN_TOOLS } from "../../../../lib/sovereign-tool-registry";
import { useIDE } from "../../IDEProvider";
import { useOmniForgeLayout } from "../../../../lib/omniforge-layout-context";
import { useOmniForgeShell } from "../../../../lib/omniforge-shell-context";
import { OmniForgeFileExplorer } from "./OmniForgeFileExplorer";
import { GlassSection, GlassIconBtn } from "./ui/GlassSection";
import { OF } from "./omniforge-theme";

const VIEWS = [
  { id: "tree" as const, icon: FolderTree, label: "Explorer" },
  { id: "search" as const, icon: Search, label: "Search" },
  { id: "assets" as const, icon: Image, label: "Assets" },
  { id: "git" as const, icon: GitBranch, label: "Git" },
  { id: "recent" as const, icon: Clock, label: "Recent" },
];

/** Project Explorer — standalone column or embedded in code workspace */
export function OmniForgeExplorerSection({ embedded = false }: { embedded?: boolean }) {
  const { projectFiles, openFile } = useIDE();
  const { openFileTab } = useOmniForgeLayout();
  const { explorerView, setExplorerView, recentFiles, pushRecentFile } = useOmniForgeShell();
  const [query, setQuery] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const devTools = useMemo(() => SOVEREIGN_TOOLS.filter((t) => t.slug === "omniforge-engine"), []);

  const assets = useMemo(
    () => projectFiles.filter((f) => !f.isFolder && /\.(png|jpg|jpeg|svg|webp|gif|ico|woff2?)$/i.test(f.path)),
    [projectFiles],
  );

  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    try {
      const re = new RegExp(query, "i");
      return projectFiles.filter(
        (f) => !f.isFolder && (re.test(f.path) || re.test(f.content ?? "")),
      );
    } catch {
      return projectFiles.filter(
        (f) => !f.isFolder && (f.path.toLowerCase().includes(q) || f.content?.toLowerCase().includes(q)),
      );
    }
  }, [projectFiles, query]);

  const codeFiles = useMemo(() => projectFiles.filter((f) => !f.isFolder), [projectFiles]);

  const openPath = (path: string) => {
    const file = projectFiles.find((f) => f.path === path && !f.isFolder);
    if (file) {
      openFile(file);
      openFileTab(path, file.path.split("/").pop());
      pushRecentFile(path);
    }
  };

  const inner = (
      <div className="flex h-full min-h-0">
        <nav className="flex w-9 shrink-0 flex-col gap-0.5 border-r p-1" style={{ borderColor: OF.glassBorder }}>
          {VIEWS.map((v) => (
            <GlassIconBtn
              key={v.id}
              title={v.label}
              active={explorerView === v.id}
              onClick={() => setExplorerView(v.id)}
            >
              <v.icon className="h-3.5 w-3.5" />
            </GlassIconBtn>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {explorerView === "tree" ? <OmniForgeFileExplorer embedded /> : null}

          {explorerView === "search" ? (
            <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-2">
              {matches.map((f) => (
                <button
                  key={f.path}
                  type="button"
                  onClick={() => openPath(f.path)}
                  className="block w-full truncate py-1 text-left font-mono text-[10px] hover:text-cyan-300"
                  style={{ color: OF.textLabel }}
                >
                  {f.path}
                </button>
              ))}
              {!matches.length ? (
                <p className="text-[9px]" style={{ color: OF.textMuted }}>
                  {query.trim() ? "No matches." : "Enter regex or text below."}
                </p>
              ) : null}
            </div>
          ) : null}

          {explorerView === "assets" ? (
            <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-2">
              {assets.map((f) => (
                <button key={f.path} type="button" onClick={() => openPath(f.path)} className="block w-full truncate py-1 font-mono text-[10px]" style={{ color: OF.textLabel }}>
                  {f.path}
                </button>
              ))}
              {!assets.length ? <p className="text-[9px]" style={{ color: OF.textMuted }}>No assets in workspace.</p> : null}
            </div>
          ) : null}

          {explorerView === "git" ? (
            <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-2">
              <p className="mb-2 text-[9px] font-semibold uppercase" style={{ color: OF.textLabel }}>Changes</p>
              {codeFiles.map((f) => (
                <p key={f.path} className="truncate font-mono text-[9px]" style={{ color: OF.cyanDim }}>
                  M {f.path}
                </p>
              ))}
              {!codeFiles.length ? <p className="text-[9px]" style={{ color: OF.textMuted }}>Clean tree.</p> : null}
            </div>
          ) : null}

          {explorerView === "recent" ? (
            <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto p-2">
              {recentFiles.map((path) => (
                <button key={path} type="button" onClick={() => openPath(path)} className="block w-full truncate py-1 text-left font-mono text-[10px]" style={{ color: OF.text }}>
                  {path.split("/").pop()}
                </button>
              ))}
              {!recentFiles.length ? <p className="text-[9px]" style={{ color: OF.textMuted }}>Open files appear here.</p> : null}
            </div>
          ) : null}

          <div className="shrink-0 border-t p-2" style={{ borderColor: OF.glassBorder }}>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (e.target.value.trim()) setExplorerView("search");
              }}
              placeholder="Search files (regex)…"
              className="w-full rounded-lg border px-2 py-1.5 font-mono text-[10px] outline-none focus:border-indigo-500/60"
              style={{ background: OF.inputBg, borderColor: OF.border, color: OF.text }}
            />
          </div>
        </div>
      </div>
  );

  if (embedded) return inner;

  return (
    <GlassSection
      title="Project Explorer"
      subtitle={`${codeFiles.length} files`}
      actions={
        <div className="relative">
          <button
            type="button"
            onClick={() => setSwitcherOpen((v) => !v)}
            className="flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[8px]"
            style={{ borderColor: OF.border, color: OF.textMuted }}
          >
            <ChevronsUpDown className="h-3 w-3" />
            Switch
          </button>
          {switcherOpen ? (
            <div
              className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border py-1 shadow-xl"
              style={{ background: OF.panelAlt, borderColor: OF.border, boxShadow: OF.shadow }}
            >
              {devTools.map((t) => (
                <Link
                  key={t.slug}
                  href={t.href}
                  className="block px-3 py-1.5 text-[10px] transition hover:bg-white/[0.05]"
                  style={{ color: OF.text }}
                  onClick={() => setSwitcherOpen(false)}
                >
                  {t.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      }
      noPad
    >
      {inner}
    </GlassSection>
  );
}
