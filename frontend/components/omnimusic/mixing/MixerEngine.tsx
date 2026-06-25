"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import { ChannelStrip } from "./ChannelStrip";
import { MasterBus } from "./MasterBus";

export function MixerEngine() {
  const {
    mixChannels,
    mixBuses,
    selectedMixChannelId,
    setSelectedMixChannelId,
    updateMixChannel,
    updateMixBus,
  } = useOmniMusicStudio();

  const master = mixBuses.find((b) => b.kind === "master");
  const monitor = mixBuses.find((b) => b.kind === "monitor");
  const cue = mixBuses.find((b) => b.kind === "cue");

  return (
    <div className="rounded border border-white/[0.06] bg-[#0a0c10] p-2">
      <p className="mb-2 text-[9px] font-medium text-amber-200/80">Pro Mixer · Unlimited channels · FX sends · sidechain</p>
      <div className="flex overflow-x-auto pb-1">
        {mixChannels.map((ch) => (
          <ChannelStrip
            key={ch.id}
            channel={ch}
            selected={selectedMixChannelId === ch.id}
            onSelect={() => setSelectedMixChannelId(ch.id)}
            onUpdate={(patch) => updateMixChannel(ch.id, patch)}
          />
        ))}
        {master ? <MasterBus bus={master} onUpdate={(p) => updateMixBus(master.id, p)} /> : null}
        {monitor ? <MasterBus bus={monitor} onUpdate={(p) => updateMixBus(monitor.id, p)} /> : null}
        {cue ? <MasterBus bus={cue} onUpdate={(p) => updateMixBus(cue.id, p)} /> : null}
      </div>
    </div>
  );
}
