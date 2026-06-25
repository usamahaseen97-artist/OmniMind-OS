"use client";

import { useRef, useState } from "react";
import { ChevronDown, Palette, Shuffle, Sparkles } from "lucide-react";
import {
  PRESET_THEMES,
  THEME_HUB_ORDER,
  applyThemeTokens,
  themeFromCustomColor,
} from "../../lib/theme-engine";
import { ENTERPRISE_THEMES } from "../../design-system/themes/presets";
import type { EnterpriseThemeId } from "../../design-system/themes/presets";
import { applyDesignSystemTheme } from "../../design-system/themes/apply";
import { useOmniTheme } from "./ThemeProvider";
import { cn } from "../../lib/utils";

export function ThemeHub() {
  const { tokens, presetId, customColor, setPreset, setCustomColor, triggerAutoTheme } = useOmniTheme();
  const [open, setOpen] = useState(false);
  const [picker, setPicker] = useState(customColor);
  const ref = useRef<HTMLDivElement>(null);

  const applyThemeFast = (id: EnterpriseThemeId | "custom", value?: string) => {
    if (id !== "custom" && id in ENTERPRISE_THEMES) {
      applyDesignSystemTheme(ENTERPRISE_THEMES[id]);
      return;
    }
    if (id === "custom" && value) {
      applyThemeTokens(themeFromCustomColor(value));
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-[color:var(--omni-ds-border-subtle)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition hover:brightness-110"
        style={{ color: tokens.accent, background: "var(--omni-ds-bg-panel)" }}
      >
        <Sparkles className="h-3 w-3" />
        Theme Hub
        <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <>
          <button type="button" aria-label="Close theme hub" className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full z-[210] mt-1 w-80 rounded-xl border p-3 shadow-2xl"
            style={{
              background: "var(--omni-ds-bg-panel-elevated)",
              borderColor: "var(--omni-ds-border-subtle)",
              boxShadow: "var(--omni-ds-elevation-xl)",
            }}
          >
            <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-[color:var(--omni-ds-text-muted)]">
              Enterprise Themes
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {THEME_HUB_ORDER.map((key) => {
                const preset = PRESET_THEMES[key];
                const ds = ENTERPRISE_THEMES[key];
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      applyThemeFast(key);
                      setPreset(key);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-[10px] transition hover:brightness-110",
                      presetId === preset.id && "ring-1 ring-[color:var(--omni-ds-accent-primary)]",
                    )}
                    style={{
                      borderColor: ds.border,
                      background: ds.panel,
                      color: ds.text,
                    }}
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border"
                      style={{ background: ds.accent, borderColor: ds.border }}
                    />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-3 text-[9px] font-bold uppercase tracking-wider text-[color:var(--omni-ds-text-muted)]">
              Custom Accent
            </p>
            <div
              className="flex items-center gap-2 rounded-lg border p-2"
              style={{ borderColor: "var(--omni-ds-border-subtle)" }}
            >
              <Palette className="h-4 w-4 shrink-0" style={{ color: tokens.accent }} />
              <input
                type="color"
                value={picker}
                onChange={(e) => {
                  setPicker(e.target.value);
                  applyThemeFast("custom", e.target.value);
                  setCustomColor(e.target.value);
                }}
                className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent"
              />
              <input
                type="text"
                value={picker}
                onChange={(e) => setPicker(e.target.value)}
                onBlur={() => {
                  applyThemeFast("custom", picker);
                  setCustomColor(picker);
                }}
                className="min-w-0 flex-1 rounded border bg-black/30 px-2 py-1 font-mono text-[10px]"
                style={{ borderColor: "var(--omni-ds-border-subtle)", color: "var(--omni-ds-text-primary)" }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                triggerAutoTheme();
                setOpen(false);
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[color:var(--omni-ds-accent-primary)]/15 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[color:var(--omni-ds-text-accent)] hover:brightness-110"
            >
              <Shuffle className="h-4 w-4" />
              Auto-Theme Matrix
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
