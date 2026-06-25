import { OMNICORE_ASSETS_VERSION } from "./constants";
import { omniAssetIndexer } from "./OmniAssetIndexer";
import { omniAssetManager } from "./OmniAssetManager";
import { omniBackupManager } from "./OmniBackupManager";
import { omniCloudSync } from "./OmniCloudSync";
import { omniCollections } from "./OmniCollections";
import { omniFavorites } from "./OmniFavorites";
import { omniFileExplorer } from "./OmniFileExplorer";
import { omniImportExport } from "./OmniImportExport";
import { omniLocalStorage } from "./OmniLocalStorage";
import { omniMediaLibrary } from "./OmniMediaLibrary";
import { omniPreviewEngine } from "./OmniPreviewEngine";
import { omniProjectEngine } from "./OmniProjectEngine";
import { omniRecentManager } from "./OmniRecentManager";
import { omniRecoveryManager } from "./OmniRecoveryManager";
import { omniSearchIndex } from "./OmniSearchIndex";
import { omniVersionControl } from "./OmniVersionControl";
import { omniWorkspaceStorage } from "./OmniWorkspaceStorage";
import type { AssetSearchFilter } from "./types";

/** OmniAssets — universal project, asset & storage platform facade. */
export class OmniAssets {
  readonly version = OMNICORE_ASSETS_VERSION;

  readonly projects = omniProjectEngine;
  readonly assets = omniAssetManager;
  readonly workspace = omniWorkspaceStorage;
  readonly local = omniLocalStorage;
  readonly cloud = omniCloudSync;
  readonly versions = omniVersionControl;
  readonly explorer = omniFileExplorer;
  readonly media = omniMediaLibrary;
  readonly indexer = omniAssetIndexer;
  readonly search = omniSearchIndex;
  readonly preview = omniPreviewEngine;
  readonly importExport = omniImportExport;
  readonly backup = omniBackupManager;
  readonly recovery = omniRecoveryManager;
  readonly recent = omniRecentManager;
  readonly favorites = omniFavorites;
  readonly collections = omniCollections;

  private booted = false;

  boot() {
    if (this.booted) return this;
    this.booted = true;
    this.indexer.rebuild();
    this.explorer.buildTree();
    return this;
  }

  searchAssets(query: string, filter?: AssetSearchFilter) {
    return this.search.search(query, filter);
  }

  snapshot() {
    return {
      version: this.version,
      projectCount: this.projects.projects.length,
      assetCount: this.assets.assets.length,
      indexSize: this.indexer.getIndex().length,
      cloud: this.cloud.state,
      backupCount: this.backup.backups.length,
    };
  }
}

export const omniAssets = new OmniAssets();
