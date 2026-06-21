"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { ClientErrorBoundary } from "../layout/ClientErrorBoundary";
import { DynamicSovereignWorkbenchShell } from "../ide/dynamic-sovereign-shell";
import { probeBackendOnline } from "../../lib/backend-health";
import { getSovereignTool } from "../../lib/sovereign-tool-registry";

interface SovereignToolPageProps {
  slug: string;
}

export function SovereignToolPage({ slug }: SovereignToolPageProps) {
  const tool = getSovereignTool(slug);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    if (!tool) return;
    let cancelled = false;

    const check = async () => {
      const online = await probeBackendOnline();
      if (!cancelled) setApiOnline(online);
    };

    void check();
    const timer = window.setInterval(() => void check(), 5000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [tool]);

  if (!tool) {
    notFound();
  }

  return (
    <ClientErrorBoundary>
      <div className="relative h-[100dvh] max-h-[100dvh] w-full overflow-hidden">
        {apiOnline === false ? (
          <div className="absolute left-12 right-0 top-0 z-[60] flex items-center justify-center gap-2 border-b border-amber-500/25 bg-amber-950/50 px-3 py-1 text-center text-[10px] text-amber-100">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Connecting to API on port 8001… start backend:{" "}
            <code className="text-amber-200">uvicorn main:app --port 8001</code>
          </div>
        ) : null}
        <DynamicSovereignWorkbenchShell tool={tool} />
      </div>
    </ClientErrorBoundary>
  );
}
