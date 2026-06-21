"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { WidgetLoading } from "./dynamic-workbench-widgets";

const dyn = (
  loader: () => Promise<{ default: ComponentType<any> }>,
  label: string,
) =>
  dynamic(loader, {
    ssr: false,
    loading: () => <WidgetLoading label={label} />,
  });

export const DynamicLayoutModuleA = dyn(
  () => import("./layouts/modules/LayoutModuleA").then((m) => ({ default: m.LayoutModuleA })),
  "IDE workspace",
);

export const DynamicLayoutModuleB = dyn(
  () => import("./layouts/modules/LayoutModuleB").then((m) => ({ default: m.LayoutModuleB })),
  "3D design suite",
);

export const DynamicLayoutModuleC = dyn(
  () => import("./layouts/modules/LayoutModuleC").then((m) => ({ default: m.LayoutModuleC })),
  "science solver",
);

export const DynamicLayoutModuleD = dyn(
  () => import("./layouts/ModuleLayouts").then((m) => ({ default: m.LayoutModuleD })),
  "medical diagnostic",
);

export const DynamicLayoutModuleE = dyn(
  () => import("./layouts/ModuleLayouts").then((m) => ({ default: m.LayoutModuleE })),
  "trading terminal",
);

export const DynamicLayoutModuleF = dyn(
  () => import("./layouts/modules/LayoutModuleF").then((m) => ({ default: m.LayoutModuleF })),
  "analytics worksheet",
);

export const DynamicLayoutModuleG = dyn(
  () => import("./layouts/modules/LayoutModuleG").then((m) => ({ default: m.LayoutModuleG })),
  "video studio",
);

export const DynamicLayoutModuleH = dyn(
  () => import("./layouts/modules/LayoutModuleH").then((m) => ({ default: m.LayoutModuleH })),
  "VFX editor",
);

export const DynamicLayoutModuleI = dyn(
  () => import("./layouts/modules/LayoutModuleI").then((m) => ({ default: m.LayoutModuleI })),
  "marketing hub",
);

export const DynamicLayoutModuleGeneric = dyn(
  () => import("./layouts/ModuleLayouts").then((m) => ({ default: m.LayoutModuleGeneric })),
  "tool preview",
);
