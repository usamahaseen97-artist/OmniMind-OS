"use client";

import type { CSSProperties, ReactNode } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { cn } from "../../../lib/utils";

export function SplitPanelHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header
      className="flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2"
      style={{ borderColor: "var(--omni-border)", background: "var(--omni-panel)" }}
    >
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider omni-accent-text">{title}</p>
        {subtitle ? (
          <p className="truncate text-[9px]" style={{ color: "var(--omni-text-muted)" }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge}
        {actions}
      </div>
    </header>
  );
}

export function SplitPanelBody({
  children,
  className,
  padded = false,
  style,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        padded && "p-2",
        className,
      )}
      style={{ background: "var(--omni-panel-alt)", ...style }}
    >
      {children}
    </div>
  );
}

export function SplitResizeHandle({ orientation = "horizontal" }: { orientation?: "horizontal" | "vertical" }) {
  return (
    <Separator
      className={cn(
        "omni-split-handle group relative z-10 flex shrink-0 items-center justify-center transition-colors",
        orientation === "horizontal"
          ? "w-1.5 cursor-col-resize hover:bg-[color-mix(in_srgb,var(--omni-accent)_35%,transparent)]"
          : "h-1.5 cursor-row-resize hover:bg-[color-mix(in_srgb,var(--omni-accent)_35%,transparent)]",
      )}
      style={{ background: "color-mix(in srgb, var(--omni-border) 40%, transparent)" }}
    >
      <span
        className={cn(
          "rounded-full opacity-0 transition-opacity group-hover:opacity-100",
          orientation === "horizontal" ? "h-8 w-0.5" : "h-0.5 w-8",
        )}
        style={{ background: "var(--omni-accent)" }}
      />
    </Separator>
  );
}

/** Horizontal split: left | center | right (Cursor-style 3-column) */
export function SplitWorkspace3Col({
  left,
  center,
  right,
  leftDefault = 24,
  centerDefault = 38,
  rightDefault = 38,
  footer,
  footerDefault = 18,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  leftDefault?: number;
  centerDefault?: number;
  rightDefault?: number;
  footer?: ReactNode;
  footerDefault?: number;
}) {
  if (footer) {
    return (
      <Group orientation="vertical" className="min-h-0 flex-1">
        <Panel defaultSize={100 - footerDefault} minSize={40}>
          <Group orientation="horizontal" className="h-full">
            <Panel defaultSize={leftDefault} minSize={16} maxSize={42} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
              {left}
            </Panel>
            <SplitResizeHandle orientation="horizontal" />
            <Panel defaultSize={centerDefault} minSize={22} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
              {center}
            </Panel>
            <SplitResizeHandle orientation="horizontal" />
            <Panel defaultSize={rightDefault} minSize={22} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
              {right}
            </Panel>
          </Group>
        </Panel>
        <SplitResizeHandle orientation="vertical" />
        <Panel defaultSize={footerDefault} minSize={10} maxSize={40} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {footer}
        </Panel>
      </Group>
    );
  }

  return (
    <Group orientation="horizontal" className="min-h-0 flex-1">
      <Panel defaultSize={leftDefault} minSize={16} maxSize={42} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {left}
      </Panel>
      <SplitResizeHandle orientation="horizontal" />
      <Panel defaultSize={centerDefault} minSize={22} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {center}
      </Panel>
      <SplitResizeHandle orientation="horizontal" />
      <Panel defaultSize={rightDefault} minSize={22} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {right}
      </Panel>
    </Group>
  );
}

/** Two-column split: sidebar + main workspace */
export function SplitWorkspace2Col({
  sidebar,
  main,
  sidebarDefault = 32,
  sidebarSide = "left",
  footer,
  footerDefault = 22,
}: {
  sidebar: ReactNode;
  main: ReactNode;
  sidebarDefault?: number;
  sidebarSide?: "left" | "right";
  footer?: ReactNode;
  footerDefault?: number;
}) {
  const row = (
    <Group orientation="horizontal" className="h-full">
      {sidebarSide === "left" ? (
        <>
          <Panel defaultSize={sidebarDefault} minSize={18} maxSize={50} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            {sidebar}
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={100 - sidebarDefault} minSize={30} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            {main}
          </Panel>
        </>
      ) : (
        <>
          <Panel defaultSize={100 - sidebarDefault} minSize={30} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            {main}
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={sidebarDefault} minSize={18} maxSize={50} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            {sidebar}
          </Panel>
        </>
      )}
    </Group>
  );

  if (!footer) {
    return <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{row}</div>;
  }

  return (
    <Group orientation="vertical" className="min-h-0 flex-1">
      <Panel defaultSize={100 - footerDefault} minSize={35} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {row}
      </Panel>
      <SplitResizeHandle orientation="vertical" />
      <Panel defaultSize={footerDefault} minSize={12} maxSize={45} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {footer}
      </Panel>
    </Group>
  );
}

/** VFX NLE: top row (media + preview) + bottom timeline */
export function SplitWorkspaceNLE({
  topLeft,
  topRight,
  bottom,
  topLeftDefault = 28,
  bottomDefault = 32,
}: {
  topLeft: ReactNode;
  topRight: ReactNode;
  bottom: ReactNode;
  topLeftDefault?: number;
  bottomDefault?: number;
}) {
  return (
    <Group orientation="vertical" className="min-h-0 flex-1">
      <Panel defaultSize={100 - bottomDefault} minSize={35} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={topLeftDefault} minSize={18} maxSize={45} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            {topLeft}
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={100 - topLeftDefault} minSize={35} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            {topRight}
          </Panel>
        </Group>
      </Panel>
      <SplitResizeHandle orientation="vertical" />
      <Panel defaultSize={bottomDefault} minSize={18} maxSize={50} className="flex min-h-0 min-w-0 flex-col overflow-hidden">
        {bottom}
      </Panel>
    </Group>
  );
}
