"use client";

import dynamic from "next/dynamic";
import type { SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import { WidgetLoading } from "../ide/dynamic-workbench-widgets";

/**
 * Force client-only sovereign tool shell — prevents webpack/SSR from loading
 * three.js, animejs, or framer-motion during server render.
 */
export function createDynamicSovereignToolPage(slug: SovereignToolSlug, label: string) {
  return dynamic(
    () =>
      import("./SovereignToolPage").then((m) => {
        function ToolPage() {
          return <m.SovereignToolPage slug={slug} />;
        }
        return { default: ToolPage };
      }),
    {
      ssr: false,
      loading: () => (
        <div className="flex h-screen w-full items-center justify-center" style={{ background: "var(--omni-bg)" }}>
          <WidgetLoading label={label} />
        </div>
      ),
    },
  );
}

export const DynamicVFXMasterPage = createDynamicSovereignToolPage("vfx-master", "VFX Master");
export const DynamicArchitecturalDesignerPage = createDynamicSovereignToolPage(
  "architectural-designer",
  "Architectural Designer",
);
export const DynamicInteriorLandscapePage = createDynamicSovereignToolPage(
  "interior-landscape",
  "Interior & Landscape",
);
export const DynamicNasaSolverPage = createDynamicSovereignToolPage("nasa-solver", "NASA Science Solver");
export const DynamicBusinessAnalyticsPage = createDynamicSovereignToolPage(
  "business-analytics",
  "Business Analytics",
);
