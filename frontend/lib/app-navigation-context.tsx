"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { AppViewId } from "./app-views";
import type { OmniRouteId } from "./omni-tools";
import { useOmniMindEcosystemOptional } from "./omnimind-ecosystem-context";
import { normalizeHomeRoute } from "./normalize-home-route";
import {
  routeIdToUnifiedTool,
  unifiedToolNavigationHref,
  unifiedToolToAppView,
  unifiedToolToRouteId,
  unifiedToolUsesHomeShell,
  type UnifiedToolId,
} from "./unified-navigation";

function normalizeViewId(id: AppViewId): AppViewId {
  return id === "omnistream" ? "omnimovies" : id;
}

export type AppNavigationContextValue = {
  activeView: AppViewId;
  activeRoute: OmniRouteId | string;
  currentUnifiedTool: UnifiedToolId;
  selectView: (id: AppViewId) => void;
  selectRoute: (id: OmniRouteId) => void;
  selectUnifiedTool: (tool: UnifiedToolId) => void;
  backToNeuralChat: () => Promise<void>;
  resetToDashboard: () => void;
};

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null);

export function AppNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const ecosystem = useOmniMindEcosystemOptional();

  const [activeView, setActiveView] = useState<AppViewId>("sovereign-core");
  const [activeRoute, setActiveRoute] = useState<OmniRouteId | string>("dashboard");

  const currentUnifiedTool = useMemo(
    () => routeIdToUnifiedTool(String(activeRoute)),
    [activeRoute],
  );

  const resetToDashboard = useCallback(() => {
    setActiveView("sovereign-core");
    setActiveRoute("dashboard");
  }, []);

  const selectView = useCallback((id: AppViewId) => {
    try {
      const resolved = normalizeViewId(id);
      setActiveView(resolved);
      if (resolved === "sovereign-core") {
        setActiveRoute("dashboard");
      } else if (resolved === "omnimap") {
        setActiveRoute("ai-omnimaps");
      }
    } catch (error) {
      console.error("[OmniMind] view navigation failed:", error);
    }
  }, []);

  const selectRoute = useCallback((id: OmniRouteId) => {
    try {
      setActiveRoute(id);
      if (id === "ai-omnimaps") {
        setActiveView("omnimap");
      } else {
        setActiveView("sovereign-core");
      }
    } catch (error) {
      console.error("[OmniMind] route navigation failed:", error);
    }
  }, []);

  const selectUnifiedTool = useCallback(
    (tool: UnifiedToolId) => {
      try {
        if (tool === "neural-chat") {
          resetToDashboard();
          if (pathname !== "/") {
            router.push("/");
          }
          return;
        }

        const view = unifiedToolToAppView(tool);
        if (view) {
          const href = unifiedToolNavigationHref(tool);
          if (href) {
            router.push(href);
            return;
          }
        }

        if (unifiedToolUsesHomeShell(tool)) {
          const shellView = unifiedToolToAppView(tool);
          if (shellView) {
            setActiveView(shellView);
          }
          return;
        }

        const href = unifiedToolNavigationHref(tool);
        if (href) {
          router.push(href);
          return;
        }

        const nextRoute = unifiedToolToRouteId(tool);
        if (nextRoute) {
          setActiveRoute(nextRoute);
          setActiveView("sovereign-core");
        }
      } catch (error) {
        console.error("[OmniMind] tool navigation failed:", error);
      }
    },
    [pathname, resetToDashboard, router],
  );

  const backToNeuralChat = useCallback(async () => {
    try {
      resetToDashboard();
      if (ecosystem) {
        await ecosystem.executeNavigateBack("Back to Neural Chatbot");
        return;
      }
      const home = normalizeHomeRoute("/dashboard");
      if (pathname !== home) {
        router.push(home);
      }
    } catch (error) {
      console.error("[OmniMind] back navigation failed:", error);
      resetToDashboard();
      router.push("/");
    }
  }, [ecosystem, pathname, resetToDashboard, router]);

  useEffect(() => {
    setActiveView((v) => (v === "omnistream" ? "omnimovies" : v));
  }, []);

  useEffect(() => {
    const onDispatch = (e: Event) => {
      const target = normalizeHomeRoute(
        (e as CustomEvent<{ target_route?: string }>).detail?.target_route ?? "/",
      );
      if (target === "/" || target.startsWith("/?")) {
        resetToDashboard();
      }
    };
    window.addEventListener("omnimind:route-dispatch", onDispatch);
    return () => window.removeEventListener("omnimind:route-dispatch", onDispatch);
  }, [resetToDashboard]);

  const value = useMemo<AppNavigationContextValue>(
    () => ({
      activeView,
      activeRoute,
      currentUnifiedTool,
      selectView,
      selectRoute,
      selectUnifiedTool,
      backToNeuralChat,
      resetToDashboard,
    }),
    [
      activeView,
      activeRoute,
      currentUnifiedTool,
      selectView,
      selectRoute,
      selectUnifiedTool,
      backToNeuralChat,
      resetToDashboard,
    ],
  );

  return <AppNavigationContext.Provider value={value}>{children}</AppNavigationContext.Provider>;
}

export function useAppNavigation() {
  const ctx = useContext(AppNavigationContext);
  if (!ctx) {
    throw new Error("useAppNavigation must be used within AppNavigationProvider");
  }
  return ctx;
}

export function useAppNavigationOptional() {
  return useContext(AppNavigationContext);
}
