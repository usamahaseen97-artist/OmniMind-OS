import type { LucideIcon } from "lucide-react";

/** Single icon family — lucide-react only. Standard sizes. */
export const DS_ICON_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
} as const;

export type DSIconSize = keyof typeof DS_ICON_SIZE;

export function dsIconClass(size: DSIconSize = "md", className?: string) {
  const px = DS_ICON_SIZE[size];
  return `h-[${px}px] w-[${px}px] shrink-0 ${className ?? ""}`.trim();
}

export type DSIconProps = {
  icon: LucideIcon;
  size?: DSIconSize;
  className?: string;
};
