"use client";

import dynamic from "next/dynamic";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { WidgetLoading } from "../WidgetLoading";

const loading = (label: string) => () => <WidgetLoading label={label} />;

export const DynamicMedicalEnterpriseWorkspace = dynamic<{
  tool: SovereignToolDef;
  embeddedInAppShell?: boolean;
}>(
  () =>
    import("../../medical-enterprise/MedicalEnterpriseWorkspace").then((m) => ({
      default: m.MedicalEnterpriseWorkspace,
    })),
  { ssr: false, loading: loading("medical suite") },
);

export const DynamicVisionaryStudioWorkspace = dynamic<{
  tool: SovereignToolDef;
  embeddedInAppShell?: boolean;
}>(
  () =>
    import("../../visionary/VisionaryStudioWorkspace").then((m) => ({
      default: m.VisionaryStudioWorkspace,
    })),
  { ssr: false, loading: loading("visionary studio") },
);

export const DynamicOmniMusicStudioShell = dynamic<{
  tool: SovereignToolDef;
  embeddedInAppShell?: boolean;
}>(
  () =>
    import("../../omnimusic/OmniMusicStudioShell").then((m) => ({
      default: m.OmniMusicStudioShell,
    })),
  { ssr: false, loading: loading("omnimusic studio") },
);
