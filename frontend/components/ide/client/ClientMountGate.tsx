"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WidgetLoading } from "../WidgetLoading";

interface ClientMountGateProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

/** Renders children only after browser mount — blocks SSR/hydration for WebGL & animation engines */
export function ClientMountGate({ children, label = "canvas", className }: ClientMountGateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={className ?? "flex h-full min-h-[200px] w-full items-center justify-center"}>
        <WidgetLoading label={label} />
      </div>
    );
  }

  return <>{children}</>;
}
