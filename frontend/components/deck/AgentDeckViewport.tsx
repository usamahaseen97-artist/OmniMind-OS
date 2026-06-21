"use client";

import { useEffect } from "react";
import type { AgentDeckSlot } from "../../lib/agent-deck-slot";
import { ensureAgentDeckRuntime } from "../../lib/agent-live-deck-store";
import { deckSurface } from "../../lib/deck-interactive";
import { DeckChartsMock } from "./DeckChartsMock";
import { DeckIdlePanel } from "./DeckIdlePanel";
import { DeckVfxMock } from "./DeckVfxMock";
import { DeckArchitecturePanel } from "./panels/DeckArchitecturePanel";
import { DeckAnalyticsPanel } from "./panels/DeckAnalyticsPanel";
import { DeckCreativePanel } from "./panels/DeckCreativePanel";
import { DeckDevOpsPanel } from "./panels/DeckDevOpsPanel";
import { DeckGamePanel } from "./panels/DeckGamePanel";
import { DeckMapsPanel } from "./panels/DeckMapsPanel";
import { DeckMarketingPanel } from "./panels/DeckMarketingPanel";
import { DeckMedicalPanel } from "./panels/DeckMedicalPanel";
import { DeckMetaPanel } from "./panels/DeckMetaPanel";
import { DeckNasaPanel } from "./panels/DeckNasaPanel";
import { DeckTradingPanel } from "./panels/DeckTradingPanel";

interface AgentDeckViewportProps {
  slot: AgentDeckSlot;
  routeId?: string;
}

export function AgentDeckViewport({ slot, routeId }: AgentDeckViewportProps) {
  useEffect(() => {
    if (routeId) ensureAgentDeckRuntime(routeId);
  }, [routeId]);

  const panel = (() => {
    switch (slot) {
      case "devops":
        return <DeckDevOpsPanel routeId={routeId} />;
      case "vfx":
        return <DeckVfxMock />;
      case "creative":
        return <DeckCreativePanel />;
      case "architecture":
        return <DeckArchitecturePanel />;
      case "marketing":
        return <DeckMarketingPanel />;
      case "analytics":
        return <DeckAnalyticsPanel />;
      case "trading":
        return <DeckTradingPanel />;
      case "medical":
        return <DeckMedicalPanel />;
      case "game":
        return <DeckGamePanel />;
      case "nasa":
        return <DeckNasaPanel />;
      case "maps":
        return <DeckMapsPanel />;
      case "meta":
        return <DeckMetaPanel />;
      case "idle":
      default:
        return <DeckIdlePanel />;
    }
  })();

  return <div className={deckSurface}>{panel}</div>;
}
