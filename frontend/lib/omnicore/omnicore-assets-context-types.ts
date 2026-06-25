import type {
  AssetCollection,
  AssetSearchFilter,
  CloudSyncState,
  ExplorerView,
  OmniAsset,
  SearchIndexEntry,
  UniversalProject,
} from "../../core/assets/types";

export type OmniCoreAssetsContextSlice = {
  assetsReady: boolean;
  assetsVersion: string;
  universalProjects: UniversalProject[];
  activeUniversalProjectId: string | null;
  createProjectFromTemplate: (templateId: string, name: string) => void;
  archiveProject: (id: string) => void;
  assetList: OmniAsset[];
  assetSearch: (query: string, filter?: AssetSearchFilter) => SearchIndexEntry[];
  toggleAssetFavorite: (assetId: string) => void;
  explorerView: ExplorerView;
  setExplorerView: (view: ExplorerView) => void;
  collections: AssetCollection[];
  cloudSync: CloudSyncState;
  favoriteAssets: OmniAsset[];
};
