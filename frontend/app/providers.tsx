"use client";

import type { ComponentType, ReactNode } from "react";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { ClientErrorBoundary } from "../components/layout/ClientErrorBoundary";
import { AppNavigationProvider } from "../lib/app-navigation-context";
import { OmniMindEcosystemProvider } from "../lib/omnimind-ecosystem-context";
import { OmniMindMasterAgentProvider } from "../lib/omnimind-master-agent-context";
import { OmniMindBrainProvider } from "../lib/omnimind-brain-context";
import { OmniMindRootIDEProvider } from "../components/ide/OmniMindRootIDEProvider";
import { OmniMindOSGlobalChrome } from "../components/os/OmniMindOSGlobalChrome";
import { ToolFrameworkPluginBoot } from "../components/tool-framework/ToolFrameworkPluginBoot";
import { SDKBoot } from "../components/sdk/SDKBoot";
import { EcosystemOSProvider } from "../lib/ecosystem-os-context";
import { OmniCoreProvider } from "../lib/omnicore/omnicore-context";
import { WorkspaceEngineProvider } from "../lib/workspace-engine-context";

type ProviderComponent = ComponentType<{ children: ReactNode }>;

/** Nests providers outer → inner without JSX pyramid nesting. */
function composeProviders(...providers: ProviderComponent[]) {
  return function ComposedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight<ReactNode>(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children,
    );
  };
}

/**
 * Ordered stack — outermost first. Do not reorder without checking context dependencies.
 * Theme → ecosystem → OmniCore → workspace → agent → brain → IDE → navigation.
 */
const OmniMindProviderStack = composeProviders(
  ThemeProvider,
  OmniMindEcosystemProvider,
  EcosystemOSProvider,
  OmniCoreProvider,
  WorkspaceEngineProvider,
  OmniMindMasterAgentProvider,
  OmniMindBrainProvider,
  OmniMindRootIDEProvider,
  AppNavigationProvider,
);

/**
 * App Router root providers — replaces legacy pages/_app.js wrapper.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClientErrorBoundary>
      <OmniMindProviderStack>
        <ToolFrameworkPluginBoot />
        <SDKBoot />
        <OmniMindOSGlobalChrome />
        {children}
      </OmniMindProviderStack>
    </ClientErrorBoundary>
  );
}
