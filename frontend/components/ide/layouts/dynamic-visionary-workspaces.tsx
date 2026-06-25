"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { WidgetLoading } from "../WidgetLoading";

const loading = (label: string) => () => <WidgetLoading label={label} />;

export const DynamicVideoEditorWorkspace = dynamic(
  () => import("../../visionary/editor/VideoEditorWorkspace").then((m) => ({ default: m.VideoEditorWorkspace })),
  { ssr: false, loading: loading("video editor") },
);

export const DynamicVFXWorkspace = dynamic(
  () => import("../../visionary/vfx/VFXWorkspace").then((m) => ({ default: m.VFXWorkspace })),
  { ssr: false, loading: loading("vfx") },
);

export const DynamicMarketingWorkspace = dynamic(
  () => import("../../visionary/marketing/MarketingWorkspace").then((m) => ({ default: m.MarketingWorkspace })),
  { ssr: false, loading: loading("marketing") },
);

export const DynamicStudio3DWorkspace = dynamic(
  () => import("../../visionary/3d/Studio3DWorkspace").then((m) => ({ default: m.Studio3DWorkspace })),
  { ssr: false, loading: loading("3d studio") },
);

export const DynamicAutomationWorkspace = dynamic(
  () => import("../../visionary/automation/AutomationWorkspace").then((m) => ({ default: m.AutomationWorkspace })),
  { ssr: false, loading: loading("automation") },
);

export function VisionaryWorkspaceSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<WidgetLoading label="visionary module" />}>{children}</Suspense>;
}
