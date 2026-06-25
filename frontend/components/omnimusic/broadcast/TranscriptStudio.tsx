"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function TranscriptStudio() {
  const { transcript, activeEpisode, generateTranscript } = useOmniMusicStudio();

  return (
    <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[9px] font-medium text-slate-300">Transcript · Speech-to-text architecture</p>
        {activeEpisode ? (
          <button type="button" onClick={() => generateTranscript(activeEpisode.id)} className="text-[8px] text-emerald-400">Generate</button>
        ) : null}
      </div>
      {!transcript ? <p className="text-[8px] text-slate-600">No transcript — generate from episode audio</p> : (
        <>
          <p className="mb-1 text-[7px] text-slate-600">{transcript.language} · {transcript.speakers.length} speakers · {transcript.words.length} words</p>
          <div className="max-h-32 overflow-y-auto rounded bg-black/20 p-2 text-[8px] leading-relaxed text-slate-400">
            {transcript.words.map((w) => (
              <span key={w.id} className="mr-1" title={`${w.startSec.toFixed(1)}s`}>{w.text}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
