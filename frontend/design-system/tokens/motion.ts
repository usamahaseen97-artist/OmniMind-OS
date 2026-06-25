export const DS_DURATION = {
  instant: 0,
  fast: 120,
  normal: 200,
  slow: 320,
  slower: 480,
} as const;

export const DS_EASING = {
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  in: "cubic-bezier(0.4, 0, 1, 1)",
  out: "cubic-bezier(0, 0, 0.2, 1)",
  inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/** Framer-motion presets — shared across OS shell and tools */
export const DS_MOTION = {
  panel: { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.85 },
  fade: { duration: DS_DURATION.normal / 1000, ease: DS_EASING.out },
  slide: { duration: DS_DURATION.slow / 1000, ease: DS_EASING.inOut },
  micro: { duration: DS_DURATION.fast / 1000, ease: DS_EASING.default },
} as const;

export const DS_TRANSITION_CLASS = {
  default: "transition-all duration-200 ease-out",
  colors: "transition-colors duration-150 ease-out",
  transform: "transition-transform duration-200 ease-out",
  opacity: "transition-opacity duration-150 ease-out",
} as const;
