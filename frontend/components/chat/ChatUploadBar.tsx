"use client";

import { FileText, Film, ImagePlus } from "lucide-react";
import { useRef } from "react";
import { cn } from "../../lib/utils";

export type UploadKind = "file" | "image" | "video";

export type UploadedMeta = {
  name: string;
  kind: UploadKind;
};

interface ChatUploadBarProps {
  onFiles: (files: UploadedMeta[]) => void;
  className?: string;
  showOnAppDevelop?: boolean;
  alwaysShow?: boolean;
}

export function ChatUploadBar({
  onFiles,
  className,
  showOnAppDevelop = false,
  alwaysShow = false,
}: ChatUploadBarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  if (!alwaysShow && !showOnAppDevelop) return null;

  const chip =
    "inline-flex items-center gap-1 rounded-lg border border-neon-green/20 bg-white/[0.03] px-2 py-1 text-[10px] text-zinc-400 transition hover:border-neon-green/50 hover:text-neon-green";

  const handleChange =
    (kind: UploadKind) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = Array.from(e.target.files ?? []).map((f) => ({
        name: f.name,
        kind,
      }));
      if (list.length) onFiles(list);
      e.target.value = "";
    };

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 px-3 pb-1", className)}>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".txt,.md,.json,.py,.ts,.tsx,.js,.jsx,.ipynb,.log,.csv,.yaml,.yml"
        className="hidden"
        onChange={handleChange("file")}
      />
      <input
        ref={imageRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleChange("image")}
      />
      <input
        ref={videoRef}
        type="file"
        multiple
        accept="video/*"
        className="hidden"
        onChange={handleChange("video")}
      />

      <button type="button" className={chip} onClick={() => fileRef.current?.click()}>
        <FileText className="h-3 w-3" />
        File Uploads
      </button>
      <button type="button" className={chip} onClick={() => imageRef.current?.click()}>
        <ImagePlus className="h-3 w-3" />
        Image Uploads
      </button>
      <button type="button" className={chip} onClick={() => videoRef.current?.click()}>
        <Film className="h-3 w-3" />
        Video Uploads
      </button>
    </div>
  );
}
