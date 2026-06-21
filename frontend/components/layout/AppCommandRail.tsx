"use client";

import { Menu, X } from "lucide-react";
import type { RefObject } from "react";
import { commandRailButton, commandRailCluster } from "../../lib/responsive-layout";
import { cn } from "../../lib/utils";

interface AppCommandRailProps {
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  /** Anchor for flyout panels opened from the sidebar (search / library) */
  railRef?: RefObject<HTMLDivElement | null>;
}

/** Top-left navigation — premium ☰ menu aligned to OmniMind V11 accent */
export function AppCommandRail({ isMenuOpen, onMenuToggle, railRef }: AppCommandRailProps) {
  return (
    <div ref={railRef} className={commandRailCluster}>
      <button
        type="button"
        onClick={onMenuToggle}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        className={cn(
          commandRailButton,
          "text-[#c2e7ff] transition-colors duration-200 hover:text-white",
          isMenuOpen && "glass-button-active text-white shadow-[0_0_14px_rgba(0,229,255,0.25)]",
        )}
      >
        {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" strokeWidth={2} />}
      </button>
    </div>
  );
}
