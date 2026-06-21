"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileCode2, Folder } from "lucide-react";
import type { IDEProjectFile } from "../../lib/omnimind-ide-config";
import { useIDE } from "./IDEProvider";
import { cn } from "../../lib/utils";

type TreeNode = {
  name: string;
  path: string;
  isFolder: boolean;
  file?: IDEProjectFile;
  children: TreeNode[];
};

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  const merged = new Map<string, TreeNode>();
  for (const node of nodes) {
    const children = sortNodes(node.children);
    const existing = merged.get(node.path);
    if (!existing) {
      merged.set(node.path, { ...node, children });
      continue;
    }
    if (node.isFolder && existing.isFolder) {
      existing.children = sortNodes([...existing.children, ...children]);
    }
  }
  return Array.from(merged.values()).sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function buildTree(files: IDEProjectFile[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", isFolder: true, children: [] };
  const seenPaths = new Set<string>();

  for (const file of files) {
    if (seenPaths.has(file.path)) continue;
    seenPaths.add(file.path);

    const segments = file.path.replace(/\/$/, "").split("/").filter(Boolean);
    if (!segments.length) continue;
    let cursor = root;

    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      const folderPath = `${segments.slice(0, i + 1).join("/")}/`;

      if (isLast && file.isFolder) {
        let folder = cursor.children.find((n) => n.isFolder && n.path === folderPath);
        if (!folder) {
          folder = { name: segment, path: folderPath, isFolder: true, children: [] };
          cursor.children.push(folder);
        }
        break;
      }

      if (isLast && !file.isFolder) {
        if (!cursor.children.some((n) => !n.isFolder && n.path === file.path)) {
          cursor.children.push({
            name: segment,
            path: file.path,
            isFolder: false,
            file,
            children: [],
          });
        }
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

  return sortNodes(root.children);
}

function treeKey(node: TreeNode): string {
  return `${node.isFolder ? "d" : "f"}:${node.path}`;
}

function TreeRow({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const { selectedFile, openFile } = useIDE();
  const [open, setOpen] = useState(depth < 2);
  const active = selectedFile?.path === node.path;

  if (node.isFolder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1 rounded py-px text-left text-[10px] hover:bg-white/[0.03]"
          style={{ color: "var(--omni-text-muted)", paddingLeft: depth * 10 + 4 }}
        >
          {open ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
          <Folder className="h-3 w-3 shrink-0 opacity-70" style={{ color: "var(--omni-amber)" }} />
          <span className="truncate">{node.name}</span>
        </button>
        {open
          ? node.children.map((child) => (
              <TreeRow key={treeKey(child)} node={child} depth={depth + 1} />
            ))
          : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => node.file && openFile(node.file)}
      className={cn(
        "flex w-full items-center gap-1 rounded py-px text-left text-[10px] transition",
        active ? "omni-dev-file-active" : "hover:bg-white/[0.04]",
      )}
      style={{
        paddingLeft: depth * 10 + 16,
        ...(active ? {} : { color: "var(--omni-text-muted)" }),
      }}
    >
      <FileCode2 className="h-3 w-3 shrink-0 opacity-70" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function IDEProjectFileTree({
  compact = false,
  showExplorerHeader = false,
}: {
  compact?: boolean;
  showExplorerHeader?: boolean;
}) {
  const { projectFiles } = useIDE();
  const tree = useMemo(() => buildTree(projectFiles), [projectFiles]);
  const showHeader = showExplorerHeader || !compact;

  return (
    <div className={cn("flex h-full min-h-0 flex-col", compact ? "text-[9px]" : "")}>
      {showHeader ? (
        <div
          className="flex shrink-0 items-center gap-1 border-b px-2 py-1 text-[8px] font-bold uppercase tracking-wider"
          style={{ borderColor: "var(--omni-border)", color: "var(--omni-text-muted)" }}
        >
          <ChevronRight className="h-3 w-3" />
          Explorer
        </div>
      ) : null}
      <div className="ide-pane-scroll omni-pro-scroll min-h-0 flex-1 overflow-y-auto p-1.5">
        {tree.map((node) => (
          <TreeRow key={treeKey(node)} node={node} />
        ))}
      </div>
    </div>
  );
}
