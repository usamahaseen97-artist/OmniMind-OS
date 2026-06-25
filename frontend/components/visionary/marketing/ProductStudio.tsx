"use client";

import { cn } from "../../../lib/utils";
import { PRODUCT_STUDIO_TOOLS } from "../../../lib/visionary/marketing/constants";
import { useVisionaryMarketing } from "../../../lib/visionary/marketing-context";

export function ProductStudio() {
  const { products, addProduct, activeProductTool, applyProductTool } = useVisionaryMarketing();

  return (
    <div className="flex h-full">
      <div className="w-48 shrink-0 overflow-y-auto border-r border-white/[0.06] p-2">
        <p className="mb-2 text-[9px] uppercase text-slate-600">Catalog</p>
        <button type="button" onClick={() => addProduct("New Product", "SKU-NEW")} className="mb-2 text-[9px] text-violet-400">+ Product</button>
        {products.map((p) => (
          <div key={p.id} className="mb-1 rounded bg-white/[0.03] px-2 py-1">
            <p className="text-[10px] text-slate-300">{p.name}</p>
            <p className="text-[8px] text-slate-600">{p.sku} · ${p.price}</p>
          </div>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap gap-1 border-b border-white/[0.06] p-2">
          {PRODUCT_STUDIO_TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyProductTool(t.id)}
              className={cn(
                "rounded border px-2 py-0.5 text-[8px]",
                activeProductTool === t.id
                  ? "border-violet-400/50 bg-violet-500/10 text-violet-200"
                  : "border-white/[0.06] text-slate-500",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1a0a2e]">
          <div className="rounded-xl border border-white/10 bg-black/40 p-8 text-center">
            <div className="mx-auto mb-4 h-32 w-32 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800" />
            <p className="text-[11px] text-slate-400">
              {activeProductTool ? PRODUCT_STUDIO_TOOLS.find((t) => t.id === activeProductTool)?.label : "Select a product tool"}
            </p>
            <p className="mt-1 text-[8px] text-slate-600">360 Viewer · Price Cards · Variants — architecture stub</p>
          </div>
        </div>
      </div>
    </div>
  );
}
