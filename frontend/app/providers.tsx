"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { AppNavigationProvider } from "../lib/app-navigation-context";
import { OmniMindEcosystemProvider } from "../lib/omnimind-ecosystem-context";

/**
 * App Router root providers — replaces legacy pages/_app.js wrapper.
 * Theme + ecosystem routing matrix + sidebar tool navigation state.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <OmniMindEcosystemProvider>
        <AppNavigationProvider>{children}</AppNavigationProvider>
      </OmniMindEcosystemProvider>
    </ThemeProvider>
  );
}
