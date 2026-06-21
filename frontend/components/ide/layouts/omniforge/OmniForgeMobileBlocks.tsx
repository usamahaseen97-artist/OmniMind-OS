"use client";

import { GripVertical } from "lucide-react";
import { useMemo } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useIDE } from "../../IDEProvider";
import type { MobileUiBlock } from "../../../../lib/omniforge-mobile-layout-store";
import { parsePreviewProduct, type PreviewProduct } from "../../../../lib/omniforge-preview-data";
import { OF } from "./omniforge-theme";

function DragHandle() {
  return (
    <div className="flex flex-col gap-[2px] opacity-50" aria-hidden>
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex gap-[2px]">
          <span className="h-1 w-1 rounded-full bg-white/60" />
          <span className="h-1 w-1 rounded-full bg-white/60" />
        </div>
      ))}
    </div>
  );
}

function MobileBlockContent({ block, product }: { block: MobileUiBlock; product: PreviewProduct | null }) {
  if (!product) {
    return (
      <p className="text-[9px]" style={{ color: OF.textMuted }}>
        Open a product catalog in the workspace to populate this block ({block.type}).
      </p>
    );
  }

  switch (block.type) {
    case "product-image":
      return (
        <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br from-[#1e2128] to-[#0f1115]">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="relative h-16 w-24 rounded-2xl bg-[#111] shadow-lg">
              <div className="absolute -left-3 top-4 h-10 w-10 rounded-full border-2 border-[#333] bg-[#0a0a0a]" />
              <div className="absolute -right-3 top-4 h-10 w-10 rounded-full border-2 border-[#333] bg-[#0a0a0a]" />
            </div>
          )}
        </div>
      );
    case "title-price":
      return (
        <div>
          <h2 className="text-[11px] font-semibold leading-tight text-white">{product.name}</h2>
          <p className="mt-1 text-[13px] font-bold" style={{ color: OF.cyan }}>
            ${product.price}
          </p>
        </div>
      );
    case "description":
      return <p className="text-[9px] leading-relaxed text-[#9CA3AF]">{product.description}</p>;
    case "color-options":
      return (
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-[#9CA3AF]">Color</span>
          {product.colors.map((c) => (
            <button
              key={c}
              type="button"
              className="h-4 w-4 rounded-full border border-white/20"
              style={{ background: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      );
    case "add-to-cart":
      return (
        <button
          type="button"
          className="w-full rounded-lg py-2 text-[10px] font-semibold text-black"
          style={{ background: `linear-gradient(90deg, ${OF.cyan} 0%, ${OF.cyanDim} 100%)` }}
        >
          Add to Cart
        </button>
      );
    default:
      return null;
  }
}

export function OmniForgeMobileViewport({
  blocks,
  onReorder,
}: {
  blocks: MobileUiBlock[];
  onReorder: (from: number, to: number) => void;
}) {
  const { projectFiles } = useIDE();
  const product = useMemo(() => parsePreviewProduct(projectFiles), [projectFiles]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="mobile-canvas">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2 p-2">
            {blocks.map((block, index) => (
              <Draggable key={block.id} draggableId={block.id} index={index}>
                {(drag, snapshot) => (
                  <div
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    className="flex gap-2 rounded-lg border p-1.5 transition-shadow"
                    style={{
                      borderColor: snapshot.isDragging ? OF.purpleBorder : OF.border,
                      background: OF.panelAlt,
                      boxShadow: snapshot.isDragging ? `0 0 16px ${OF.purpleGlow}` : undefined,
                      ...drag.draggableProps.style,
                    }}
                  >
                    <div {...drag.dragHandleProps} className="flex cursor-grab items-start pt-1 active:cursor-grabbing">
                      <DragHandle />
                    </div>
                    <div className="min-w-0 flex-1">
                      <MobileBlockContent block={block} product={product} />
                    </div>
                    <GripVertical className="h-3 w-3 shrink-0 self-center opacity-30" />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export function OmniForgeBrowserPreview() {
  const { projectFiles } = useIDE();
  const product = useMemo(() => parsePreviewProduct(projectFiles), [projectFiles]);

  if (!product) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-[11px]" style={{ color: OF.textMuted, background: OF.bgDeep }}>
        Browser preview loads from workspace product catalog files.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-auto" style={{ background: "#f8fafc" }}>
      <div className="mx-auto w-full max-w-3xl p-8">
        <div className="rounded-2xl border bg-white p-8 shadow-xl" style={{ borderColor: "#e2e8f0" }}>
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 p-8">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image} alt={product.name} className="max-h-48 object-contain" />
              ) : (
                <div className="relative h-24 w-36 rounded-3xl bg-black shadow-2xl" />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
              <p className="text-3xl font-bold text-cyan-600">${product.price}</p>
              <p className="text-sm text-slate-600">{product.description}</p>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <span key={c} className="h-6 w-6 rounded-full border" style={{ background: c }} />
                ))}
              </div>
              <button type="button" className="mt-2 rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-white">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
