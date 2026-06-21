"use client";

import { useMedicalDiagnosticStore, setMedicalFrameIndex } from "../../lib/medical-diagnostic-store";
import { analyzeMedicalStream } from "../../lib/medical-diagnostic-api";
import { applyMedicalAnalysis } from "../../lib/medical-diagnostic-store";

export function MedicalScanTimeline() {
  const { frameIndex, frameCount, settings, sessionId, assets } = useMedicalDiagnosticStore();
  const active = assets[0];
  const isVideo = active?.fileType === "video" || active?.source === "camera";

  const scrub = async (index: number) => {
    setMedicalFrameIndex(index);
    if (!isVideo) return;
    try {
      const payload = await analyzeMedicalStream({
        stream_source: active?.source ?? "upload",
        file_type: "video",
        manual_settings: {
          sensitivity: settings.sensitivity,
          contrast: settings.contrast,
          vascular_isolation: settings.vascularIsolation,
        },
        session_id: sessionId,
        frame_index: index,
        file_count: assets.length || 1,
      });
      applyMedicalAnalysis(payload);
    } catch {
      /* optional */
    }
  };

  return (
    <div className="omni-glass-panel flex h-full min-h-0 flex-col border-t border-purple-500/[0.12]">
      <header className="flex shrink-0 items-center justify-between px-3 py-1.5">
        <p className="omni-text-dusk text-[8px] font-bold uppercase tracking-wider">Frame timeline</p>
        <span className="omni-text-dusk font-mono text-[8px]">
          {frameIndex} / {frameCount}
        </span>
      </header>
      <div className="flex min-h-0 flex-1 flex-col justify-center px-3 pb-2">
        <input
          type="range"
          min={0}
          max={Math.max(1, frameCount - 1)}
          value={frameIndex}
          onChange={(e) => void scrub(Number(e.target.value))}
          className="w-full accent-[#00e5ff]"
          disabled={!isVideo && assets.length === 0}
        />
        <p className="omni-text-dusk mt-1 truncate text-[8px]">
          {isVideo ? "Scrub video — anomaly boxes update per frame" : "Upload video for frame scrubbing"}
        </p>
      </div>
    </div>
  );
}
