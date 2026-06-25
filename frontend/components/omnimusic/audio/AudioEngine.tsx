"use client";

import { useEffect } from "react";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

/** Initializes Web Audio session — mount inside OmniMusicStudioProvider. */
export function AudioEngine({ children }: { children?: React.ReactNode }) {
  const { audioReady, refreshDevices } = useOmniMusicStudio();

  useEffect(() => {
    void refreshDevices();
  }, [refreshDevices]);

  return (
    <>
      {!audioReady ? (
        <div className="pointer-events-none absolute inset-x-0 top-10 z-50 mx-auto w-fit rounded bg-amber-500/10 px-2 py-0.5 text-[8px] text-amber-300">
          Audio engine initializing…
        </div>
      ) : null}
      {children}
    </>
  );
}
