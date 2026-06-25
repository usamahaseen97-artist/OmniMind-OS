import { omniAssetsApiClient } from "../../core/assets/OmniAssetsApiClient";
import { createLibApiBridge } from "./omnicore-http-bridge";

/** @deprecated Prefer omniAssetsApiClient — retained for bridge backward compatibility. */
export const omnicoreAssetsApi = createLibApiBridge(omniAssetsApiClient, "OmniCore Assets API");
