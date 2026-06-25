"use client";

import { Film, Image, Music, Search, Star, Upload } from "lucide-react";
import { cn } from "../../../lib/utils";
import { MEDIA_KIND_LABELS } from "../../../lib/visionary/editor/constants";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";
import type { MediaKind } from "../../../lib/visionary/editor/types";

const IMPORT_KINDS: MediaKind[] = ["video", "audio", "image", "gif", "png", "psd", "svg", "3d", "brand"];

export function MediaPool() {
  const { mediaPool, mediaSearch, setMediaSearch, importMedia, toggleFavorite, addClipFromMedia } =
    useVisionaryEditor();

  const filtered = mediaPool.filter(
    (m) =>
      !mediaSearch ||
      m.name.toLowerCase().includes(mediaSearch.toLowerCase()) ||
      m.tags.some((t) => t.includes(mediaSearch.toLowerCase())),
  );

  const favorites = filtered.filter((m) => m.favorite);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/[0.06] px-2 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-cyan-400/80">Media Pool</p>
        <div className="relative mt-2">
          <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            value={mediaSearch}
            onChange={(e) => setMediaSearch(e.target.value)}
            placeholder="Search media…"
            className="h-7 w-full rounded border border-white/[0.08] bg-black/40 pl-7 pr-2 text-[10px] text-slate-200"
          />
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-1 border-b border-white/[0.04] p-2">
        {IMPORT_KINDS.slice(0, 5).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => importMedia(k)}
            className="rounded border border-white/[0.08] px-1.5 py-0.5 text-[8px] text-slate-500 hover:border-cyan-500/30 hover:text-cyan-300"
          >
            <Upload size={8} className="inline mr-0.5" />
            {MEDIA_KIND_LABELS[k]}
          </button>
        ))}
      </div>

      {favorites.length > 0 ? (
        <div className="shrink-0 border-b border-white/[0.04] p-2">
          <p className="text-[8px] uppercase text-slate-600">Favorites</p>
          <div className="mt-1 flex gap-1 overflow-x-auto">
            {favorites.map((m) => (
              <MediaThumb key={m.id} item={m} onInsert={() => addClipFromMedia(m.id)} onFav={() => toggleFavorite(m.id)} />
            ))}
          </div>
        </div>
      ) : null}

      <ul className="min-h-0 flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onDoubleClick={() => addClipFromMedia(m.id)}
              className="flex w-full gap-2 rounded border border-white/[0.06] bg-white/[0.02] p-2 text-left hover:border-cyan-500/25"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-[8px] uppercase text-white/70"
                style={{ background: m.thumbnailColor }}
              >
                {m.kind.slice(0, 3)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] text-slate-200">{m.name}</p>
                <p className="text-[8px] text-slate-600">
                  {MEDIA_KIND_LABELS[m.kind]} · {m.durationFrames}f
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(m.id);
                }}
                className={cn("shrink-0", m.favorite ? "text-amber-400" : "text-slate-600")}
              >
                <Star size={12} fill={m.favorite ? "currentColor" : "none"} />
              </button>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MediaThumb({
  item,
  onInsert,
  onFav,
}: {
  item: { id: string; name: string; thumbnailColor: string; favorite: boolean };
  onInsert: () => void;
  onFav: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onInsert}
      className="h-12 w-12 shrink-0 rounded border border-white/10 text-[7px] text-white/80"
      style={{ background: item.thumbnailColor }}
      title={item.name}
    />
  );
}
