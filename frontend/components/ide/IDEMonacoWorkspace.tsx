"use client";

import dynamic from "next/dynamic";
import { useIDE } from "./IDEProvider";
import { languageForPath } from "../../lib/omnimind-ide-config";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[11px] text-zinc-600">
      Loading editor…
    </div>
  ),
});

export function IDEMonacoWorkspace() {
  const { selectedFile, updateFileContent } = useIDE();

  if (!selectedFile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#0d0e12] p-6 text-center">
        <p className="text-sm font-medium text-zinc-400">Manual Code Editor</p>
        <p className="max-w-sm text-[11px] text-zinc-600">
          Select a file from the Project Explorer or open the Review Code tab to edit manually
          alongside AI automation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0d0e12]">
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-1.5 font-mono text-[10px] text-[#00ffcc]/80">
        {selectedFile.path}
      </div>
      <div className="min-h-0 flex-1">
        <MonacoEditor
          height="100%"
          language={selectedFile.language ?? languageForPath(selectedFile.path)}
          theme="vs-dark"
          value={selectedFile.content}
          onChange={(v) => updateFileContent(selectedFile.path, v ?? "")}
          options={{
            minimap: { enabled: true },
            fontSize: 12,
            fontFamily: "var(--font-mono), ui-monospace, monospace",
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
