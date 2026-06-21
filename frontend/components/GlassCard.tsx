import { ReactNode } from "react";

interface GlassCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function GlassCard({ title, children, className = "" }: GlassCardProps) {
  return (
    <section className={`rounded-2xl border border-amber-200/25 bg-white/10 p-6 shadow-glow backdrop-blur-2xl ${className}`}>
      {title && <h3 className="mb-4 text-lg font-semibold text-amber-100">{title}</h3>}
      <div className="text-sm text-amber-50/90">{children}</div>
    </section>
  );
}
