"use client";

import { useEffect } from "react";

type AnimeParams = Record<string, unknown>;

type AnimeCallable = (targets: string | object | object[], params: AnimeParams) => unknown;

async function loadAnime(): Promise<AnimeCallable | null> {
  if (typeof window === "undefined") return null;
  try {
    const mod = await import("animejs");
    const fn = (mod as { animate?: AnimeCallable; default?: AnimeCallable }).animate
      ?? (mod as { default?: AnimeCallable }).default;
    return typeof fn === "function" ? fn : null;
  } catch {
    return null;
  }
}

/** Run animejs only in the browser after mount — never during SSR/webpack prefetch */
export async function runClientAnime(
  targets: string | object | object[],
  params: AnimeParams,
): Promise<void> {
  const animate = await loadAnime();
  if (!animate) return;
  animate(targets, params);
}

/** Hook: fire animejs animation once after client mount */
export function useClientAnime(
  targets: string | object | object[],
  params: AnimeParams,
  deps: readonly unknown[] = [],
): void {
  useEffect(() => {
    let cancelled = false;
    void loadAnime().then((animate) => {
      if (cancelled || !animate) return;
      animate(targets, params);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
