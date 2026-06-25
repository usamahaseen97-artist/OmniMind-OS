"use client";

import { useCallback, useState } from "react";
import { medicalMultiAgentPlatform } from "@/core/medical-enterprise/multi-agent";
import type { MultiAgentResponse, MultiAgentId } from "@/core/medical-enterprise/multi-agent/types";
import type { ClinicalRole } from "@/lib/medical-enterprise/types";

/** Hook for multi-agent intelligence platform — UI-agnostic */
export function useMedicalMultiAgent(role: ClinicalRole = "physician") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<MultiAgentResponse | null>(null);

  const run = useCallback(
    async (patientId: string, agentIds?: MultiAgentId[]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await medicalMultiAgentPlatform.run({ patientId, agentIds }, role);
        setResponse(result);
        return result;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Multi-agent run failed");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [role],
  );

  const agents = medicalMultiAgentPlatform.agents(role);

  return { loading, error, response, run, agents, replay: medicalMultiAgentPlatform.replay };
}
