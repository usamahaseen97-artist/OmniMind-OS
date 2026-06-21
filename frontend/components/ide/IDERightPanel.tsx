"use client";

import { Bot, FolderTree } from "lucide-react";
import { ArchitectCodeBotTerminal } from "../architect/ArchitectCodeBotTerminal";
import { isDevFileTreeSlug } from "../../lib/dev-file-trees";
import { useIDE } from "./IDEProvider";
import { IDEProjectFileTree } from "./IDEProjectFileTree";
import { cn } from "../../lib/utils";

export function IDERightPanel() {
  const { rightView, setRightView, workspaceState, toolSlug } = useIDE();
  const showFiles = isDevFileTreeSlug(toolSlug);

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: "var(--omni-bg)" }}>
      <div className="flex shrink-0 border-b" style={{ borderColor: "var(--omni-border)" }}>
        {showFiles ? (
          <button
            type="button"
            onClick={() => setRightView("files")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-semibold transition",
              rightView === "files" ? "border-b-2 omni-accent-text" : "",
            )}
            style={{
              borderBottomColor: rightView === "files" ? "var(--omni-accent)" : "transparent",
              color: rightView === "files" ? undefined : "var(--omni-text-muted)",
            }}
          >
            <FolderTree className="h-3.5 w-3.5" />
            Project Files
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setRightView("codebot")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 py-2 text-[10px] font-semibold transition",
            rightView === "codebot" ? "border-b-2 omni-accent-text" : "",
          )}
          style={{
            borderBottomColor: rightView === "codebot" ? "var(--omni-accent)" : "transparent",
            color: rightView === "codebot" ? undefined : "var(--omni-text-muted)",
          }}
        >
          <Bot className="h-3.5 w-3.5" />
          Code Bot Agent
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {showFiles && rightView === "files" ? (
          <IDEProjectFileTree compact showExplorerHeader />
        ) : (
          <ArchitectCodeBotTerminal
            files={workspaceState.files}
            status={workspaceState.status}
            loading={workspaceState.loading}
          />
        )}
      </div>
    </div>
  );
}
