"use client";

import type { ReactNode } from "react";
import { TriplePanelResizeShell } from "./TriplePanelResizeShell";

/** Spatial studio 3-panel shell — custom pointer gutters (12–35% | flex center | 20–55% right) */
export function SpatialStudioResizableGrid({
  left,
  center,
  right,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}) {
  return <TriplePanelResizeShell left={left} center={center} right={right} />;
}
