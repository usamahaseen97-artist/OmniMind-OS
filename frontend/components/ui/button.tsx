import { cn } from "../../lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "neon";
  size?: "sm" | "md" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/50 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-neon-green text-black hover:bg-neon-green-dim",
          variant === "neon" &&
            "border border-neon-green/40 bg-neon-green/10 text-neon-green hover:bg-neon-green/20",
          variant === "ghost" && "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
          variant === "outline" &&
            "border border-zinc-700 bg-transparent text-zinc-300 hover:border-zinc-500",
          size === "sm" && "h-8 px-3 text-xs",
          size === "md" && "h-10 px-4 text-sm",
          size === "icon" && "h-9 w-9",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
