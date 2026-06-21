"use client";

import { Copy, Download, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

type MediaMessageActionsProps = {
  prompt?: string;
  mediaUrl?: string;
  onRegenerate?: () => void;
};

export function MediaMessageActions({
  prompt,
  mediaUrl,
  onRegenerate,
}: MediaMessageActionsProps) {
  const copyPrompt = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
  };

  const downloadMedia = () => {
    if (!mediaUrl) return;
    const a = document.createElement("a");
    a.href = mediaUrl;
    a.download = mediaUrl.includes(".mp4") ? "omnimind-video.mp4" : "omnimind-image.png";
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  };

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {mediaUrl ? (
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={downloadMedia}>
          <Download className="mr-1 h-3.5 w-3.5" />
          Download
        </Button>
      ) : null}
      {onRegenerate ? (
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onRegenerate}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Regenerate
        </Button>
      ) : null}
      {prompt ? (
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => void copyPrompt()}>
          <Copy className="mr-1 h-3.5 w-3.5" />
          Copy prompt
        </Button>
      ) : null}
    </div>
  );
}
