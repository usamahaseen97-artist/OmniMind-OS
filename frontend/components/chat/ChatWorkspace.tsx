"use client";

import type { ReactNode } from "react";
import { WelcomePillBar } from "./WelcomePillBar";

interface ChatWorkspaceProps {
  isEmpty: boolean;
  onPillSelect: (label: string) => void;
  messageStream?: ReactNode;
  composer: ReactNode;
  founderName?: string;
  showTitle?: boolean;
}

/** Clean chat workspace — onboarding presets + slim footer composer */
export function ChatWorkspace({
  isEmpty,
  onPillSelect,
  messageStream,
  composer,
  founderName = "Usama Haseen",
  showTitle = false,
}: ChatWorkspaceProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0f0f11] text-[#e3e3e3]">
      {showTitle ? (
        <header className="flex shrink-0 items-center justify-between border-b border-[#1e1e22] p-4">
          <h1 className="w-full text-center text-xs font-semibold tracking-[0.4em] text-gray-300">OMNIMIND</h1>
        </header>
      ) : null}

      <main className="relative flex min-h-0 flex-1 flex-col justify-between overflow-y-auto p-6">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center">
          {isEmpty ? (
            <div className="omni-chat-welcome-in w-full space-y-6 text-center">
              <h2 className="text-2xl font-light tracking-wide text-gray-300">
                How can I help you today?
              </h2>
              <WelcomePillBar onSelect={onPillSelect} />
            </div>
          ) : (
            <div className="flex min-h-0 w-full flex-1 flex-col py-4">{messageStream}</div>
          )}
        </div>

        <div className="mx-auto mt-4 w-full max-w-2xl shrink-0 pb-2">
          {composer}
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-widest text-gray-600">
            Founder: {founderName}
          </p>
        </div>
      </main>
    </div>
  );
}
