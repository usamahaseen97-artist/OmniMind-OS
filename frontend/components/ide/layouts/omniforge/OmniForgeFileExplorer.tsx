"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileCode2, Folder } from "lucide-react";
import { useIDE } from "../../IDEProvider";
import { useOmniForgeLayout } from "../../../../lib/omniforge-layout-context";
import { useOmniForgeShellOptional } from "../../../../lib/omniforge-shell-context";
import type { IDEProjectFile } from "../../../../lib/omnimind-ide-config";
import { OF } from "./omniforge-theme";

type TreeNode = {
  name: string;
  path: string;
  isFolder: boolean;
  file?: IDEProjectFile;
  children: TreeNode[];
};

function buildTree(files: IDEProjectFile[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", isFolder: true, children: [] };
  for (const file of files) {
    const segments = file.path.replace(/\/$/, "").split("/").filter(Boolean);
    if (!segments.length) continue;
    let cursor = root;
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!;
      const isLast = i === segments.length - 1;
      const folderPath = `${segments.slice(0, i + 1).join("/")}/`;
      if (isLast && !file.isFolder) {
        cursor.children.push({ name: segment, path: file.path, isFolder: false, file, children: [] });
        break;
      }
      let folder = cursor.children.find((n) => n.isFolder && n.path === folderPath);
      if (!folder) {
        folder = { name: segment, path: folderPath, isFolder: true, children: [] };
        cursor.children.push(folder);
      }
      cursor = folder;
    }
  }
  const sort = (nodes: TreeNode[]): TreeNode[] =>
    [...nodes]
      .sort((a, b) => {
        if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => ({ ...n, children: sort(n.children) }));
  return sort(root.children);
}

function TreeRow({ node, depth }: { node: TreeNode; depth: number }) {
  const { selectedFile, openFile } = useIDE();
  const { openFileTab } = useOmniForgeLayout();
  const shell = useOmniForgeShellOptional();
  const [open, setOpen] = useState(depth < 2);
  const active = !node.isFolder && selectedFile?.path === node.path;

  if (node.isFolder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-1 py-0.5 text-left font-mono text-[11px] hover:bg-white/[0.04]"
          style={{ paddingLeft: depth * 12 + 8, color: OF.textLabel }}
        >
          {open ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
          <Folder className="h-3.5 w-3.5 shrink-0" style={{ color: OF.cyanDim }} />
          <span className="truncate">{node.name}</span>
        </button>
        {open ? node.children.map((c) => <TreeRow key={c.path} node={c} depth={depth + 1} />) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (node.file) {
          openFile(node.file);
          openFileTab(node.path, node.name);
          shell?.pushRecentFile(node.path);
        }
      }}
      className="flex w-full items-center gap-1.5 py-0.5 text-left font-mono text-[11px] transition"
      style={{
        paddingLeft: depth * 12 + 20,
        color: active ? OF.cyan : OF.text,
        background: active ? OF.rowActive : "transparent",
      }}
    >
      <FileCode2 className="h-3.5 w-3.5 shrink-0 opacity-70" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function OmniForgeFileExplorer({ embedded = false }: { embedded?: boolean }) {
  const { projectFiles } = useIDE();
  const tree = useMemo(() => buildTree(projectFiles), [projectFiles]);

  const body = (
    <div className="ide-pane-scroll min-h-0 flex-1 overflow-y-auto py-1">
      {tree.length ? (
        tree.map((n) => <TreeRow key={n.path} node={n} depth={0} />)
      ) : (
        <p className="px-3 py-4 text-center text-[10px] leading-relaxed" style={{ color: OF.textMuted }}>
          No files yet. Prompt the OmniMind Agent to scaffold your project.
        </p>
      )}
    </div>
  );

  if (embedded) return body;

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: OF.bg, borderRight: `1px solid ${OF.border}` }}>
      <header className="shrink-0 border-b px-3 py-2.5" style={{ borderColor: OF.border, background: OF.panelAlt }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: OF.text }}>
          File Explorer
        </p>
      </header>
      {body}
    </aside>
  );
}
