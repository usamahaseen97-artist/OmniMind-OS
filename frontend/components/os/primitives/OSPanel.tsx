"use client";

import type { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import { DS_GLASS } from "../../../design-system/tokens/effects";
import { DSSectionHeader } from "../../../design-system/components/WorkspaceHeader";

type OSPanelProps = {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
};

export function OSPanel({ children, className, elevated }: OSPanelProps) {
  return (
    <div
      className={cn(DS_GLASS.panel, "rounded-xl", elevated && "bg-[color:var(--omni-ds-bg-panel-elevated)]/95", className)}
    >
      {children}
    </div>
  );
}

export { DSSectionHeader as OSSectionHeader };
