import type { ExplorerSort, ExplorerView, FileNode, SmartFolder } from "./types";
import { SMART_FOLDERS } from "./constants";
import { omniAssetManager } from "./OmniAssetManager";

/** File explorer — tree, grid, list views, smart folders, filters. */
export class OmniFileExplorer {
  view: ExplorerView = "tree";
  sort: ExplorerSort = "name";
  root: FileNode = { id: "root", name: "Workspace", type: "folder", parentId: null, assetId: null, children: [] };
  smartFolders: SmartFolder[] = SMART_FOLDERS.map((f) => ({ ...f }));

  setView(view: ExplorerView) {
    this.view = view;
    return view;
  }

  setSort(sort: ExplorerSort) {
    this.sort = sort;
    return sort;
  }

  buildTree() {
    const assets = [...omniAssetManager.assets];
    assets.sort((a, b) => {
      if (this.sort === "name") return a.name.localeCompare(b.name);
      if (this.sort === "modified") return b.modifiedAt.localeCompare(a.modifiedAt);
      if (this.sort === "size") return b.sizeBytes - a.sizeBytes;
      return a.kind.localeCompare(b.kind);
    });
    this.root.children = assets.map((a) => ({
      id: `node-${a.id}`,
      name: a.name,
      type: "file" as const,
      parentId: "root",
      assetId: a.id,
    }));
    return this.root;
  }

  pinned() {
    return omniAssetManager.assets.filter((a) => a.pinned);
  }

  /** Drag & drop architecture stub */
  onDrop(targetFolderId: string, assetIds: string[]) {
    return { targetFolderId, assetIds, accepted: true };
  }
}

export const omniFileExplorer = new OmniFileExplorer();
