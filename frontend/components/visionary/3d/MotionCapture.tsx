"use client";

export function MotionCapture() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase text-cyan-400">Motion Capture</p>
      <p className="text-[9px] text-slate-600">Webcam / IMU / Markerless mocap — architecture stub</p>
      <button type="button" className="mt-4 rounded border border-cyan-500/30 px-4 py-2 text-[10px] text-cyan-300">Start Capture Session</button>
    </div>
  );
}
