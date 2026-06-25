"use client";

import type { ReactNode } from "react";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { usesOmniMindOSShell } from "../../lib/omnimind-os-pilot";
import { UniversalToolFrameworkProvider } from "../../lib/universal-tool-framework-context";
import { UniversalToolActionBar } from "./UniversalToolActionBar";
import { UniversalToolNotifications } from "./UniversalToolNotifications";
import { UniversalToolProgressOverlay } from "./UniversalToolProgressOverlay";
import { UniversalToolSideDeck } from "./UniversalToolSideDeck";
import { UniversalToolToolbar } from "./UniversalToolToolbar";
import { useUniversalToolKeyboardShortcuts } from "./useUniversalToolKeyboardShortcuts";
import { TOOL_FRAMEWORK_TOKENS } from "./tokens";

function UniversalToolShellInner({
  tool,
  children,
  hideTopToolbar,
  hideActionBar,
}: UniversalToolShellProps & { hideTopToolbar: boolean; hideActionBar: boolean }) {
  useUniversalToolKeyboardShortcuts();

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden"
      style={{ background: TOOL_FRAMEWORK_TOKENS.bg.shell }}
      data-tool-framework={tool.slug}
    >
      {!hideTopToolbar ? <UniversalToolToolbar tool={tool} /> : null}
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
      <UniversalToolProgressOverlay />
      <UniversalToolSideDeck />
      <UniversalToolNotifications />
      {!hideActionBar ? <UniversalToolActionBar /> : null}
    </div>
  );
}

export type UniversalToolShellProps = {
  tool: SovereignToolDef;
  children: ReactNode;
};

/**
 * Universal AI Tool Framework shell — wraps any existing layout without replacing routes.
 * Injects toolbar, action bar, notifications, progress, history deck, and execution context.
 */
export function UniversalToolShell({ tool, children }: UniversalToolShellProps) {
  const isOsLayout = usesOmniMindOSShell(tool.slug);
  const hideTopToolbar = tool.slug === "omniforge-engine" || isOsLayout;

  return (
    <UniversalToolFrameworkProvider toolId={tool.slug}>
      <UniversalToolShellInner
        tool={tool}
        hideTopToolbar={hideTopToolbar}
        hideActionBar={isOsLayout}
      >
        {children}
      </UniversalToolShellInner>
    </UniversalToolFrameworkProvider>
  );
}
