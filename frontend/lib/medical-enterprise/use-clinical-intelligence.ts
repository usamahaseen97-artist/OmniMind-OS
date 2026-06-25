"use client";

import { useCallback, useState } from "react";
import {
  clinicalIntelligenceService,
  type ClinicalAIResponse,
  type ClinicalIntelligenceRequest,
  type ClinicalIntelligenceStreamEvent,
} from "../../core/medical-enterprise/clinical-intelligence";
import type { ClinicalRole } from "./types";

/**
 * Hook for clinical intelligence — UI-agnostic, for future panel integration.
 * Does not modify workspace components.
 */
export function useClinicalIntelligence(role: ClinicalRole = "physician") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ClinicalAIResponse | null>(null);
  const [streamEvents, setStreamEvents] = useState<ClinicalIntelligenceStreamEvent[]>([]);

  const analyze = useCallback(
    async (req: Omit<ClinicalIntelligenceRequest, "requesterRole">) => {
      setLoading(true);
      setError(null);
      try {
        const result = await clinicalIntelligenceService.analyze({ ...req, requesterRole: role });
        setResponse(result);
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Clinical intelligence failed";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [role],
  );

  const analyzeStream = useCallback(
    async (req: Omit<ClinicalIntelligenceRequest, "requesterRole">) => {
      setLoading(true);
      setError(null);
      setStreamEvents([]);
      try {
        const events: ClinicalIntelligenceStreamEvent[] = [];
        for await (const event of clinicalIntelligenceService.stream({ ...req, requesterRole: role })) {
          events.push(event);
          setStreamEvents([...events]);
          if (event.type === "complete") setResponse(event.response);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream failed";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [role],
  );

  const replay = useCallback(async (token: string) => {
    return clinicalIntelligenceService.replay(token);
  }, []);

  return {
    loading,
    error,
    response,
    streamEvents,
    analyze,
    analyzeStream,
    replay,
    agents: clinicalIntelligenceService.agents(),
  };
}
