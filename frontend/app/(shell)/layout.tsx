import type { ReactNode } from "react";

export const metadata = {
  title: "OmniMind OS — Sovereign Tools",
};

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="omni-os-shell omni-workbench-shell h-screen max-h-[100dvh] w-full max-w-[100vw] overflow-hidden">
      {children}
    </div>
  );
}
