"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SAMPLE_PATIENTS } from "./constants";
import type {
  AuditLogEntry,
  BottomPanelTab,
  ClinicalRole,
  ClinicalWorkflowStep,
  DeviceConnection,
  MedicalNavSection,
  MedicalWorkspaceTab,
  PatientSummary,
  RightPanelSection,
  ThemeMode,
  WorkspaceViewMode,
} from "./types";

export type MedicalEnterpriseContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  emergencyMode: boolean;
  setEmergencyMode: (on: boolean) => void;
  activeNav: MedicalNavSection;
  setActiveNav: (s: MedicalNavSection) => void;
  activeRightSection: RightPanelSection;
  setActiveRightSection: (s: RightPanelSection) => void;
  bottomTab: BottomPanelTab;
  setBottomTab: (t: BottomPanelTab) => void;
  bottomPanelOpen: boolean;
  setBottomPanelOpen: (open: boolean) => void;
  patients: PatientSummary[];
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;
  workspaceTabs: MedicalWorkspaceTab[];
  activeTabId: string;
  openTab: (tab: Omit<MedicalWorkspaceTab, "id"> & { id?: string }) => void;
  closeTab: (id: string) => void;
  setActiveTabId: (id: string) => void;
  viewMode: WorkspaceViewMode;
  setViewMode: (m: WorkspaceViewMode) => void;
  workflowStep: ClinicalWorkflowStep;
  setWorkflowStep: (s: ClinicalWorkflowStep) => void;
  currentUser: { name: string; role: ClinicalRole; hospital: string; department: string };
  devices: DeviceConnection[];
  auditLog: AuditLogEntry[];
  appendAudit: (entry: Omit<AuditLogEntry, "id" | "timestamp">) => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  patientSearch: string;
  setPatientSearch: (q: string) => void;
  aiStatus: "online" | "degraded" | "offline";
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
};

const MedicalEnterpriseContext = createContext<MedicalEnterpriseContextValue | null>(null);

const INITIAL_DEVICES: DeviceConnection[] = [
  { id: "d1", name: "Vital Signs Monitor", type: "vitals", status: "connected", lastSync: "2026-06-17T10:00:00Z" },
  { id: "d2", name: "PACS Gateway", type: "imaging", status: "connected", lastSync: "2026-06-17T09:55:00Z" },
  { id: "d3", name: "Lab Interface HL7", type: "laboratory", status: "syncing" },
];

export function MedicalEnterpriseProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [activeNav, setActiveNav] = useState<MedicalNavSection>("patient-dashboard");
  const [activeRightSection, setActiveRightSection] = useState<RightPanelSection>("ai-findings");
  const [bottomTab, setBottomTab] = useState<BottomPanelTab>("activity-log");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [activePatientId, setActivePatientId] = useState<string | null>(SAMPLE_PATIENTS[0]?.id ?? null);
  const [workspaceTabs, setWorkspaceTabs] = useState<MedicalWorkspaceTab[]>([
    { id: "tab-1", patientId: SAMPLE_PATIENTS[0]?.id, label: "Elena V. — Dashboard", viewMode: "single" },
  ]);
  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [viewMode, setViewMode] = useState<WorkspaceViewMode>("single");
  const [workflowStep, setWorkflowStep] = useState<ClinicalWorkflowStep>("history-review");
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([
    {
      id: "a1",
      timestamp: new Date().toISOString(),
      actorId: "usr-001",
      actorRole: "physician",
      action: "workspace.open",
      resource: "medical-diagnostic-suite",
    },
  ]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openTab = useCallback((tab: Omit<MedicalWorkspaceTab, "id"> & { id?: string }) => {
    const id = tab.id ?? `tab-${Date.now()}`;
    setWorkspaceTabs((prev) => {
      if (prev.some((t) => t.id === id)) return prev;
      return [...prev, { ...tab, id }];
    });
    setActiveTabId(id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setWorkspaceTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (activeTabId === id && next.length > 0) {
        setActiveTabId(next[next.length - 1]!.id);
      }
      return next.length > 0 ? next : prev;
    });
  }, [activeTabId]);

  const appendAudit = useCallback((entry: Omit<AuditLogEntry, "id" | "timestamp">) => {
    setAuditLog((prev) => [
      { ...entry, id: `audit-${Date.now()}`, timestamp: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const value = useMemo<MedicalEnterpriseContextValue>(
    () => ({
      themeMode,
      setThemeMode,
      emergencyMode,
      setEmergencyMode,
      activeNav,
      setActiveNav,
      activeRightSection,
      setActiveRightSection,
      bottomTab,
      setBottomTab,
      bottomPanelOpen,
      setBottomPanelOpen,
      patients: SAMPLE_PATIENTS,
      activePatientId,
      setActivePatientId,
      workspaceTabs,
      activeTabId,
      openTab,
      closeTab,
      setActiveTabId,
      viewMode,
      setViewMode,
      workflowStep,
      setWorkflowStep,
      currentUser: {
        name: "Dr. Sarah Mitchell",
        role: "physician",
        hospital: "OmniMind General Hospital",
        department: "Clinical Decision Support",
      },
      devices: INITIAL_DEVICES,
      auditLog,
      appendAudit,
      globalSearch,
      setGlobalSearch,
      patientSearch,
      setPatientSearch,
      aiStatus: "online",
      commandPaletteOpen,
      setCommandPaletteOpen,
    }),
    [
      themeMode,
      emergencyMode,
      activeNav,
      activeRightSection,
      bottomTab,
      bottomPanelOpen,
      activePatientId,
      workspaceTabs,
      activeTabId,
      openTab,
      closeTab,
      viewMode,
      workflowStep,
      auditLog,
      appendAudit,
      globalSearch,
      patientSearch,
      commandPaletteOpen,
    ],
  );

  return (
    <MedicalEnterpriseContext.Provider value={value}>{children}</MedicalEnterpriseContext.Provider>
  );
}

export function useMedicalEnterprise() {
  const ctx = useContext(MedicalEnterpriseContext);
  if (!ctx) throw new Error("useMedicalEnterprise must be used within MedicalEnterpriseProvider");
  return ctx;
}

export function useMedicalEnterpriseOptional() {
  return useContext(MedicalEnterpriseContext);
}
