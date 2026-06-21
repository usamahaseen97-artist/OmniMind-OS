"use client";

import type { AppViewId } from "../../lib/app-views";
import { entertainmentStack } from "../../lib/responsive-layout";
import { cn } from "../../lib/utils";
import { OmniChargeView } from "./OmniChargeView";
import { OmniMusicView } from "./OmniMusicView";
import { OmniMoviesView } from "./OmniMoviesView";
import { OmniTVView } from "./OmniTVView";
import { EntertainmentMoodProvider } from "./EntertainmentMoodProvider";
import { StreamingInfraBadge } from "./StreamingInfraBadge";

interface EntertainmentWorkspaceProps {
  viewId: Exclude<AppViewId, "sovereign-core" | "omnimap">;
  userId?: string;
}

export function EntertainmentWorkspace({ viewId, userId }: EntertainmentWorkspaceProps) {
  const body =
    viewId === "omnimusic" ? (
      <OmniMusicView userId={userId} />
    ) : viewId === "omnimovies" || viewId === "omnistream" ? (
      <OmniMoviesView userId={userId} />
    ) : viewId === "omnitv" ? (
      <OmniTVView userId={userId} />
    ) : viewId === "omnicharge" ? (
      <OmniChargeView />
    ) : (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-zinc-500">
        Select OmniMusic, OmniMovies, OmniTV, or OmniCharge from the header.
      </div>
    );

  return (
    <div
      className={cn(
        entertainmentStack,
        "pointer-events-auto box-border flex min-h-0 w-full max-w-full flex-col",
      )}
    >
      <StreamingInfraBadge />
      <EntertainmentMoodProvider userId={userId}>
        <div className="min-h-0 min-w-0 w-full max-w-full flex-1 overflow-hidden">{body}</div>
      </EntertainmentMoodProvider>
    </div>
  );
}
