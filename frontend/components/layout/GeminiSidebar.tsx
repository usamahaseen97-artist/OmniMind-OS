"use client";

import {
  Folder,
  Image as ImageIcon,
  Menu,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "../../lib/utils";

export type OmniMindTab = "new-chat" | "history" | "images" | "library";

/** @deprecated use OmniMindTab */
export type GeminiSidebarAction = OmniMindTab;

interface GeminiSidebarProps {
  active?: OmniMindTab;
  onNewChat?: () => void;
  onSearchChats?: () => void;
  onImages?: () => void;
  onLibrary?: () => void;
  onMenuToggle?: () => void;
  profileInitial?: string;
  profileName?: string;
  className?: string;
}

const NAV_ITEMS: {
  id: OmniMindTab;
  label: string;
  icon: typeof Sparkles;
}[] = [
  { id: "new-chat", label: "New Engine", icon: Sparkles },
  { id: "history", label: "Past Sessions", icon: MessageSquare },
  { id: "images", label: "Visual Studio", icon: ImageIcon },
  { id: "library", label: "Data Stack", icon: Folder },
];

function SidebarTooltip({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute left-14 z-30 origin-left scale-0 whitespace-nowrap rounded border border-[#26262b] bg-[#1a1a1e] px-2.5 py-1.5 text-xs text-gray-300 shadow-xl transition-all duration-150 group-hover:scale-100">
      {label}
    </div>
  );
}

/** Clean luxury rail — thin-line icons, matte charcoal */
export function GeminiSidebar({
  active = "new-chat",
  onNewChat,
  onSearchChats,
  onImages,
  onLibrary,
  onMenuToggle,
  profileInitial = "U",
  profileName = "Profile",
  className,
}: GeminiSidebarProps) {
  const handlers: Record<OmniMindTab, (() => void) | undefined> = {
    "new-chat": onNewChat,
    history: onSearchChats,
    images: onImages,
    library: onLibrary,
  };

  return (
    <aside
      className={cn(
        "flex h-full w-16 shrink-0 flex-col items-center justify-between border-r border-[#26262b] bg-[#1a1a1e] py-5",
        className,
      )}
      aria-label="OmniMind navigation"
    >
      <div className="flex w-full flex-col items-center gap-5">
        <button
          type="button"
          title="Menu"
          aria-label="Open menu"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-500 transition-colors duration-200 hover:text-gray-300"
        >
          <Menu size={18} strokeWidth={1.5} />
        </button>

        <div className="mt-2 flex w-full flex-col items-center gap-3 px-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                onClick={handlers[id]}
                className={cn(
                  "group relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300",
                  isActive
                    ? "border border-[#3e3e46] bg-[#2b2b30] text-white shadow-md"
                    : "text-gray-500 hover:bg-[#222226] hover:text-gray-200",
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <SidebarTooltip label={label} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-4 px-2 pb-1">
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          className="group relative rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-[#222226] hover:text-gray-300"
        >
          <Settings size={18} strokeWidth={1.5} />
          <SidebarTooltip label="Settings" />
        </button>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#3e3e46] bg-[#2b2b30] text-xs font-medium tracking-wide text-gray-300 shadow-sm"
          title={`${profileName} — Profile`}
        >
          {profileInitial.charAt(0).toUpperCase()}
        </div>
      </div>
    </aside>
  );
}
