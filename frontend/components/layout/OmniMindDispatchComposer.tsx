"use client";

import { Mic, Plus } from "lucide-react";

interface OmniMindDispatchComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (text: string) => void;
  founderName?: string;
}

/** Unified bottom input bar — shared console layer (image_20) */
export function OmniMindDispatchComposer({
  value,
  onChange,
  onSubmit,
  founderName = "Usama Haseen",
}: OmniMindDispatchComposerProps) {
  const submit = () => {
    const text = value.trim();
    if (!text) return;
    onSubmit?.(text);
    onChange("");
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-2xl shrink-0 pb-2">
      <div className="relative flex items-center rounded-xl border border-white/[0.04] bg-gradient-to-b from-[#15161b] to-[#0f1014] p-2 shadow-[inset_0_1px_2px_rgba(255,255,255,0.02),0_10px_25px_rgba(0,0,0,0.4)] transition-all focus-within:border-white/[0.07]">
        <button
          type="button"
          className="px-2 text-gray-500 transition-colors hover:text-gray-300"
          aria-label="Attach"
        >
          <Plus size={16} />
        </button>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Message OmniMind cluster execution thread..."
          className="w-full bg-transparent px-2 text-sm text-gray-200 outline-none placeholder:text-gray-600"
        />

        <div className="flex items-center gap-2.5 border-l border-white/[0.04] px-3 font-mono text-[10px] text-gray-500">
          <span className="cursor-default tracking-wider select-none">Flash 11</span>
          <button
            type="button"
            className="text-gray-500 transition-colors hover:text-gray-300"
            aria-label="Voice input"
          >
            <Mic size={13} />
          </button>
        </div>
      </div>

      <p className="mt-3.5 text-center font-mono text-[9px] tracking-[0.25em] text-gray-600 uppercase opacity-75">
        Founder: {founderName}
      </p>
    </div>
  );
}
