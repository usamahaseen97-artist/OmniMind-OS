"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { WidgetLoading } from "./WidgetLoading";

export { WidgetLoading } from "./WidgetLoading";

const dyn = (
  loader: () => Promise<{ default: ComponentType<Record<string, never>> | ComponentType<any> }>,
  label: string,
) =>
  dynamic(loader as () => Promise<{ default: ComponentType<any> }>, {
    ssr: false,
    loading: () => <WidgetLoading label={label} />,
  });

export const DynamicToolLiveSimMatrix = dyn(
  () => import("./matrix/ToolLiveSimMatrix").then((m) => ({ default: m.ToolLiveSimMatrix })),
  "live simulation",
);

export const DynamicToolWorkspaceMatrix = dyn(
  () => import("./matrix/ToolWorkspaceMatrix").then((m) => ({ default: m.ToolWorkspaceMatrix })),
  "workspace",
);

export const DynamicOmniChatShell = dyn(
  () => import("../chat/OmniChatShell").then((m) => ({ default: m.OmniChatShell })),
  "agent chat",
);

export const DynamicOmniChatShellCompact = dyn(
  () => import("../chat/OmniChatShell").then((m) => ({ default: m.OmniChatShell })),
  "chat",
);

export const DynamicWorkbenchLiveBinder = dyn(
  () => import("./live/WorkbenchLiveViewport").then((m) => ({ default: m.WorkbenchLiveBinder })),
  "live preview",
);

export const DynamicClientMountGate = dyn(
  () => import("./client/ClientMountGate").then((m) => ({ default: m.ClientMountGate })),
  "workspace",
);

export const DynamicIDEMonacoWorkspace = dyn(
  () => import("./IDEMonacoWorkspace").then((m) => ({ default: m.IDEMonacoWorkspace })),
  "editor",
);

export const DynamicIDEBottomPanel = dyn(
  () => import("./IDEBottomPanel").then((m) => ({ default: m.IDEBottomPanel })),
  "terminal",
);

export const DynamicIDERightPanel = dyn(
  () => import("./IDERightPanel").then((m) => ({ default: m.IDERightPanel })),
  "inspector",
);
