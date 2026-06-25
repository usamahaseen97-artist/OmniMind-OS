"use client";

import { Languages } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppNavigation } from "../lib/app-navigation-context";
import { AuthButton } from "../components/auth/AuthButton";
import { ThemeHub } from "../components/theme/ThemeHub";
import { FounderCredit } from "../components/layout/FounderCredit";
import { GlobalMenuDrawer } from "../components/layout/GlobalMenuDrawer";
import { MacroEngineTabs } from "../components/layout/MacroEngineTabs";
import { AppCommandRail } from "../components/layout/AppCommandRail";
import {
  DynamicEntertainmentWorkspace,
  DynamicFloatingChatHistoryPanel,
  DynamicSovereignCoreWorkspace,
  DynamicVoiceTranslatorModal,
} from "../components/layout/dynamic-home-shell";
import {
  appHeaderActions,
  appHeaderBar,
  headerTitleCluster,
} from "../lib/responsive-layout";
import { UndoBackButton } from "../components/layout/UndoBackButton";
import { shouldShowUndoBack } from "../lib/navigation-state";
import { getAppView } from "../lib/app-views";
import { getOmniTool } from "../lib/omni-tools";
import { fetchGatewayProviders, summarizeProviders } from "../lib/integration-providers";
import { fetchPlatformReadiness, type PlatformReadiness } from "../lib/readiness-api";
import { Button } from "../components/ui/button";
import { probeBackendOnline, resetBackendUrlCache } from "../lib/backend-url";
import { type OmniRouteId } from "../lib/omni-tools";
import { NEURAL_CHATBOT_LABEL, NEURAL_CHATBOT_TAGLINE } from "../lib/brand-labels";
import { cn } from "../lib/utils";
import { LiveEngineIndicator } from "../components/layout/LiveEngineIndicator";
import { ClientErrorBoundary } from "../components/layout/ClientErrorBoundary";
import { OmniMindHomeAppShell } from "../components/os/OmniMindHomeAppShell";

const GUEST_ID = "guest-founder";
const BACKEND_HEALTH_TIMEOUT_MS = 8000;
const BACKEND_FAST_PROBE_MS = 4000;

async function probeBackend(): Promise<boolean> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), BACKEND_HEALTH_TIMEOUT_MS);
  try {
    return await probeBackendOnline(ctrl.signal);
  } finally {
    window.clearTimeout(t);
  }
}

async function probePlatform(): Promise<PlatformReadiness | null> {
  const ctrl = new AbortController();
  const t = window.setTimeout(() => ctrl.abort(), BACKEND_HEALTH_TIMEOUT_MS);
  try {
    const data = await fetchPlatformReadiness(ctrl.signal);
    window.clearTimeout(t);
    return data;
  } catch {
    window.clearTimeout(t);
    return null;
  }
}

export default function OmniMindApp() {
  const {
    activeView,
    activeRoute,
    selectView,
    selectRoute,
    resetToDashboard,
  } = useAppNavigation();
  const [userId, setUserId] = useState(GUEST_ID);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [readiness, setReadiness] = useState<PlatformReadiness | null>(null);
  const [providerSummary, setProviderSummary] = useState<string | null>(null);
  const [translatorOpen, setTranslatorOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | undefined>();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const commandRailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resetBackendUrlCache();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pull = async () => {
      const ok = await probeBackend();
      if (!cancelled) setBackendOnline(ok);

      const readiness = await probePlatform();
      if (!cancelled) {
        setReadiness(readiness);
        if (readiness?.api_online !== false) {
          setBackendOnline(true);
        }
      }

      const providers = await fetchGatewayProviders();
      if (!cancelled) {
        setProviderSummary(summarizeProviders(providers));
        if (providers?.secure) {
          setBackendOnline(true);
        }
      }
    };
    void pull();
    const fastId = window.setInterval(() => void pull(), BACKEND_FAST_PROBE_MS);
    const slowId = window.setInterval(() => void pull(), 45000);
    const stopFast = window.setTimeout(() => window.clearInterval(fastId), 60000);
    return () => {
      cancelled = true;
      window.clearInterval(fastId);
      window.clearInterval(slowId);
      window.clearTimeout(stopFast);
    };
  }, []);

  const handleSelectView = useCallback(
    (id: Parameters<typeof selectView>[0]) => {
      try {
        setIsMenuOpen(false);
        setIsHistoryOpen(false);
        selectView(id);
      } catch (error) {
        console.error("[OmniMind] view navigation failed:", error);
        setIsMenuOpen(false);
      }
    },
    [selectView],
  );

  const handleSelectRoute = useCallback(
    (id: OmniRouteId) => {
      try {
        selectRoute(id);
        setIsMenuOpen(false);
      } catch (error) {
        console.error("[OmniMind] route navigation failed:", error);
        setIsMenuOpen(false);
      }
    },
    [selectRoute],
  );

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      setActiveSessionId(sessionId);
      resetToDashboard();
      setIsMenuOpen(false);
      setIsHistoryOpen(false);
    },
    [resetToDashboard],
  );

  const handleNewChat = useCallback(() => {
    setActiveSessionId(undefined);
    resetToDashboard();
    setIsHistoryOpen(false);
  }, [resetToDashboard]);

  const handleUndoToSovereign = useCallback(() => {
    resetToDashboard();
    setIsMenuOpen(false);
    setIsHistoryOpen(false);
  }, [resetToDashboard]);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen((open) => {
      if (!open) setIsHistoryOpen(false);
      return !open;
    });
  }, []);

  const appView = getAppView(activeView);
  const isSovereignWorkspace =
    activeView === "sovereign-core" || activeView === "omnimap";
  const sovereignRouteId =
    activeView === "omnimap" ? ("ai-omnimaps" as OmniRouteId) : activeRoute;
  const isGeneralChatView = isSovereignWorkspace;
  const isPureDashboardChat = isGeneralChatView && activeRoute === "dashboard";
  const isFullScreenSovereignTool =
    isSovereignWorkspace && activeRoute !== "dashboard" && getOmniTool(activeRoute).kind !== "dashboard";
  const showUndoBack = shouldShowUndoBack(activeView, activeRoute);

  const mongoLabel =
    readiness?.mongodb?.connected === true
      ? readiness.mongodb.mode === "in_memory_fallback"
        ? "Mongo: memory"
        : "Mongo: live"
      : readiness === null && backendOnline
        ? "Mongo: …"
        : "Mongo: off";

  const statusTitle = [
    providerSummary ?? "Live Engine Secure — automatic provider routing",
    readiness?.providers
      ?.filter((p) => p.configured)
      .map((p) => `${p.tool}: ${p.provider_label}`)
      .join("\n"),
    readiness?.publish_ready ? "MongoDB persistent — OK" : "",
    mongoLabel,
    ...(readiness?.hints ?? []),
  ]
    .filter(Boolean)
    .join("\n");

  const useUnifiedHomeShell = isSovereignWorkspace && !isFullScreenSovereignTool;

  return (
    <ClientErrorBoundary>
    {useUnifiedHomeShell ? (
    <>
      <OmniMindHomeAppShell />
      <DynamicVoiceTranslatorModal open={translatorOpen} onClose={() => setTranslatorOpen(false)} />
      <DynamicFloatingChatHistoryPanel
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        toggleRef={commandRailRef}
        userId={userId}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />
    </>
    ) : (
    <div className="omni-app-shell box-border flex h-screen max-h-[100dvh] w-full flex-col overflow-x-hidden overflow-y-hidden bg-[#07090f] text-zinc-100">
      <DynamicVoiceTranslatorModal open={translatorOpen} onClose={() => setTranslatorOpen(false)} />

      <GlobalMenuDrawer
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        activeView={activeView}
        activeRoute={activeRoute}
        onSelectView={handleSelectView}
        onSelectRoute={handleSelectRoute}
      />

      <div className="flex min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-hidden">
        <main className="dashboard-viewport relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-x-hidden overflow-y-hidden">
          <DynamicFloatingChatHistoryPanel
            open={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            toggleRef={commandRailRef}
            userId={userId}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
          />

          {!isPureDashboardChat && !isFullScreenSovereignTool ? (
          <header className={cn(appHeaderBar, isGeneralChatView && activeRoute === "dashboard" && "border-b border-white/[0.04] bg-[#0B0F19]/80")}>
            <AppCommandRail
              isMenuOpen={isMenuOpen}
              onMenuToggle={handleMenuToggle}
              railRef={commandRailRef}
            />

            <div className={cn(headerTitleCluster, "px-0.5 sm:px-1")}>
              {showUndoBack ? (
                <UndoBackButton onClick={handleUndoToSovereign} className="h-8 w-8 shrink-0" />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-zinc-100">
                  {isGeneralChatView && activeRoute !== "dashboard"
                    ? getOmniTool(activeRoute).name
                    : isGeneralChatView
                      ? NEURAL_CHATBOT_LABEL
                      : appView.label}
                </p>
                <p className="truncate text-[10px] text-zinc-500">
                  {isGeneralChatView && activeRoute !== "dashboard"
                    ? getOmniTool(activeRoute).tagline
                    : isGeneralChatView
                      ? NEURAL_CHATBOT_TAGLINE
                      : appView.tagline}
                  <LiveEngineIndicator
                    active={backendOnline !== false}
                    className="ml-2"
                    title={statusTitle}
                  />
                  {backendOnline === false ? (
                    <span
                      className="ml-1 text-[9px] text-amber-400/90"
                      title="API reconnecting — chat uses resilient client templates"
                    >
                      API reconnecting
                    </span>
                  ) : null}
                </p>
              </div>
            </div>

            <div className={appHeaderActions}>
              <ThemeHub />
              <MacroEngineTabs
                activeView={activeView}
                onSelect={handleSelectView}
                className="min-w-0 max-w-full shrink"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTranslatorOpen(true)}
                title="Voice Translator Matrix"
                className="h-7 w-7 border-emerald-500/20 text-zinc-500 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-[#00FF87]"
              >
                <Languages className="h-4 w-4" />
              </Button>
              <AuthButton onUserChange={(id) => setUserId(id ?? GUEST_ID)} />
            </div>
          </header>
          ) : null}

          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            {isSovereignWorkspace ? (
              <DynamicSovereignCoreWorkspace
                key={sovereignRouteId}
                routeId={sovereignRouteId}
                onSelectRoute={handleSelectRoute}
                onSelectView={handleSelectView}
                userId={userId}
                conversationId={activeSessionId}
                onConversationId={setActiveSessionId}
                displayName="Usama"
                onNewChat={handleNewChat}
                onMenuToggle={handleMenuToggle}
                secureNodeActive={backendOnline !== false}
                onSearchChats={() => setIsHistoryOpen(true)}
                onImagesShortcut={() => {
                  resetToDashboard();
                }}
                onLibrary={() => setIsHistoryOpen(true)}
              />
            ) : (
              <DynamicEntertainmentWorkspace key={activeView} viewId={activeView} userId={userId} />
            )}
          </div>
        </main>
      </div>

      {!isPureDashboardChat && !isFullScreenSovereignTool ? <FounderCredit /> : null}
    </div>
    )}
    </ClientErrorBoundary>
  );
}
