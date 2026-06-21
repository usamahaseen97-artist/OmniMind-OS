"use client";

import { useRef, useState } from "react";
import { ChevronDown, Palette, Shuffle, Sparkles } from "lucide-react";
import { PRESET_THEMES, applyThemeTokens, themeFromCustomColor } from "../../lib/theme-engine";
import { useOmniTheme } from "./ThemeProvider";
import { cn } from "../../lib/utils";

const PRESET_ORDER = ["deep-purple", "gold-accent"] as const;

export function ThemeHub() {
  const { tokens, presetId, customColor, setPreset, setCustomColor, triggerAutoTheme } = useOmniTheme();
  const [open, setOpen] = useState(false);
  const [picker, setPicker] = useState(customColor);
  const ref = useRef<HTMLDivElement>(null);

  const applyThemeFast = (mode: "preset" | "custom", value: string) => {
    // Direct CSS variable mutation for instant visual updates (bypasses UI re-render lag).
    if (mode === "preset" && value in PRESET_THEMES) {
      applyThemeTokens(PRESET_THEMES[value as keyof typeof PRESET_THEMES]);
      return;
    }
    if (mode === "custom") {
      applyThemeTokens(themeFromCustomColor(value));
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="omni-accent-border omni-glow-sm flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition hover:brightness-110"
        style={{ color: tokens.accent, background: "var(--omni-panel)" }}
      >
        <Sparkles className="h-3 w-3" />
        Theme Hub
        <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
      </button>

      {open ? (
        <>
          <button type="button" aria-label="Close theme hub" className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full z-[210] mt-1 w-72 rounded-xl border p-3 shadow-2xl"
            style={{
              background: tokens.panelAlt,
              borderColor: tokens.border,
              boxShadow: `0 16px 48px ${tokens.accentGlow}`,
            }}
          >
            <p className="mb-2 text-[9px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
              Preset Themes
            </p>
            <div className="space-y-1.5">
              {PRESET_ORDER.map((key) => {
                const preset = PRESET_THEMES[key];
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      applyThemeFast("preset", key);
                      setPreset(key);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] transition hover:brightness-110",
                      presetId === preset.id && "ring-1",
                    )}
                    style={{
                      borderColor: preset.border,
                      background: preset.panel,
                      color: preset.text,
                      ...(presetId === preset.id ? { ringColor: preset.accent } : {}),
                    }}
                  >
                    <span className="h-4 w-4 shrink-0 rounded-full border" style={{ background: preset.accent, borderColor: preset.border }} />
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <p className="mb-2 mt-3 text-[9px] font-bold uppercase tracking-wider" style={{ color: tokens.textMuted }}>
              Custom Accent
            </p>
            <div className="flex items-center gap-2 rounded-lg border p-2" style={{ borderColor: tokens.border }}>
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
                style={{ borderColor: tokens.border, color: tokens.text }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                triggerAutoTheme();
                setOpen(false);
              }}
              className="omni-deploy-btn mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[11px] font-bold uppercase tracking-wider"
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
