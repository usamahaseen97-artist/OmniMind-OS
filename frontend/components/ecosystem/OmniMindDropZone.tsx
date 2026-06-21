"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";

export function OmniMindDropZone({ children }: { children: React.ReactNode }) {
  const { ingestDroppedFiles } = useOmniMindEcosystem();
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files?.length) ingestDroppedFiles(e.dataTransfer.files);
        const link = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain");
        if (link && /figma|http/i.test(link)) {
          ingestDroppedFiles([new File([link], "link.txt", { type: "text/plain" })]);
        }
      }}
    >
      {children}
      {dragging ? (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center border-2 border-dashed border-cyan-400/50 bg-cyan-500/10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-cyan-200">
            <Upload className="h-8 w-8" />
            <p className="text-[11px] font-semibold">Drop assets for agent ingestion</p>
            <p className="text-[9px] text-cyan-300/70">Images · PDF · ZIP · Figma links</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
