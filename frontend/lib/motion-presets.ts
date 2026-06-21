/** Shared Framer Motion presets for sovereign workbench transitions */

export const toolViewportVariants = {
  initial: { opacity: 0, x: 12, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -8, filter: "blur(2px)" },
} as const;

export const toolViewportTransition = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const drawerVariants = {
  hidden: { x: -16, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -12, opacity: 0 },
} as const;

export const drawerTransition = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
};

export const panelFadeVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
} as const;
