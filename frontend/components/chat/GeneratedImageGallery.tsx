"use client";

import { useState } from "react";
import { ExternalLink, ZoomIn } from "lucide-react";
import type { GeneratedImageAsset } from "../../lib/execution-preview";
import { proxiedImageUrl } from "../../lib/live-render-pipeline";
import { cn } from "../../lib/utils";

interface GeneratedImageGalleryProps {
  images: GeneratedImageAsset[];
  className?: string;
}

export function GeneratedImageGallery({ images, className }: GeneratedImageGalleryProps) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const current = images[Math.min(active, images.length - 1)];
  const src = proxiedImageUrl(current.url);

  return (
    <div className={cn("pointer-events-auto space-y-2", className)}>
      <div className="group relative overflow-hidden rounded-xl border border-neon-green/25 bg-black/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={current.alt ?? "Generated image"}
          className="max-h-[420px] w-full object-contain"
          loading="lazy"
        />
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-black/70 p-1.5 text-neon-green hover:bg-neon-green/20"
            title="Open full size"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-14 w-14 shrink-0 overflow-hidden rounded-lg border",
                i === active ? "border-neon-green" : "border-white/10 opacity-70",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={proxiedImageUrl(img.url)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <p className="flex items-center gap-1 text-[10px] text-zinc-500">
        <ZoomIn className="h-3 w-3" />
        Generated asset · click expand icon for full resolution
      </p>
    </div>
  );
}
