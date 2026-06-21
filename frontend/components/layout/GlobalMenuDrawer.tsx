"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import type { AppViewId } from "../../lib/app-views";
import {
  getGlobalMenuExtraTools,
  getGlobalMenuHome,
  getGlobalMenuMediaViews,
  getGlobalMenuToolGroups,
} from "../../lib/global-menu-tools";
import { NEURAL_CHATBOT_LABEL } from "../../lib/brand-labels";
import { useOmniMindEcosystemOptional } from "../../lib/omnimind-ecosystem-context";
import { useAppNavigationOptional } from "../../lib/app-navigation-context";
import type { OmniRouteId } from "../../lib/omni-tools";
import { getSovereignTool } from "../../lib/sovereign-tool-registry";
import { sovereignHrefForView } from "../../lib/sovereign-route-map";
import { cn } from "../../lib/utils";

interface GlobalMenuDrawerProps {
  isMenuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
  activeView: AppViewId;
  activeRoute: OmniRouteId | string;
  onSelectView: (id: AppViewId) => void;
  onSelectRoute: (id: OmniRouteId) => void;
}

/** Single deduplicated ☰ menu — no repeated tool names. */
export function GlobalMenuDrawer({
  isMenuOpen,
  onMenuOpenChange,
  activeView,
  activeRoute,
  onSelectView,
  onSelectRoute,
}: GlobalMenuDrawerProps) {
  const router = useRouter();
  const ecosystem = useOmniMindEcosystemOptional();
  const appNav = useAppNavigationOptional();
  const home = getGlobalMenuHome();
  const HomeIcon = home.icon;
  const mediaViews = getGlobalMenuMediaViews();
  const toolGroups = getGlobalMenuToolGroups();
  const extraTools = getGlobalMenuExtraTools();
  const close = useCallback(() => onMenuOpenChange(false), [onMenuOpenChange]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMenuOpen, close]);

  const runNavigation = useCallback(
    (action: () => void) => {
      try {
        action();
      } catch (error) {
        console.error("[OmniMind] menu navigation failed:", error);
      } finally {
        close();
      }
    },
    [close],
  );

  const backToHome = () => {
    runNavigation(() => {
      if (ecosystem) {
        void ecosystem.executeNavigateBack(`Back to ${NEURAL_CHATBOT_LABEL}`);
        appNav?.resetToDashboard();
        return;
      }
      appNav?.resetToDashboard();
      onSelectView("sovereign-core");
      onSelectRoute("dashboard");
    });
  };

  const pickView = (id: AppViewId) => {
    runNavigation(() => {
      const resolved = id === "omnistream" ? "omnimovies" : id;
      const href = sovereignHrefForView(resolved);
      if (href) {
        router.push(href);
        return;
      }
      if (appNav) {
        appNav.selectView(resolved);
        return;
      }
      onSelectView(resolved);
      if (resolved === "sovereign-core") {
        onSelectRoute("dashboard");
      } else if (resolved === "omnimap") {
        onSelectRoute("ai-omnimaps");
      }
    });
  };

  const navItemClass = (active: boolean) =>
    cn(
      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[10px] transition",
      active
        ? "omni-accent-bg font-medium omni-accent-text ring-1 omni-accent-border"
        : "hover:bg-white/[0.04]",
    );

  const homeActive = activeView === "sovereign-core" && activeRoute === "dashboard";

  return (
    <>
      <button
        type="button"
        aria-label="Close menu backdrop"
        className={cn(
          "fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] transition-opacity duration-300",
          isMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
      />

      <aside
        role="dialog"
        aria-modal={isMenuOpen}
        aria-label="Global navigation"
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-[min(280px,88vw)] flex-col overflow-hidden border-r backdrop-blur-lg",
          "transition-transform duration-300 ease-out omni-accent-border",
          isMenuOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none",
        )}
        style={{ background: "color-mix(in srgb, var(--omni-panel) 96%, black)" }}
      >
        <div className="shrink-0 border-b p-2 omni-accent-border">
          <button
            type="button"
            onClick={backToHome}
            className={cn(
              "flex w-full items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[10px] font-semibold omni-accent-border omni-accent-text omni-accent-bg",
              "transition hover:brightness-110",
            )}
          >
            <ArrowLeft className="h-3 w-3 shrink-0" />
            Back to {NEURAL_CHATBOT_LABEL}
          </button>
        </div>

        <nav
          className="history-scroll-hover min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-2"
          aria-label="All tools"
        >
          <p className="px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] omni-accent-text" style={{ opacity: 0.85 }}>
            Home
          </p>
          <ul className="mb-3 space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => pickView("sovereign-core")}
                className={navItemClass(homeActive)}
                style={!homeActive ? { color: "var(--omni-text-muted)" } : undefined}
              >
                <HomeIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{home.label}</span>
              </button>
            </li>
          </ul>

          <p className="px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] omni-accent-text" style={{ opacity: 0.85 }}>
            Media &amp; maps
          </p>
          <ul className="mb-3 space-y-0.5">
            {mediaViews.map((view) => {
              const Icon = view.icon;
              const active = activeView === view.id || (view.id === "omnimovies" && activeView === "omnistream");
              return (
                <li key={view.id}>
                  <button
                    type="button"
                    onClick={() => pickView(view.id)}
                    className={navItemClass(active)}
                    style={!active ? { color: "var(--omni-text-muted)" } : undefined}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{view.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {toolGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] omni-accent-text" style={{ opacity: 0.85 }}>
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.slugs.map((slug) => {
                  const tool = getSovereignTool(slug);
                  if (!tool) return null;
                  const Icon = tool.icon;
                  return (
                    <li key={slug}>
                      <Link
                        href={tool.href}
                        onClick={close}
                        title={tool.description}
                        className={navItemClass(false)}
                        style={{ color: "var(--omni-text-muted)" }}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
                        <span className="truncate">{tool.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {extraTools.length > 0 ? (
            <>
              <p className="px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] omni-accent-text" style={{ opacity: 0.85 }}>
                More tools
              </p>
              <ul className="space-y-0.5 pb-3">
                {extraTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <li key={tool.slug}>
                      <Link
                        href={tool.href}
                        onClick={close}
                        title={tool.description}
                        className={navItemClass(false)}
                        style={{ color: "var(--omni-text-muted)" }}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
                        <span className="truncate">{tool.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </nav>
      </aside>
    </>
  );
}
