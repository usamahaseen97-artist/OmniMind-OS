import { cn } from "../../lib/utils";
import { dsButtonSizes, dsButtonVariants } from "../../design-system/components/styles";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "neon" | "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "icon" | "xs";
}

const LEGACY_MAP = {
  default: "primary",
  neon: "primary",
  ghost: "ghost",
  outline: "outline",
  primary: "primary",
  secondary: "secondary",
  danger: "danger",
} as const;

const SIZE_MAP = {
  xs: "xs",
  sm: "sm",
  md: "md",
  icon: "icon",
} as const;

/** Enterprise button — consumes OmniMind Design System tokens. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const dsVariant = LEGACY_MAP[variant] ?? "primary";
    const dsSize = SIZE_MAP[size] ?? "md";
    return (
      <button
        ref={ref}
        className={cn(dsButtonVariants(dsVariant), dsButtonSizes(dsSize), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
