"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export function WidgetLoading({ label = "workspace" }: { label?: string }) {
  return (
    <div className="flex min-h-[120px] flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2"
          style={{ borderColor: "var(--omni-border)", borderTopColor: "var(--omni-accent)" }}
        />
        <span className="text-[10px]" style={{ color: "var(--omni-text-muted)" }}>
          Loading {label}…
        </span>
      </div>
    </div>
  );
}

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

export const DynamicIDEMonacoWorkspace = dyn(
  () => import("./IDEMonacoWorkspace").then((m) => ({ default: m.IDEMonacoWorkspace })),
  "code editor",
);

export const DynamicIDEBottomPanel = dyn(
  () => import("./IDEBottomPanel").then((m) => ({ default: m.IDEBottomPanel })),
  "terminal",
);

export const DynamicIDERightPanel = dyn(
  () => import("./IDERightPanel").then((m) => ({ default: m.IDERightPanel })),
  "code bot",
);
