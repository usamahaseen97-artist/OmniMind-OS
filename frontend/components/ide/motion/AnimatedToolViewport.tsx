"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { toolViewportTransition, toolViewportVariants } from "../../../lib/motion-presets";

interface AnimatedToolViewportProps {
  toolKey: string;
  children: ReactNode;
  className?: string;
}

/** Framer-motion shell — smooth tool switch without layout flash */
export function AnimatedToolViewport({ toolKey, children, className }: AnimatedToolViewportProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={toolKey}
        variants={toolViewportVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={toolViewportTransition}
        className={className ?? "omni-workbench-viewport flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
