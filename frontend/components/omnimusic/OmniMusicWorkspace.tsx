"use client";

import { memo } from "react";
import { Group, Panel } from "react-resizable-panels";
import { SplitResizeHandle } from "../ide/layouts/SplitWorkspace";
import { TransportBar } from "./TransportBar";
import { MusicSidebar } from "./MusicSidebar";
import { TrackTimeline } from "./TrackTimeline";
import { PianoRoll } from "./PianoRoll";
import { MixerConsole } from "./MixerConsole";
import { InspectorPanel } from "./InspectorPanel";
import { StatusBar } from "./StatusBar";
import { useOmniMusicStudio } from "../../lib/omnimusic-studio-context";
import {
  DynamicAIComposer,
  DynamicMixingWorkspace,
  DynamicVocalStudio,
  OmniMusicViewSuspense,
} from "./dynamic-omnimusic-views";

const DawCenter = memo(function DawCenter() {
  return (
    <Group orientation="vertical" className="h-full">
      <Panel defaultSize={55} minSize={30} className="min-h-0 overflow-hidden">
        <TrackTimeline />
      </Panel>
      <SplitResizeHandle orientation="vertical" />
      <Panel defaultSize={45} minSize={20} className="min-h-0 overflow-hidden">
        <PianoRoll />
      </Panel>
    </Group>
  );
});

export const OmniMusicWorkspace = memo(function OmniMusicWorkspace() {
  const { studioViewMode } = useOmniMusicStudio();

  return (
    <div className="omnimusic-workspace flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0B0F19]">
      <TransportBar />

      <div className="min-h-0 flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={18} minSize={12} maxSize={28} className="min-h-0 overflow-hidden border-r border-white/[0.06]">
            <MusicSidebar />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={58} minSize={40} className="flex min-h-0 flex-col overflow-hidden">
            <OmniMusicViewSuspense>
              {studioViewMode === "daw" ? (
                <DawCenter />
              ) : studioViewMode === "vocal" ? (
                <DynamicVocalStudio />
              ) : studioViewMode === "mix" ? (
                <DynamicMixingWorkspace />
              ) : (
                <DynamicAIComposer />
              )}
            </OmniMusicViewSuspense>
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={24} minSize={16} maxSize={32} className="min-h-0 overflow-hidden border-l border-white/[0.06]">
            <InspectorPanel />
          </Panel>
        </Group>
      </div>

      {studioViewMode === "daw" ? (
        <div className="h-36 shrink-0 border-t border-white/[0.06]">
          <MixerConsole />
        </div>
      ) : null}

      <StatusBar />
    </div>
  );
});
