"use client";

export function OmniTVPlayerSkeleton() {
  return (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-zinc-800 bg-black/70">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#00FF87]/30 border-t-[#00FF87]" />
    </div>
  );
}

export function OmniTVRowSkeleton() {
  return (
    <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      {[0, 1, 2].map((row) => (
        <div key={row}>
          <div className="mb-3 h-5 w-40 animate-pulse rounded-full bg-zinc-800" />
          <div className="flex gap-3 overflow-hidden">
            {[0, 1, 2, 3].map((card) => (
              <div
                key={card}
                className="h-44 w-64 shrink-0 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
