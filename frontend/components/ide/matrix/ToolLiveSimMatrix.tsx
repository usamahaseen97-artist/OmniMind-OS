"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { WidgetLoading } from "../WidgetLoading";
import { ClientMountGate } from "../client/ClientMountGate";
import { WorkbenchLiveBinder } from "../live/WorkbenchLiveViewport";

const dyn = (loader: () => Promise<{ default: React.ComponentType<any> }>, label: string) =>
  dynamic(loader, { ssr: false, loading: () => <WidgetLoading label={label} /> });

const LiveSimAppWeb = dyn(() => import("../live/IDELiveSimViews").then((m) => ({ default: m.LiveSimAppWeb })), "omniforge preview");
const ToolLiveSimDesign = dyn(
  () => import("./live/ToolLiveSimDesign").then((m) => ({ default: m.ToolLiveSimDesign })),
  "3D scene",
);
const ToolLiveSimMedical = dyn(
  () => import("./live/ToolLiveSimMedical").then((m) => ({ default: m.ToolLiveSimMedical })),
  "clinical scan",
);
const ToolLiveSimTrading = dyn(
  () => import("./live/ToolLiveSimTrading").then((m) => ({ default: m.ToolLiveSimTrading })),
  "market charts",
);
const ToolLiveSimVideo = dyn(
  () => import("./live/ToolLiveSimVideo").then((m) => ({ default: m.ToolLiveSimVideo })),
  "video timeline",
);
const ToolLiveSimAnalytics = dyn(
  () => import("./live/ToolLiveSimAnalytics").then((m) => ({ default: m.ToolLiveSimAnalytics })),
  "analytics charts",
);
const ToolLiveSimVfx = dyn(
  () => import("./live/ToolLiveSimVfx").then((m) => ({ default: m.ToolLiveSimVfx })),
  "VFX tracks",
);
const ToolLiveSimScience = dyn(
  () => import("./live/ToolLiveSimScience").then((m) => ({ default: m.ToolLiveSimScience })),
  "science canvas",
);
const ToolLiveSimMarketing = dyn(
  () => import("./live/ToolLiveSimMarketing").then((m) => ({ default: m.ToolLiveSimMarketing })),
  "marketing billboard",
);
const ToolLiveSimGeneric = dyn(
  () => import("./live/ToolLiveSimGeneric").then((m) => ({ default: m.ToolLiveSimGeneric })),
  "live preview",
);

export function ToolLiveSimMatrix({ tool }: { tool: SovereignToolDef }): ReactNode {
  const routeId = tool.omniRouteId ?? tool.slug;

  const inner = (() => {
  switch (tool.slug) {
    case "omniforge-engine":
      return <LiveSimAppWeb />;
    case "architectural-designer":
    case "interior-landscape":
      return (
        <ToolLiveSimDesign
          mode={tool.slug === "interior-landscape" ? "interior" : "exterior"}
          toolSlug={tool.slug}
        />
      );
    case "medical-diagnostic":
      return <ToolLiveSimMedical />;
    case "quantum-trading":
      return <ToolLiveSimTrading />;
    case "creative-visionary":
      return <ToolLiveSimVideo />;
    case "business-analytics":
      return <ToolLiveSimAnalytics />;
    case "vfx-master":
      return <ToolLiveSimVfx />;
    case "nasa-solver":
      return <ToolLiveSimScience />;
    case "digital-marketing-hub":
      return <ToolLiveSimMarketing />;
    default:
      return <ToolLiveSimGeneric tool={tool} />;
  }
  })();

  return (
    <ClientMountGate label="live simulation" className="h-full min-h-0 w-full">
      <WorkbenchLiveBinder toolSlug={tool.slug} routeId={routeId}>
        {inner}
      </WorkbenchLiveBinder>
    </ClientMountGate>
  );
}
