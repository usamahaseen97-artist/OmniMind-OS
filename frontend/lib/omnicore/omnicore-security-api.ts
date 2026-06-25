import { omniSecurityApiClient } from "../../core/security/OmniSecurityApiClient";
import { createLibApiBridge } from "./omnicore-http-bridge";

/** @deprecated Prefer omniSecurityApiClient — retained for bridge backward compatibility. */
export const omnicoreSecurityApi = createLibApiBridge(omniSecurityApiClient, "OmniCore Security API");
