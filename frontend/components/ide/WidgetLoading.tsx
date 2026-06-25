"use client";

/** Shared loading spinner — isolated to break IDE dynamic-import cycles. */
export function WidgetLoading({ label = "workspace" }: { label?: string }) {
  return (
    <div className="flex min-h-[120px] flex-1 items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2"
          style={{ borderColor: "var(--omni-border)", borderTopColor: "var(--omni-accent)" }}
        />
        <span className="text-[10px]" style={{ color: "var(--omni-text-muted)" }}>
          Loading {label}…
        </span>
      </div>
    </div>
  );
}
