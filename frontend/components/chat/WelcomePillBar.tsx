"use client";

const WELCOME_PILLS = ["Ask anything", "Q&A", "Notes", "Files", "Images", "Bug fixes"] as const;

interface WelcomePillBarProps {
  onSelect: (label: string) => void;
}

/** Horizontal matte preset chips — clean onboarding */
export function WelcomePillBar({ onSelect }: WelcomePillBarProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-2">
      {WELCOME_PILLS.map((pill) => (
        <button
          key={pill}
          type="button"
          onClick={() => onSelect(pill)}
          className="rounded-lg border border-white/[0.03] bg-gradient-to-b from-[#18191e] to-[#121317] px-3.5 py-1.5 text-xs font-medium text-gray-400 shadow-sm transition-all duration-200 hover:border-white/[0.06] hover:text-white"
        >
          {pill}
        </button>
      ))}
    </div>
  );
}

export { WELCOME_PILLS };
