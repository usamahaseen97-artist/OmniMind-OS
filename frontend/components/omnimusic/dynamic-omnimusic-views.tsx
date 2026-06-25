"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { WidgetLoading } from "../ide/dynamic-workbench-widgets";

const loading = (label: string) => () => <WidgetLoading label={label} />;

export const DynamicAIComposer = dynamic(
  () => import("./ai/AIComposer").then((m) => ({ default: m.AIComposer })),
  { ssr: false, loading: loading("ai composer") },
);

export const DynamicVocalStudio = dynamic(
  () => import("./vocal/VocalStudio").then((m) => ({ default: m.VocalStudio })),
  { ssr: false, loading: loading("vocal studio") },
);

export const DynamicMixingWorkspace = dynamic(
  () => import("./mixing/MixingWorkspace").then((m) => ({ default: m.MixingWorkspace })),
  { ssr: false, loading: loading("mixing") },
);

export function OmniMusicViewSuspense({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<WidgetLoading label="studio view" />}>{children}</Suspense>;
}
