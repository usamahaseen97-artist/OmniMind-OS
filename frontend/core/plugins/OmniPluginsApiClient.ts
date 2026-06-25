import type { OmniPlatformPlugin } from "../plugins/omnicore-platform/types";
import { apiGet, apiPost, apiPut } from "../shared/api-fetch";

const BASE = "/api/v1/omnicore/plugins";

export const omniPluginsApiClient = {
  listRegistry() {
    return apiGet<{ ok: boolean; plugins: OmniPlatformPlugin[] }>(`${BASE}/registry`);
  },
  saveRegistry(plugins: OmniPlatformPlugin[]) {
    return apiPut<{ ok: boolean }>(`${BASE}/registry`, { plugins });
  },
  browseMarketplace() {
    return apiGet<{ ok: boolean; listings: unknown[] }>(`${BASE}/marketplace`);
  },
  install(pluginId: string) {
    return apiPost<{ ok: boolean }>(`${BASE}/install`, { pluginId });
  },
  analytics(pluginId: string) {
    return apiGet<{ ok: boolean; analytics: unknown }>(`${BASE}/analytics/${pluginId}`);
  },
};
