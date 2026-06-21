"use client";

import { useEffect, useState } from "react";
import { OMNIFORGE_API_BASE, probeOmniforgeGateway } from "../../../../lib/omniforge-api";
import { getBackendUrl } from "../../../../lib/backend-url";
import { probeBackendOnline } from "../../../../lib/backend-health";
import { useOmniForgeWorkspaceOptional } from "../../../../lib/omniforge-workspace";
import { OF } from "./omniforge-theme";

export function OmniForgeConnectionBar() {
  const omniforge = useOmniForgeWorkspaceOptional();
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);
  const [scaffoldOk, setScaffoldOk] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      const [gw, sc] = await Promise.all([probeOmniforgeGateway(), probeBackendOnline()]);
      if (!cancelled) {
        setGatewayOk(gw);
        setScaffoldOk(sc);
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const forgeHost = OMNIFORGE_API_BASE.replace(/^https?:\/\//, "");
  const scaffoldHost = getBackendUrl().replace(/^https?:\/\//, "");

  let status = "Connecting to OmniForge services…";
  if (gatewayOk === false && scaffoldOk === false) {
    status = `Offline · run backend-fastapi on :8003 (uvicorn app.main:app) + scaffold on :8001`;
  } else if (gatewayOk === false) {
    status = `Files/Chat offline (${forgeHost}) · scaffold OK (${scaffoldHost})`;
  } else if (scaffoldOk === false) {
    status = `Scaffold offline (${scaffoldHost}) · API OK (${forgeHost})`;
  } else if (omniforge?.status === "ready") {
    status = `Live · API ${forgeHost} · scaffold ${scaffoldHost} · project ${omniforge.projectId?.slice(0, 8) ?? "—"}`;
  } else if (omniforge?.status === "error") {
    status = omniforge.error ?? "Session error";
  } else if (gatewayOk) {
    status = `API ${forgeHost} connected · establishing workspace…`;
  }

  const allLive = gatewayOk && scaffoldOk && omniforge?.status === "ready";

  return (
    <div
      className="flex h-6 shrink-0 items-center justify-between border-b px-3 font-mono text-[9px]"
      style={{ borderColor: OF.border, background: OF.bgDeep, color: OF.textMuted }}
    >
      <span style={{ color: allLive ? OF.success : gatewayOk ? OF.cyan : OF.warn }}>{status}</span>
      <span style={{ color: OF.textLabel }}>
        {allLive ? "READY" : "OMNI WEB DEVELOPMENT"}
      </span>
    </div>
  );
}
