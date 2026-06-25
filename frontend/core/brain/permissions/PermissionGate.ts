import type { PermissionActionKind, PermissionRequest } from "../types";

type PendingPermission = PermissionRequest;

const DESTRUCTIVE_PATTERNS: { kind: PermissionActionKind; patterns: RegExp[]; title: string }[] = [
  { kind: "delete", patterns: [/delete\s+all|remove\s+project|drop\s+table|rm\s+-rf/i], title: "Delete files or data" },
  { kind: "overwrite", patterns: [/overwrite|replace\s+all\s+files|force\s+write/i], title: "Overwrite existing files" },
  { kind: "deploy", patterns: [/deploy\s+to\s+production|push\s+live|publish\s+site/i], title: "Deploy to production" },
  { kind: "database_migration", patterns: [/migrate\s+database|run\s+migrations|alter\s+table/i], title: "Database migration" },
  { kind: "system_command", patterns: [/sudo\s|chmod\s|system\s+command|shell\s+exec/i], title: "System command" },
];

export type PermissionListener = (request: PermissionRequest) => void;

/** Gates destructive operations behind explicit user approval. */
export class PermissionGate {
  private pending: PendingPermission[] = [];
  private listeners = new Set<PermissionListener>();

  subscribe(listener: PermissionListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  detectKind(text: string): PermissionActionKind | null {
    for (const rule of DESTRUCTIVE_PATTERNS) {
      if (rule.patterns.some((p) => p.test(text))) return rule.kind;
    }
    return null;
  }

  describe(kind: PermissionActionKind): { title: string; description: string } {
    const rule = DESTRUCTIVE_PATTERNS.find((r) => r.kind === kind);
    return {
      title: rule?.title ?? "Sensitive action",
      description: "This operation may modify or remove data. Approve to continue.",
    };
  }

  async requireApproval(
    kind: PermissionActionKind,
    description: string,
    toolId?: string,
    payload?: Record<string, unknown>,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const request: PermissionRequest = {
        id: `perm-${Date.now()}`,
        kind,
        title: this.describe(kind).title,
        description,
        toolId,
        payload,
        createdAt: new Date().toISOString(),
        resolve,
      };
      this.pending.push(request);
      for (const l of this.listeners) l(request);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("omnimind:brain-permission", { detail: request }));
      }
    });
  }

  respond(requestId: string, approved: boolean) {
    const req = this.pending.find((p) => p.id === requestId);
    if (!req) return;
    req.resolve(approved);
    this.pending = this.pending.filter((p) => p.id !== requestId);
  }

  async guardText(text: string, toolId?: string): Promise<boolean> {
    const kind = this.detectKind(text);
    if (!kind) return true;
    return this.requireApproval(kind, `Detected: ${text.slice(0, 120)}`, toolId);
  }
}
