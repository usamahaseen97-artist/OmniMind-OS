"use client";

import { SlidersHorizontal } from "lucide-react";
import { setMedicalSettings, useMedicalSettings } from "../../lib/medical-diagnostic-store";

interface MedicalManualControlsProps {
  onSettingsChange: () => void;
}

export function MedicalManualControls({ onSettingsChange }: MedicalManualControlsProps) {
  const settings = useMedicalSettings();

  const patch = (p: Partial<typeof settings>) => {
    setMedicalSettings(p);
    onSettingsChange();
  };

  return (
    <div className="omni-studio-header shrink-0 border-b border-purple-500/[0.12]">
      <header className="flex items-center gap-2 px-3 py-2">
        <SlidersHorizontal className="omni-cyber-cyan h-3.5 w-3.5" />
        <div className="min-w-0">
          <p className="truncate text-[9px] font-bold uppercase tracking-wider text-[#e1dbf5]">
            Manual diagnostic controls
          </p>
          <p className="omni-text-dusk text-[8px]">Sensitivity · contrast · vascular layer</p>
        </div>
      </header>
      <div className="grid gap-2 px-3 pb-3">
        <label className="omni-text-dusk min-w-0 text-[8px]">
          AI diagnostic sensitivity
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={settings.sensitivity}
            onChange={(e) => patch({ sensitivity: Number(e.target.value) })}
            className="mt-1 w-full accent-[#00e5ff]"
          />
          <span className="omni-cyber-cyan">{Math.round(settings.sensitivity * 100)}%</span>
        </label>
        <label className="omni-text-dusk min-w-0 text-[8px]">
          Image contrast / density
          <input
            type="range"
            min={0.4}
            max={2.2}
            step={0.05}
            value={settings.contrast}
            onChange={(e) => patch({ contrast: Number(e.target.value) })}
            className="mt-1 w-full accent-[#00e5ff]"
          />
          <span className="text-[#e1dbf5]">{settings.contrast.toFixed(2)}</span>
        </label>
        <label className="omni-text-dusk min-w-0 text-[8px]">
          Vascular layer isolation
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.vascularIsolation}
            onChange={(e) => patch({ vascularIsolation: Number(e.target.value) })}
            className="mt-1 w-full accent-[#00e5ff]"
          />
          <span className="text-[#e1dbf5]">{Math.round(settings.vascularIsolation * 100)}%</span>
        </label>
      </div>
    </div>
  );
}
