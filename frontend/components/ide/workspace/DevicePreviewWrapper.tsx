"use client";

import { Expand, Laptop, Minimize2, Smartphone } from "lucide-react";
import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "../../../lib/utils";

export type DeviceViewMode = "mobile" | "desktop";

interface DevicePreviewWrapperProps {
  children: ReactNode;
  className?: string;
  defaultViewMode?: DeviceViewMode;
}

const VIEWPORT_TRANSITION = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

const MOBILE_VIEWPORT_STYLE: CSSProperties = {
  width: 375,
  height: 760,
  borderRadius: 32,
  border: "8px solid #2e2f30",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  margin: "0 auto",
  transition: VIEWPORT_TRANSITION,
};

const DESKTOP_VIEWPORT_STYLE: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: 8,
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: VIEWPORT_TRANSITION,
};

function DeviceToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
        active
          ? "bg-[rgba(255,255,255,0.9)] text-black shadow-[0_0_16px_rgba(255,255,255,0.25)]"
          : "bg-transparent text-white/75 hover:bg-white/[0.08] hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Reusable mobile / desktop preview chrome — glass toolbar + responsive viewport frame.
 */
export function DevicePreviewWrapper({
  children,
  className,
  defaultViewMode = "desktop",
}: DevicePreviewWrapperProps) {
  const [viewMode, setViewMode] = useState<DeviceViewMode>(defaultViewMode);
  const [immersive, setImmersive] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const isMobile = viewMode === "mobile";
  const compactStyle: CSSProperties = isMobile
    ? { ...MOBILE_VIEWPORT_STYLE, width: 280, height: 560, borderWidth: "6px", borderRadius: 24 }
    : { ...DESKTOP_VIEWPORT_STYLE, width: 340, height: 220, borderRadius: 12 };

  return (
    <div className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", className)}>
      <div
        className="absolute right-3 top-3 z-50 flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.08] p-1 backdrop-blur-xl backdrop-saturate-150"
        style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)" }}
      >
        <DeviceToolbarButton
          active={isMobile}
          label="Mobile preview"
          onClick={() => setViewMode("mobile")}
        >
          <Smartphone className="h-4 w-4" strokeWidth={1.75} />
        </DeviceToolbarButton>
        <DeviceToolbarButton
          active={!isMobile}
          label="Desktop preview"
          onClick={() => setViewMode("desktop")}
        >
          <Laptop className="h-4 w-4" strokeWidth={1.75} />
        </DeviceToolbarButton>
      </div>

      <button
        type="button"
        onClick={() => setPreviewEnabled((v) => !v)}
        className="absolute right-3 top-14 z-50 rounded-full border border-white/20 bg-black/50 px-2 py-1 text-[10px] text-white/85 backdrop-blur"
      >
        Preview Mode: {previewEnabled ? "ON" : "OFF"}
      </button>

      {previewEnabled ? (
        <div className={cn("pointer-events-none absolute right-4 top-24 z-40")}>
          <div
            className={cn(
              "relative overflow-y-auto overflow-x-hidden bg-[#0d0e12]",
              isMobile ? "max-w-full" : "min-w-0",
            )}
            style={compactStyle}
          >
            <div className="h-full min-h-0 w-full">{children}</div>
          </div>
        </div>
      ) : null}

      {previewEnabled ? (
        <button
          type="button"
          onClick={() => setImmersive(true)}
          className="absolute right-3 top-24 z-50 rounded-full border border-white/20 bg-black/50 px-2 py-1 text-[10px] text-white/85 backdrop-blur"
        >
          <Expand className="mr-1 inline h-3.5 w-3.5" />
          Open Live Mode
        </button>
      ) : null}

      <div className="flex min-h-0 flex-1 items-center justify-center p-4 pt-14">
        <p className="text-center text-[10px] text-gray-500">
          {previewEnabled
            ? "Device shell pinned to right edge. Click Open Live Mode for immersive testing."
            : "Preview Mode is OFF. Enable it to show Desktop/Tablet/Mobile preview."}
        </p>
      </div>

      {immersive && previewEnabled ? (
        <div
          className="absolute inset-0 z-[70] flex flex-col bg-black/85 p-4 backdrop-blur-md"
          role="dialog"
          aria-label="Immersive live mode preview"
        >
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={() => setImmersive(false)}
              className="rounded-full border border-white/20 bg-black/50 px-2 py-1 text-[10px] text-white/85"
            >
              <Minimize2 className="mr-1 inline h-3.5 w-3.5" />
              Exit Live Mode
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-white/15 bg-[#0d0e12]">
            <div className="h-full min-h-0 w-full overflow-auto">{children}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
