/** 4px base grid */
export const DS_SPACING = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export const DS_LAYOUT = {
  headerHeight: "2.75rem",
  statusHeight: "1.5rem",
  sidebarWidth: "15.5rem",
  sidebarCollapsed: "3.5rem",
  copilotWidth: "22rem",
  copilotMin: "17rem",
  copilotMax: "28rem",
  dockHeight: "3rem",
  railWidth: "3.5rem",
  maxContentWidth: "90rem",
} as const;

export const DS_BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  ultrawide: 1920,
} as const;
