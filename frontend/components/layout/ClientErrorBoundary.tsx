"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { crashLogger } from "../../lib/qa/crash-logger";
import { omniQuality } from "../../core/quality";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ClientErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    crashLogger.record(error, info.componentStack);
    omniQuality.errors.recordCrash(error.message, false);
    console.error("OmniMind UI error:", error, info);
  }

  private handleReload = () => {
    omniQuality.errors.recordCrash(this.state.error?.message ?? "unknown", true);
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0B0C10] p-6 text-center text-zinc-200"
          role="alert"
        >
          <p className="text-lg font-semibold text-[#00FF87]">OmniMind — UI reload needed</p>
          <p className="max-w-md text-sm text-zinc-400">{this.state.error.message}</p>
          <button
            type="button"
            aria-label="Reload page after error"
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-[#00FF87]"
            onClick={this.handleReload}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
