import type { ReactNode } from "react";

export const metadata = {
  title: "OmniMind V11 — Sovereign Tools",
};

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="omni-workbench-shell h-screen max-h-[100dvh] w-full max-w-[100vw] overflow-hidden">
      {children}
    </div>
  );
}
