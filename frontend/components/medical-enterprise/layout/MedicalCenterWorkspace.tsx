"use client";

import { Columns2, GitCompare, LayoutGrid, Rows2, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { cn } from "../../../lib/utils";
import { RECORD_KIND_LABELS } from "../../../lib/medical-enterprise/constants";
import { useMedicalEnterprise } from "../../../lib/medical-enterprise/context";
import { PatientProfilePanel } from "../patient/PatientProfilePanel";
import { ClinicalWorkflowStrip } from "../workflow/ClinicalWorkflowStrip";
import type { WorkspaceViewMode } from "../../../lib/medical-enterprise/types";

function NavPlaceholder({ section }: { section: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md rounded-xl border border-dashed border-emerald-500/20 bg-emerald-500/[0.02] p-6 text-center">
        <p className="text-[12px] font-medium text-slate-300">{section}</p>
        <p className="mt-2 text-[10px] text-slate-500">
          Module architecture ready. Connect backend services and medical AI engines in future phases.
        </p>
      </div>
    </div>
  );
}

function PatientListVirtual() {
  const { patients, patientSearch, setActivePatientId, openTab } = useMedicalEnterprise();
  const parentRef = useRef<HTMLDivElement>(null);
  const filtered = patients.filter((p) => {
    const q = patientSearch.toLowerCase();
    if (!q) return true;
    return `${p.firstName} ${p.lastName} ${p.mrn}`.toLowerCase().includes(q);
  });

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 8,
  });

  return (
    <div ref={parentRef} className="h-full overflow-y-auto p-2">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}>
        {virtualizer.getVirtualItems().map((row) => {
          const p = filtered[row.index]!;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setActivePatientId(p.id);
                openTab({ patientId: p.id, label: `${p.firstName} ${p.lastName[0]}. — Chart`, viewMode: "single" });
              }}
              className="absolute left-0 right-0 flex w-full items-center gap-2 rounded border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left hover:border-emerald-500/30"
              style={{ transform: `translateY(${row.start}px)`, height: `${row.size}px` }}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-slate-200">
                  {p.lastName}, {p.firstName}
                </p>
                <p className="text-[9px] text-slate-500">
                  {p.mrn} · {p.department}
                </p>
              </div>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[8px] uppercase",
                  p.status === "critical" ? "bg-red-500/20 text-red-300" : "bg-slate-700/50 text-slate-400",
                )}
              >
                {p.status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ImagingViewerPlaceholder() {
  return (
    <div className="grid h-full min-h-[200px] grid-cols-2 gap-2 p-2">
      <div className="flex flex-col rounded-lg border border-white/[0.08] bg-black/40">
        <p className="border-b border-white/[0.06] px-2 py-1 text-[9px] text-slate-500">2D Imaging Viewer</p>
        <div className="flex flex-1 items-center justify-center text-[10px] text-slate-600">DICOM / PACS ready</div>
      </div>
      <div className="flex flex-col rounded-lg border border-white/[0.08] bg-black/40">
        <p className="border-b border-white/[0.06] px-2 py-1 text-[9px] text-slate-500">3D Viewer</p>
        <div className="flex flex-1 items-center justify-center text-[10px] text-slate-600">GPU-ready placeholder</div>
      </div>
    </div>
  );
}

function RecordsGrid() {
  return (
    <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4">
      {Object.entries(RECORD_KIND_LABELS).map(([kind, label]) => (
        <div
          key={kind}
          className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:border-emerald-500/20"
        >
          <p className="text-[10px] font-medium text-slate-300">{label}</p>
          <p className="mt-1 text-[8px] text-slate-600">Upload · ingest · review</p>
        </div>
      ))}
    </div>
  );
}

export function MedicalCenterWorkspace() {
  const {
    activeNav,
    workspaceTabs,
    activeTabId,
    setActiveTabId,
    closeTab,
    viewMode,
    setViewMode,
    activePatientId,
  } = useMedicalEnterprise();

  const viewModes: { id: WorkspaceViewMode; icon: typeof LayoutGrid; label: string }[] = [
    { id: "single", icon: LayoutGrid, label: "Single" },
    { id: "split", icon: Columns2, label: "Split" },
    { id: "comparison", icon: GitCompare, label: "Compare" },
    { id: "timeline", icon: Rows2, label: "Timeline" },
  ];

  return (
    <div className="medical-enterprise-center flex h-full min-h-0 flex-col overflow-hidden bg-[#0c111a]">
      <ClinicalWorkflowStrip />

      <div className="flex shrink-0 items-center gap-1 border-b border-white/[0.06] px-2">
        {workspaceTabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              "group flex items-center gap-1 border-b-2 px-2 py-1.5 text-[10px]",
              activeTabId === tab.id ? "border-emerald-400 text-slate-200" : "border-transparent text-slate-500",
            )}
          >
            <button type="button" onClick={() => setActiveTabId(tab.id)} className="truncate max-w-[140px]">
              {tab.label}
            </button>
            {workspaceTabs.length > 1 ? (
              <button
                type="button"
                onClick={() => closeTab(tab.id)}
                className="opacity-0 group-hover:opacity-100 rounded p-0.5 hover:bg-white/10"
                aria-label={`Close ${tab.label}`}
              >
                <X size={10} />
              </button>
            ) : null}
          </div>
        ))}
        <div className="ml-auto flex gap-0.5 py-1">
          {viewModes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setViewMode(id)}
              className={cn(
                "rounded p-1",
                viewMode === id ? "bg-emerald-500/20 text-emerald-300" : "text-slate-500 hover:bg-white/[0.06]",
              )}
            >
              <Icon size={12} aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {activeNav === "patient-dashboard" || activeNav === "medical-history" ? (
          <PatientProfilePanel patientId={activePatientId} viewMode={viewMode} />
        ) : null}
        {activeNav === "patient-list" ? <PatientListVirtual /> : null}
        {activeNav === "imaging" || activeNav === "radiology" ? <ImagingViewerPlaceholder /> : null}
        {activeNav === "lab-reports" ? <RecordsGrid /> : null}
        {![
          "patient-dashboard",
          "medical-history",
          "patient-list",
          "imaging",
          "radiology",
          "lab-reports",
        ].includes(activeNav) ? (
          <NavPlaceholder section={activeNav.replace(/-/g, " ")} />
        ) : null}
      </div>
    </div>
  );
}
