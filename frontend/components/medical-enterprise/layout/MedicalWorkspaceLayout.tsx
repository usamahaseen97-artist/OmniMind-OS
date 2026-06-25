"use client";

import { useEffect } from "react";
import { TriplePanelResizeShell } from "../../ide/layouts/TriplePanelResizeShell";
import { MedicalBottomPanel } from "./MedicalBottomPanel";
import { MedicalCenterWorkspace } from "./MedicalCenterWorkspace";
import { MedicalLeftSidebar } from "./MedicalLeftSidebar";
import { MedicalRightSidebar } from "./MedicalRightSidebar";
import { MedicalTopHeader } from "./MedicalTopHeader";
import { MedicalCommandPalette } from "./MedicalCommandPalette";
import { useMedicalEnterprise } from "../../../lib/medical-enterprise/context";
import { cn } from "../../../lib/utils";

export function MedicalWorkspaceLayout({ embeddedInAppShell }: { embeddedInAppShell?: boolean } = {}) {
  const { themeMode } = useMedicalEnterprise();

  useEffect(() => {
    document.documentElement.dataset.medicalTheme = themeMode;
    return () => {
      delete document.documentElement.dataset.medicalTheme;
    };
  }, [themeMode]);

  return (
    <div
      className={cn(
        "medical-enterprise-layout flex h-full min-h-0 w-full flex-col overflow-hidden",
        themeMode === "light" && "medical-theme-light",
        themeMode === "high-contrast" && "medical-theme-hc",
      )}
    >
      <MedicalTopHeader hidden={embeddedInAppShell} />
      <div className="min-h-0 flex-1 overflow-hidden">
        <TriplePanelResizeShell
          left={<MedicalLeftSidebar />}
          center={<MedicalCenterWorkspace />}
          right={<MedicalRightSidebar />}
          leftGutterLabel="Resize navigation and workspace"
          rightGutterLabel="Resize workspace and clinical assist"
        />
      </div>
      <MedicalBottomPanel />
      {!embeddedInAppShell ? <MedicalCommandPalette /> : null}
    </div>
  );
}
