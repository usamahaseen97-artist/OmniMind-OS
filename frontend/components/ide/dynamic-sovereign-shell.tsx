"use client";

import dynamic from "next/dynamic";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { WidgetLoading } from "./dynamic-workbench-widgets";

export const DynamicSovereignWorkbenchShell = dynamic<{ tool: SovereignToolDef }>(
  () => import("./SovereignWorkbenchShell").then((m) => ({ default: m.SovereignWorkbenchShell })),
  {
    ssr: false,
    loading: () => <WidgetLoading label="workbench" />,
  },
);
