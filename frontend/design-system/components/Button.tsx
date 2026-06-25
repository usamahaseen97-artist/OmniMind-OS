"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { dsButtonSizes, dsButtonVariants } from "./styles";

export type DSButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
};

export const DSButton = forwardRef<HTMLButtonElement, DSButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(dsButtonVariants(variant), dsButtonSizes(size), className)}
      {...props}
    />
  ),
);
DSButton.displayName = "DSButton";

export const DSIconButton = forwardRef<HTMLButtonElement, DSButtonProps>(
  ({ className, variant = "ghost", size = "icon", ...props }, ref) => (
    <DSButton ref={ref} variant={variant} size={size} className={className} {...props} />
  ),
);
DSIconButton.displayName = "DSIconButton";
