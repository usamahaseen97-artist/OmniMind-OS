/** API contract validation — compares expected shapes against responses. */

export type ContractCheck = {
  name: string;
  path: string;
  requiredKeys: string[];
};

export type ContractResult = {
  name: string;
  ok: boolean;
  missing: string[];
};

export function validateContract(data: unknown, requiredKeys: string[]): ContractResult["missing"] {
  if (!data || typeof data !== "object") return requiredKeys;
  const obj = data as Record<string, unknown>;
  return requiredKeys.filter((k) => !(k in obj));
}

export async function checkContracts(
  baseUrl: string,
  contracts: ContractCheck[],
  fetchFn: typeof fetch = fetch,
): Promise<ContractResult[]> {
  const results: ContractResult[] = [];
  for (const c of contracts) {
    try {
      const res = await fetchFn(`${baseUrl}${c.path}`);
      const data = await res.json();
      const missing = validateContract(data, c.requiredKeys);
      results.push({ name: c.name, ok: missing.length === 0 && res.ok, missing });
    } catch {
      results.push({ name: c.name, ok: false, missing: c.requiredKeys });
    }
  }
  return results;
}

export const OMNICORE_CONTRACTS: ContractCheck[] = [
  { name: "omnicore-projects", path: "/api/v1/omnicore/projects", requiredKeys: ["ok", "projects"] },
  { name: "security-dashboard", path: "/api/v1/omnicore/security/dashboard", requiredKeys: ["ok", "dashboard"] },
  { name: "auth-health", path: "/api/v1/auth/health", requiredKeys: ["ok", "service"] },
  { name: "mission-control-dashboard", path: "/api/v1/omnicore/mission-control/dashboard", requiredKeys: ["ok", "dashboard"] },
  { name: "automation-workflows", path: "/api/v1/omnicore/automation/workflows", requiredKeys: ["ok", "workflows"] },
  { name: "omnicloud-account", path: "/api/v1/omnicore/omnicloud/account", requiredKeys: ["ok", "account"] },
  { name: "ecosystem-dashboard", path: "/api/v1/omnicore/ecosystem/dashboard", requiredKeys: ["ok", "dashboard"] },
  { name: "quality-dashboard", path: "/api/v1/omnicore/quality/dashboard", requiredKeys: ["ok", "dashboard"] },
  { name: "backend-healthz", path: "/healthz", requiredKeys: ["status"] },
];
