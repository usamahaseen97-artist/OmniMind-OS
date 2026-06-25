"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { OmniMusicMixingContextSlice } from "./mixing-context-types";
import type { OmniMusicProject } from "./types";
import type { MasteringTarget, MixBus, MixingPanel } from "./mixing-types";
import {
  analysisEngineCore,
  automationCurvesCore,
  busManagerCore,
  dspArchitectureCore,
  fxRackCore,
  masteringEngineCore,
  mixAssistantCore,
  mixPresetManagerCore,
  omnimusicMixingApi,
  pluginHostCore,
  proMixerEngine,
  referenceTrackManagerCore,
  routingMatrixCore,
} from "./mixing";

type Deps = { project: OmniMusicProject };

export function useOmniMusicMixingBridge({ project }: Deps): OmniMusicMixingContextSlice {
  const [mixingPanel, setMixingPanel] = useState<MixingPanel>("mixer");
  const [mixChannels, setMixChannels] = useState(proMixerEngine.channels);
  const [mixBuses, setMixBuses] = useState(proMixerEngine.buses);
  const [selectedMixChannelId, setSelectedMixChannelId] = useState<string | null>(null);
  const [masteringChain, setMasteringChain] = useState(masteringEngineCore.chain);
  const [meterState, setMeterState] = useState(analysisEngineCore.meter());
  const [spectrumFrame, setSpectrumFrame] = useState(analysisEngineCore.spectrum());
  const [mixReport, setMixReport] = useState(analysisEngineCore.mixReport());
  const [automationLanes, setAutomationLanes] = useState(automationCurvesCore.lanes);
  const [mixPresets] = useState(mixPresetManagerCore.all());
  const [referenceTracks] = useState(referenceTrackManagerCore.list());
  const [routingRoutes, setRoutingRoutes] = useState(routingMatrixCore.routes);
  const fxCatalog = pluginHostCore.catalog();

  useEffect(() => {
    proMixerEngine.initFromTracks(project.tracks);
    setMixChannels([...proMixerEngine.channels]);
    setMixBuses([...proMixerEngine.buses]);
    if (proMixerEngine.channels[0]) setSelectedMixChannelId(proMixerEngine.channels[0].id);
  }, [project.tracks]);

  useEffect(() => {
    const iv = setInterval(() => {
      setMeterState(analysisEngineCore.meter());
      setSpectrumFrame(analysisEngineCore.spectrum());
    }, 800);
    return () => clearInterval(iv);
  }, []);

  const persist = useCallback(() => {
    void omnimusicMixingApi.saveMixerState(project.id, { channels: mixChannels, buses: mixBuses }).catch(() => undefined);
  }, [project.id, mixChannels, mixBuses]);

  const updateMixChannel = useCallback((id: string, patch: Partial<(typeof mixChannels)[0]>) => {
    proMixerEngine.updateChannel(id, patch);
    setMixChannels([...proMixerEngine.channels]);
    persist();
  }, [persist]);

  const updateMixBus = useCallback((id: string, patch: Partial<MixBus>) => {
    setMixBuses((prev) => {
      const next = busManagerCore.update(prev, id, patch);
      proMixerEngine.buses = next;
      return next;
    });
    persist();
  }, [persist]);

  const addMixBus = useCallback((name: string, kind: MixBus["kind"]) => {
    proMixerEngine.addBus(name, kind);
    setMixBuses([...proMixerEngine.buses]);
    persist();
  }, [persist]);

  const mixSuggestions = useMemo(() => mixAssistantCore.suggest(mixReport), [mixReport]);

  const dspGraph = useMemo(() => dspArchitectureCore.buildGraph(mixChannels.length, mixBuses.length), [mixChannels.length, mixBuses.length]);

  return useMemo(
    () => ({
      mixingPanel,
      setMixingPanel,
      mixChannels,
      mixBuses,
      selectedMixChannelId,
      setSelectedMixChannelId,
      updateMixChannel,
      updateMixBus,
      addMixBus,
      routingRoutes,
      connectRoute: (fromId, toBusId) => {
        routingMatrixCore.connect(fromId, toBusId);
        setRoutingRoutes([...routingMatrixCore.routes]);
        void omnimusicMixingApi.saveRouting(project.id, routingMatrixCore.routes).catch(() => undefined);
      },
      toggleRoute: (id) => {
        routingMatrixCore.toggle(id);
        setRoutingRoutes([...routingMatrixCore.routes]);
      },
      fxCatalog,
      addFxInsert: (channelId, pluginId) => {
        const ch = proMixerEngine.channels.find((c) => c.id === channelId);
        if (!ch) return;
        ch.inserts = fxRackCore.addInsert(ch.inserts, pluginId);
        setMixChannels([...proMixerEngine.channels]);
      },
      toggleFxBypass: (channelId, insertId) => {
        const ch = proMixerEngine.channels.find((c) => c.id === channelId);
        if (!ch) return;
        ch.inserts = fxRackCore.toggleBypass(ch.inserts, insertId);
        setMixChannels([...proMixerEngine.channels]);
      },
      masteringChain,
      setMasteringTarget: (target: MasteringTarget) => {
        const chain = masteringEngineCore.setTarget(target);
        setMasteringChain({ ...chain });
        void omnimusicMixingApi.saveMastering(project.id, chain).catch(() => undefined);
      },
      updateMastering: (patch) => {
        setMasteringChain((c) => {
          const next = { ...c, ...patch };
          masteringEngineCore.chain = next;
          void omnimusicMixingApi.saveMastering(project.id, next).catch(() => undefined);
          return next;
        });
      },
      meterState,
      spectrumFrame,
      mixReport,
      mixSuggestions,
      automationLanes,
      addAutomationLane: (targetId, param) => {
        automationCurvesCore.addLane(targetId, param);
        setAutomationLanes([...automationCurvesCore.lanes]);
        void omnimusicMixingApi.saveAutomation(project.id, automationCurvesCore.lanes).catch(() => undefined);
      },
      addAutomationPoint: (laneId, beat, value) => {
        automationCurvesCore.addPoint(laneId, beat, value, "bezier");
        setAutomationLanes([...automationCurvesCore.lanes]);
        void omnimusicMixingApi.saveAutomation(project.id, automationCurvesCore.lanes).catch(() => undefined);
      },
      mixPresets,
      applyMixPreset: (preset) => {
        if (preset.mastering) setMasteringChain((c) => ({ ...c, ...preset.mastering }));
        if (selectedMixChannelId && preset.channelStrip) updateMixChannel(selectedMixChannelId, preset.channelStrip);
      },
      referenceTracks,
      applyReference: (ref) => {
        const chain = masteringEngineCore.applyReferenceMatch(ref.targetLufs);
        setMasteringChain({ ...chain, referenceTrackId: ref.id });
      },
      dspGraph,
    }),
    [
      mixingPanel,
      mixChannels,
      mixBuses,
      selectedMixChannelId,
      updateMixChannel,
      updateMixBus,
      addMixBus,
      routingRoutes,
      fxCatalog,
      masteringChain,
      meterState,
      spectrumFrame,
      mixReport,
      mixSuggestions,
      automationLanes,
      mixPresets,
      referenceTracks,
      dspGraph,
      project.id,
      selectedMixChannelId,
    ],
  );
}
