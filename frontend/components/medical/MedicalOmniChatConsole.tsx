"use client";

import { motion } from "framer-motion";
import { DynamicOmniChatShell } from "../ide/dynamic-workbench-widgets";
import { GUEST } from "../ide/layouts/layout-shared";
import { MedicalManualControls } from "./MedicalManualControls";
import { useMedicalDiagnosticSync } from "../../lib/use-medical-diagnostic-sync";
import { useMedicalDiagnosticStore } from "../../lib/medical-diagnostic-store";

const panelSpring = { type: "spring" as const, stiffness: 440, damping: 38, mass: 0.82 };

/** Medical diagnostic exclusive — manual sliders + sovereign chat dock */
export function MedicalOmniChatConsole({ routeId }: { routeId: string }) {
  const { assets } = useMedicalDiagnosticStore();
  const { pushSettings } = useMedicalDiagnosticSync(true);

  return (
    <motion.div
      layout
      initial={false}
      transition={panelSpring}
      className="omni-studio-panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
    >
      <header className="omni-studio-header shrink-0 border-b px-3 py-2">
        <p className="omni-cyber-cyan truncate text-[9px] font-bold uppercase tracking-wider">
          OmniMind Medical Console
        </p>
        <p className="omni-text-dusk truncate text-[8px]">AI analysis · clinical reporting</p>
      </header>

      <MedicalManualControls onSettingsChange={pushSettings} />

      <div className="min-h-0 flex-1 overflow-hidden">
        <DynamicOmniChatShell
          routeId={routeId}
          userId={GUEST}
          showDashboardTools
          hideLiveDeck
          workbenchUnified
          medicalPremium
          medicalScanCount={assets.length}
          toolSlug="medical-diagnostic"
        />
      </div>
    </motion.div>
  );
}
