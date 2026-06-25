import { omniPluginsApiClient } from "../../core/plugins/OmniPluginsApiClient";
import { createLibApiBridge } from "./omnicore-http-bridge";

/** @deprecated Prefer omniPluginsApiClient — retained for bridge backward compatibility. */
export const omnicorePluginsApi = createLibApiBridge(omniPluginsApiClient, "OmniCore Plugins API");
