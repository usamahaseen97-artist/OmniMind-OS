"use client";

import { cn } from "../../lib/utils";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: "left" | "right";
}

export function Sheet({ open, onClose, children, side = "left" }: SheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "absolute top-0 flex h-full w-[min(300px,88vw)] flex-col border-neon-green/10 bg-[#060807]/95 shadow-2xl backdrop-blur-xl",
          side === "left" ? "left-0 border-r" : "right-0 border-l",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1 text-zinc-500 hover:bg-white/5"
        >
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
}
