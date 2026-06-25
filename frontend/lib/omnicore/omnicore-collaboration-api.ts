import { omniCollaborationApiClient } from "../../core/collaboration/OmniCollaborationApiClient";
import { createLibApiBridge } from "./omnicore-http-bridge";

/** @deprecated Prefer omniCollaborationApiClient — retained for bridge backward compatibility. */
export const omnicoreCollaborationApi = createLibApiBridge(
  omniCollaborationApiClient,
  "OmniCore Collaboration API",
);
