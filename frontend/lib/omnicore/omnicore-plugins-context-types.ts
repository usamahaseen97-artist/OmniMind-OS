import type { MarketplaceListing, OmniPlatformPlugin, OmniPluginType } from "../../core/plugins/omnicore-platform/types";

export type OmniCorePluginsContextSlice = {
  pluginsReady: boolean;
  pluginsVersion: string;
  extensionPlugins: OmniPlatformPlugin[];
  marketplaceListings: MarketplaceListing[];
  installExtension: (pluginId: string) => Promise<{ ok: boolean }>;
  enableExtension: (pluginId: string) => void;
  disableExtension: (pluginId: string) => void;
  browseMarketplace: (category?: string, type?: OmniPluginType) => { listing: MarketplaceListing; plugin: OmniPlatformPlugin | null }[];
};
