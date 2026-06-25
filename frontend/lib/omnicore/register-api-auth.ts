import { setAccessTokenProvider } from "../../core/shared/api-fetch";
import { secureSession } from "../shared/secure-session";

setAccessTokenProvider(() => secureSession.getAccessToken());
