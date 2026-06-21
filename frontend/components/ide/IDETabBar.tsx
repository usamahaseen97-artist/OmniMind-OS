"use client";

import { X } from "lucide-react";
import { IDE_TOP_TABS } from "../../lib/omnimind-ide-config";
import { useIDE } from "./IDEProvider";
import { cn } from "../../lib/utils";

export function IDETabBar() {
  const { topTab, setTopTab } = useIDE();

  return (
    <div
      className="flex h-9 shrink-0 items-end gap-0 border-b px-1"
      style={{ borderColor: "var(--omni-border)", background: "var(--omni-bg)" }}
    >
      {IDE_TOP_TABS.map((tab) => {
        const active = topTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setTopTab(tab.id)}
            className={cn(
              "group relative flex max-w-[220px] items-center gap-2 rounded-t-md border border-b-0 px-3 py-1.5 text-[11px] transition",
              active ? "omni-accent-text" : "hover:bg-white/[0.03]",
            )}
            style={{
              borderColor: active ? "var(--omni-border)" : "transparent",
              background: active ? "var(--omni-panel-alt)" : "transparent",
              color: active ? undefined : "var(--omni-text-muted)",
            }}
          >
            <span className="truncate">{tab.label}</span>
            {active ? (
              <span
                className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ background: "var(--omni-accent)" }}
                title="Active"
              />
            ) : null}
            {!active ? <X className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-40" /> : null}
          </button>
        );
      })}
    </div>
  );
}
