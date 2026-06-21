"use client";

import type { ReactNode } from "react";
import { DevicePreviewWrapper } from "./DevicePreviewWrapper";

interface DeviceFrameCanvasProps {
  children: ReactNode;
  className?: string;
}

/** @deprecated Use DevicePreviewWrapper — kept for legacy imports */
export function DeviceFrameCanvas({ children, className }: DeviceFrameCanvasProps) {
  return <DevicePreviewWrapper className={className}>{children}</DevicePreviewWrapper>;
}
