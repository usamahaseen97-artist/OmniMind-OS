import { apiGet } from "../shared/api-fetch";

const BASE = "/api/v1/omnicore/quality";

export const omniQualityApiClient = {
  health() {
    return apiGet<{ ok: boolean; service: string }>(`${BASE}/health`);
  },
  dashboard() {
    return apiGet<{ ok: boolean; dashboard: unknown }>(`${BASE}/dashboard`);
  },
  metrics() {
    return apiGet<{ ok: boolean; metrics: unknown }>(`${BASE}/metrics`);
  },
  validateEnv() {
    return apiGet<{ ok: boolean; validation: unknown }>(`${BASE}/env/validate`);
  },
};
