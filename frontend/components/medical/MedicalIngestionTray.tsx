"use client";

import { Camera, FileUp, Scan, Video } from "lucide-react";
import { useCallback, useRef } from "react";
import {
  addMedicalAsset,
  removeMedicalAsset,
  setActiveMedicalAsset,
  setMedicalCameraActive,
  useMedicalDiagnosticStore,
} from "../../lib/medical-diagnostic-store";
import { analyzeMedicalStream, diagnoseMedicalUpload } from "../../lib/medical-diagnostic-api";
import { applyMedicalAnalysis } from "../../lib/medical-diagnostic-store";
import { cn } from "../../lib/utils";

function inferFileType(name: string): "dicom" | "video" | "image" {
  const low = name.toLowerCase();
  if (low.endsWith(".dcm") || low.endsWith(".dicom")) return "dicom";
  if (low.endsWith(".mp4") || low.endsWith(".webm") || low.endsWith(".mov")) return "video";
  return "image";
}

const BADGE: Record<string, string> = {
  dicom: "DICOM",
  video: "MP4",
  image: "IMG",
};

export function MedicalIngestionTray() {
  const { assets, activeAssetId, settings, sessionId, cameraActive } = useMedicalDiagnosticStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const runAnalyze = useCallback(
    async (source: "camera" | "upload", fileType: "dicom" | "video" | "image", count: number) => {
      try {
        const payload = await analyzeMedicalStream({
          stream_source: source,
          file_type: fileType,
          manual_settings: {
            sensitivity: settings.sensitivity,
            contrast: settings.contrast,
            vascular_isolation: settings.vascularIsolation,
          },
          session_id: sessionId,
          file_count: count,
        });
        applyMedicalAnalysis(payload);
      } catch {
        /* backend optional */
      }
    },
    [sessionId, settings],
  );

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach((file) => {
      const fileType = inferFileType(file.name);
      const url = URL.createObjectURL(file);
      addMedicalAsset({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        fileType,
        source: "upload",
        objectUrl: url,
        thumbnailUrl: fileType === "image" ? url : undefined,
      });
      void diagnoseMedicalUpload(file).catch(() => undefined);
    });
    void runAnalyze("upload", inferFileType(files[0]!.name), assets.length + files.length);
  };

  const toggleCamera = async () => {
    if (cameraActive && streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMedicalCameraActive(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setMedicalCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play();
      }
      addMedicalAsset({
        id: `live-${Date.now()}`,
        name: "Live endoscopy feed",
        fileType: "video",
        source: "camera",
        objectUrl: "",
      });
      void runAnalyze("camera", "video", assets.length + 1);
    } catch {
      setMedicalCameraActive(false);
    }
  };

  return (
    <div className="omni-studio-panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="omni-studio-header shrink-0 border-b px-3 py-2">
        <p className="omni-cyber-cyan truncate text-[9px] font-bold uppercase tracking-wider">
          Multimedia Ingestion Tray
        </p>
        <p className="omni-text-dusk truncate text-[8px]">Camera · DICOM · imaging uploads</p>
      </header>

      <div className="shrink-0 space-y-2 border-b border-purple-500/[0.12] p-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void toggleCamera()}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[9px] font-medium transition-all duration-200",
              cameraActive
                ? "omni-violet-pill-active omni-cyber-cyan border-purple-500/30"
                : "omni-violet-pill omni-text-dusk",
            )}
          >
            <Camera className="h-3.5 w-3.5" />
            {cameraActive ? "Stop feed" : "Live camera"}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="omni-violet-pill omni-text-dusk flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[9px] font-medium"
          >
            <FileUp className="h-3.5 w-3.5" />
            Upload scan
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".png,.jpg,.jpeg,.mp4,.dcm,.dicom"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        {cameraActive ? (
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-24 w-full rounded-lg border border-purple-500/[0.12] object-cover"
          />
        ) : null}
      </div>

      <div className="ide-pane-scroll min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-y-contain p-3">
        <p className="omni-text-dusk text-[8px] font-semibold uppercase tracking-wider">Active scans</p>
        {assets.length === 0 ? (
          <p className="omni-text-dusk text-[10px]">No scans loaded — use camera or upload.</p>
        ) : (
          assets.map((asset) => (
            <div
              key={asset.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveMedicalAsset(asset.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveMedicalAsset(asset.id);
                }
              }}
              className={cn(
                "flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border p-2 text-left transition-all duration-200",
                activeAssetId === asset.id
                  ? "omni-violet-pill-active border-purple-500/30"
                  : "omni-violet-pill border-purple-500/[0.12]",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-purple-500/[0.15] bg-[#120924]/60">
                {asset.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : asset.fileType === "video" ? (
                  <Video className="omni-text-dusk h-4 w-4" />
                ) : (
                  <Scan className="omni-text-dusk h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium text-[#e1dbf5]">{asset.name}</p>
                <span className="omni-cyber-cyan rounded bg-[#241745]/70 px-1.5 py-0.5 text-[8px]">{BADGE[asset.fileType]}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeMedicalAsset(asset.id);
                }}
                className="omni-text-dusk shrink-0 text-[10px] hover:text-[#00e5ff]"
                aria-label="Remove scan"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
