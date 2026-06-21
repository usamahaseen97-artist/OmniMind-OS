"use client";

import { useState, type ReactNode } from "react";
import {
  ChevronLeft,
  Folder,
  Image,
  Menu,
  MessageSquare,
  Search,
  Settings,
} from "lucide-react";
import {
  OMNIMIND_NAV_TREE,
  type UnifiedToolId,
  type UtilityTab,
} from "../../lib/unified-navigation";
import { useAppNavigationOptional } from "../../lib/app-navigation-context";
import { cn } from "../../lib/utils";

const UTILITY_TABS: { id: UtilityTab; icon: typeof MessageSquare }[] = [
  { id: "chat", icon: MessageSquare },
  { id: "search", icon: Search },
  { id: "media", icon: Image },
  { id: "docs", icon: Folder },
];

interface OmniMindCoreLayoutProps {
  currentTool: UnifiedToolId;
  onToolChange: (tool: UnifiedToolId) => void;
  activeTab: UtilityTab;
  onTabChange: (tab: UtilityTab) => void;
  children: ReactNode;
  secureNodeActive?: boolean;
  displayName?: string;
  onGlobalMenuToggle?: () => void;
  defaultMenuOpen?: boolean;
}

/** Core shell — 19-tool tree, sliding panel, image_20 layout */
export function OmniMindCoreLayout({
  currentTool,
  onToolChange,
  activeTab,
  onTabChange,
  children,
  secureNodeActive = true,
  displayName = "U",
  onGlobalMenuToggle,
  defaultMenuOpen = true,
}: OmniMindCoreLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(defaultMenuOpen);
  const appNav = useAppNavigationOptional();
  const profileInitial = displayName.charAt(0).toUpperCase();

  const handleBackToChat = () => {
    try {
      if (appNav) {
        void appNav.backToNeuralChat();
        onTabChange("chat");
        return;
      }
      onToolChange("neural-chat");
      onTabChange("chat");
    } catch (error) {
      console.error("[OmniMind] back navigation failed:", error);
      onToolChange("neural-chat");
      onTabChange("chat");
    }
  };

  const handleToolPick = (tool: UnifiedToolId) => {
    try {
      if (appNav) {
        appNav.selectUnifiedTool(tool);
      } else {
        onToolChange(tool);
      }
      setIsMenuOpen(true);
    } catch (error) {
      console.error("[OmniMind] tool pick failed:", error);
      onToolChange(tool);
      setIsMenuOpen(true);
    }
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#0a0d12] font-sans text-[#e3e3e3] antialiased">
      <div className="pointer-events-none absolute top-0 left-0 h-[40vw] w-[40vw] rounded-full bg-gradient-to-br from-[#c85a80]/[0.02] to-[#732c45]/[0.02] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[45vw] w-[45vw] rounded-full bg-gradient-to-tr from-[#003b75]/[0.04] to-[#70539b]/[0.02] blur-[140px]" />

      <aside className="z-40 flex h-full w-16 shrink-0 flex-col items-center justify-between border-r border-white/[0.03] bg-[#10141d] py-4 shadow-[2px_0_15px_rgba(0,0,0,0.4)]">
        <div className="flex w-full flex-col items-center gap-5">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close tool menu" : "Open tool menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
            className={cn(
              "rounded-xl p-2.5 transition-all duration-200",
              isMenuOpen
                ? "border border-cyan-500/30 bg-zinc-800/80 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                : "text-gray-400 hover:bg-white/[0.02] hover:text-gray-200",
            )}
          >
            <Menu size={18} strokeWidth={1.8} />
          </button>

          <div className="mt-2 flex w-full flex-col items-center gap-2.5 px-2">
            {UTILITY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-label={tab.id}
                  aria-current={isSelected ? "page" : undefined}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-xl transition-all",
                    isSelected
                      ? "border border-cyan-500/30 bg-zinc-800/80 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                      : "text-gray-500 hover:bg-white/[0.01] hover:text-gray-300",
                  )}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {isSelected ? (
                    <span className="absolute right-0 h-4 w-[3px] rounded-l-full bg-cyan-400/80" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3.5 px-2 pb-1">
          <button
            type="button"
            aria-label="Settings"
            onClick={onGlobalMenuToggle}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/[0.01] hover:text-gray-300"
          >
            <Settings size={18} strokeWidth={1.5} />
          </button>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] bg-gradient-to-b from-[#23242a] to-[#18191e] text-xs font-semibold text-gray-400 shadow-inner"
            title={displayName}
          >
            {profileInitial}
          </div>
        </div>
      </aside>

      <nav
        className={cn(
          "z-30 flex h-full shrink-0 flex-col overflow-hidden border-r border-white/[0.02] bg-[#0d121b] shadow-[5px_0_25px_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out",
          isMenuOpen ? "w-64 opacity-100" : "pointer-events-none w-0 border-r-0 opacity-0",
        )}
        aria-hidden={!isMenuOpen}
      >
        <div className="min-w-[240px] border-b border-white/[0.02] p-4">
          <button
            type="button"
            onClick={handleBackToChat}
            className="flex w-full items-center gap-2 rounded-xl border border-white/[0.03] bg-[#1e1f25] px-3 py-2 text-xs font-medium text-gray-400 transition-all hover:bg-[#25262e] hover:text-white"
          >
            <ChevronLeft size={14} />
            <span>Back to Neural Chatbot</span>
          </button>
        </div>

        <div className="custom-scrollbar min-w-[240px] flex-1 space-y-5 overflow-y-auto p-4">
          {OMNIMIND_NAV_TREE.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-gray-600 uppercase">
                {cat.category}
              </h3>
              <div className="space-y-0.5">
                {cat.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isCurrent = currentTool === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleToolPick(item.id)}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all",
                        isCurrent
                          ? "border border-cyan-500/30 bg-zinc-800/80 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                          : "border-transparent bg-transparent text-gray-500 hover:bg-white/[0.01] hover:text-gray-300",
                      )}
                    >
                      {isCurrent ? (
                        <div className="absolute top-1/4 bottom-1/4 left-0 w-[2px] rounded-r-md bg-gradient-to-b from-cyan-400/80 to-blue-500/70" />
                      ) : null}
                      <ItemIcon
                        size={14}
                        className={cn("shrink-0", isCurrent ? "text-gray-200" : "text-gray-600")}
                      />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="flex h-full min-w-0 flex-1 flex-col bg-[#0b1018]">
        <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-white/[0.02] bg-[#0d131d]/95 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="rounded border border-white/[0.03] bg-white/[0.02] px-2 py-0.5 font-mono text-[10px] tracking-wider text-gray-500 uppercase">
              System Console
            </span>
          </div>

          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xs font-bold tracking-[0.5em] text-gray-300 uppercase select-none">
            OMNIMIND
          </h1>

          <div className="flex items-center gap-2 font-mono text-[9px] tracking-wider text-gray-600">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                secureNodeActive ? "bg-emerald-600/70" : "bg-amber-600",
              )}
            />
            <span>{secureNodeActive ? "SECURE SYSTEM MODULE" : "RECONNECTING"}</span>
          </div>
        </header>

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-[#0b1018] to-[#080c14]">
          {children}
        </main>
      </div>
    </div>
  );
}

export { OMNIMIND_NAV_TREE as navigationTree, toolDisplayName } from "../../lib/unified-navigation";
