/** Live development event bus — syncs preview, terminal, files, architecture during AI writes. */
export type LiveDevEvent =
  | { type: "file_updated"; path: string; content: string }
  | { type: "preview_refresh" }
  | { type: "terminal_log"; line: string }
  | { type: "dependency_graph"; nodes: string[]; edges: [string, string][] }
  | { type: "architecture_diagram"; mermaid: string }
  | { type: "agent_active"; agentId: string; label: string }
  | { type: "build_progress"; pct: number; stage: string };

export function emitLiveDev(event: LiveDevEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("omnimind:omniforge-live-dev", { detail: event }));

  if (event.type === "preview_refresh") {
    window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
  }
  if (event.type === "terminal_log") {
    window.dispatchEvent(new CustomEvent("omnimind:omniforge-scaffold-log", { detail: { lines: [event.line] } }));
  }
  if (event.type === "file_updated") {
    window.dispatchEvent(
      new CustomEvent("omniforge-file-stream", { detail: { path: event.path, content: event.content } }),
    );
  }
}

export function architectureMermaid(projectName: string, stacks: string[]): string {
  return `flowchart TB
  User[User] --> FE[${stacks[0] ?? "Frontend"}]
  FE --> API[${stacks[1] ?? "API"}]
  API --> DB[(${stacks[2] ?? "Database"})]
  API --> Cache[(Redis)]
  subgraph ${projectName}
    FE
    API
  end`;
}
