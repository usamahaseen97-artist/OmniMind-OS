"use client";

import { Code2, Loader2, Wand2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { GeneratedFileAsset } from "../../lib/execution-preview";
import {
  buildScaffoldMessage,
  deployStepsForTarget,
  getArchitectStepPayload,
  type ArchitectBuildMode,
  type ArchitectChoicePayload,
  type ArchitectFlowSelections,
  type ArchitectStep,
} from "../../lib/architect-flow";
import {
  provisionManagedDatabase,
  scaffoldArchitectProject,
  triggerDeployCliHook,
} from "../../lib/architect-flow-api";
import { ArchitectChoicePanel } from "./ArchitectChoicePanel";
import { cn } from "../../lib/utils";

export type ArchitectWizardSurface = "full" | "workspace" | "terminal";

export type ArchitectWizardStatePatch = {
  step?: ArchitectStep;
  selections?: ArchitectFlowSelections;
  files?: GeneratedFileAsset[];
  status?: string | null;
  loading?: boolean;
  deployReady?: boolean;
};

interface OmniArchitectWizardProps {
  userId?: string;
  className?: string;
  mode?: ArchitectBuildMode;
  compact?: boolean;
  surface?: ArchitectWizardSurface;
  /** Chat is step 1 — wizard starts at frontend when true */
  splitMode?: boolean;
  projectPrompt?: string;
  onProjectPromptChange?: (prompt: string) => void;
  /** AI chat may push architect JSON into Code Bot */
  externalPayload?: ArchitectChoicePayload | null;
  onStateChange?: (patch: ArchitectWizardStatePatch) => void;
  onComplete?: (result: {
    files: GeneratedFileAsset[];
    selections: ArchitectFlowSelections;
    deploySteps: string[];
  }) => void;
  onFillChat?: (text: string) => void;
  /** Parent sticky Deploy Now bar */
  onRegisterDeploy?: (ready: boolean, handler: () => void) => void;
}

export function OmniArchitectWizard({
  userId = "guest-founder",
  className,
  mode = "app",
  compact = false,
  surface = "full",
  splitMode = false,
  projectPrompt: controlledPrompt,
  onProjectPromptChange,
  externalPayload,
  onStateChange,
  onComplete,
  onFillChat,
  onRegisterDeploy,
}: OmniArchitectWizardProps) {
  const [step, setStep] = useState<ArchitectStep>(() =>
    splitMode && surface === "workspace" ? 1 : splitMode ? 2 : 1,
  );
  const [selections, setSelections] = useState<ArchitectFlowSelections>({ projectPrompt: "" });
  const [selectedOption, setSelectedOption] = useState<string | undefined>();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<GeneratedFileAsset[]>([]);
  const [deploySteps, setDeploySteps] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const effectivePrompt = controlledPrompt ?? selections.projectPrompt;

  useEffect(() => {
    if (controlledPrompt !== undefined) {
      setSelections((s) => ({ ...s, projectPrompt: controlledPrompt }));
      if (splitMode && controlledPrompt.trim() && step < 2) {
        setStep(2);
      }
    }
  }, [controlledPrompt, splitMode, step]);

  useEffect(() => {
    if (!externalPayload?.step) return;
    setStep(externalPayload.step);
    setSelectedOption(undefined);
  }, [externalPayload]);

  const payload = useMemo(
    () => externalPayload ?? getArchitectStepPayload(step, { ...selections, projectPrompt: effectivePrompt }, mode),
    [externalPayload, step, selections, effectivePrompt, mode],
  );

  const advance = useCallback((next: ArchitectStep) => {
    setSelectedOption(undefined);
    setError(null);
    setStep(next);
  }, []);

  const runCodegen = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatus("Generating deployment-ready scaffold…");
    const finalSel = { ...selections, projectPrompt: effectivePrompt };
    try {
      const result = await scaffoldArchitectProject(finalSel, userId);
      setFiles(result.files);
      setStatus(`Scaffold ready: ${result.title}`);
      advance(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Code generation failed");
    } finally {
      setLoading(false);
    }
  }, [advance, effectivePrompt, selections, userId]);

  const runDeployNow = useCallback(async () => {
    if (step !== 6) {
      setError("Pehle frontend, backend, aur database complete karein.");
      return;
    }
    const deployId = selectedOption ?? selections.deployId ?? "vercel";
    const finalSelections = { ...selections, projectPrompt: effectivePrompt, deployId };
    setSelections(finalSelections);
    const steps = deployStepsForTarget(deployId, finalSelections);
    setDeploySteps(steps);
    setLoading(true);
    await triggerDeployCliHook({ deployId, selections: finalSelections });
    setLoading(false);
    setStatus("Deploy Now — build CLI hook triggered.");
    onComplete?.({ files, selections: finalSelections, deploySteps: steps });
    onFillChat?.(buildScaffoldMessage(finalSelections));
  }, [effectivePrompt, files, onComplete, onFillChat, selectedOption, selections, step]);

  useEffect(() => {
    onRegisterDeploy?.(step === 6 && files.length > 0, () => void runDeployNow());
  }, [files.length, onRegisterDeploy, runDeployNow, step]);

  useEffect(() => {
    onStateChange?.({
      step,
      selections: { ...selections, projectPrompt: effectivePrompt },
      files,
      status,
      loading,
      deployReady: step === 6 && files.length > 0,
    });
  }, [effectivePrompt, files, loading, onStateChange, selections, status, step]);

  const handleDatabaseConfirm = useCallback(async () => {
    if (!selectedOption) return;
    const nextSelections = {
      ...selections,
      projectPrompt: effectivePrompt,
      databaseId: selectedOption,
      email: email.trim() || undefined,
    };
    setSelections(nextSelections);

    if (selectedOption === "managed_supabase" || selectedOption === "managed_mongo") {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Managed database ke liye valid email zaroori hai.");
        return;
      }
      setLoading(true);
      setError(null);
      setStatus("Spinning up managed database cluster…");
      try {
        const provider = selectedOption === "managed_supabase" ? "supabase" : "mongodb_atlas";
        const res = await provisionManagedDatabase({
          email: email.trim(),
          provider,
          projectPrompt: effectivePrompt,
        });
        if (!res.success) {
          setError(res.message ?? "Database provision failed");
          setLoading(false);
          return;
        }
        setStatus(res.message ?? "Database configured silently.");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Provision request failed");
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    advance(5);
    void runCodegen();
  }, [advance, effectivePrompt, email, runCodegen, selectedOption, selections]);

  const handleAction = useCallback(
    async (actionId: string, actionValue?: string) => {
      setError(null);

      if (step === 1 && actionId === "continue_analyze") {
        if (!effectivePrompt.trim()) {
          setError("Pehle project describe karein (chat ya Step 1).");
          return;
        }
        advance(2);
        return;
      }

      if (step === 2) {
        const id = actionValue ?? selectedOption;
        if (!id) {
          setError("Frontend framework select karein.");
          return;
        }
        setSelections((s) => ({ ...s, projectPrompt: effectivePrompt, frontendId: id }));
        advance(3);
        return;
      }

      if (step === 3) {
        const id = actionValue ?? selectedOption;
        if (!id) {
          setError("Backend stack select karein.");
          return;
        }
        setSelections((s) => ({ ...s, backendId: id }));
        advance(4);
        return;
      }

      if (step === 4 && actionId === "confirm_database") {
        await handleDatabaseConfirm();
        return;
      }

      if (step === 6) {
        const deployId = actionValue ?? selectedOption;
        if (!deployId && actionId !== "trigger_build_cli") {
          setError("Deployment target select karein.");
          return;
        }
        if (deployId) {
          setSelections((s) => ({ ...s, deployId }));
          setSelectedOption(deployId);
          const finalSelections = { ...selections, projectPrompt: effectivePrompt, deployId };
          const steps = deployStepsForTarget(deployId, finalSelections);
          setDeploySteps(steps);
        }
        if (actionId === "trigger_build_cli") {
          await runDeployNow();
        } else {
          onComplete?.({
            files,
            selections: { ...selections, projectPrompt: effectivePrompt, deployId: deployId ?? selections.deployId },
            deploySteps: deployStepsForTarget(deployId ?? "vercel", selections),
          });
        }
      }
    },
    [
      advance,
      deploySteps,
      effectivePrompt,
      files,
      handleDatabaseConfirm,
      onComplete,
      runDeployNow,
      selectedOption,
      selections,
      step,
    ],
  );

  if (surface === "terminal") {
    return null;
  }

  const isWorkspace = surface === "workspace";
  const chipVariant = compact || isWorkspace ? "chips" : "cards";

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedOption(id);
      const autoAdvance = compact || isWorkspace;
      if (!autoAdvance) return;
      if (step === 2) void handleAction("confirm_frontend", id);
      if (step === 3) void handleAction("confirm_backend", id);
      if (step === 6) setSelections((s) => ({ ...s, deployId: id }));
    },
    [compact, handleAction, isWorkspace, step],
  );

  const frontendPayload = useMemo(
    () => getArchitectStepPayload(2, { ...selections, projectPrompt: effectivePrompt }, mode),
    [effectivePrompt, mode, selections],
  );
  const backendPayload = useMemo(
    () => getArchitectStepPayload(3, { ...selections, projectPrompt: effectivePrompt }, mode),
    [effectivePrompt, mode, selections],
  );
  const databasePayload = useMemo(
    () => getArchitectStepPayload(4, { ...selections, projectPrompt: effectivePrompt }, mode),
    [effectivePrompt, mode, selections],
  );

  const StepCard = ({
    num,
    label,
    active,
    done,
    children,
  }: {
    num: number;
    label: string;
    active: boolean;
    done: boolean;
    children: ReactNode;
  }) => (
    <section
      className={cn(
        "rounded-xl border p-4 transition-all",
        active
          ? "border-[#00ffcc]/30 bg-[#15171e]/80 shadow-[0_0_24px_rgba(0,255,204,0.06)]"
          : done
            ? "border-emerald-500/15 bg-[#12141a]/60 opacity-90"
            : "border-white/[0.05] bg-[#0d0e12]/50 opacity-60",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold",
            active ? "bg-[#00ffcc]/15 text-[#00ffcc]" : done ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-600",
          )}
        >
          {num}
        </span>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-200">
          Step {num} — {label}
        </h3>
        {done ? (
          <span className="ml-auto text-[9px] font-semibold text-emerald-400/80">Done</span>
        ) : null}
      </div>
      {children}
    </section>
  );

  if (isWorkspace) {
    return (
      <div className={cn("flex w-full flex-col gap-3", className)}>
        {splitMode && effectivePrompt.trim() ? (
          <p className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-1.5 text-[10px] text-zinc-500">
            <span className="font-semibold text-emerald-400/90">Brief: </span>
            {effectivePrompt.slice(0, 160)}
            {effectivePrompt.length > 160 ? "…" : ""}
          </p>
        ) : null}

        {!splitMode ? (
          <StepCard num={1} label="Analyze" active={step <= 1} done={step > 1}>
            <textarea
              value={effectivePrompt}
              onChange={(e) => {
                onProjectPromptChange?.(e.target.value);
                setSelections((s) => ({ ...s, projectPrompt: e.target.value }));
              }}
              rows={3}
              placeholder="Describe your app, website, or game — features, audience, platform…"
              disabled={step > 1 && !loading}
              className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-[#00ffcc]/40"
            />
            {step <= 1 ? (
              <button
                type="button"
                onClick={() => void handleAction("continue_analyze")}
                className="mt-2 rounded-lg border border-[#00ffcc]/35 bg-[#00ffcc]/10 px-3 py-1.5 text-[10px] font-semibold text-[#00ffcc] hover:bg-[#00ffcc]/15"
              >
                Continue to stack selection
              </button>
            ) : (
              <p className="mt-2 text-[10px] text-zinc-500 line-clamp-2">{effectivePrompt.slice(0, 160)}</p>
            )}
          </StepCard>
        ) : null}

        <StepCard num={splitMode ? 1 : 2} label="Frontend" active={step === 2} done={step > 2}>
          {step === 2 ? (
            <ArchitectChoicePanel
              payload={externalPayload?.step === 2 ? externalPayload : frontendPayload}
              selectedId={selectedOption}
              onSelect={handleSelect}
              onAction={(id, val) => void handleAction(id, val)}
              disabled={loading}
              variant="chips"
            />
          ) : step > 2 && selections.frontendId ? (
            <p className="text-[11px] text-[#00ffcc]/90">
              Selected: <strong>{selections.frontendId}</strong>
            </p>
          ) : (
            <p className="text-[10px] text-zinc-600">
              {splitMode ? "Send a brief in chat to begin stack selection." : "Complete Step 1 first."}
            </p>
          )}
        </StepCard>

        <StepCard num={splitMode ? 2 : 3} label="Production" active={step >= 3} done={step === 6 && files.length > 0}>
          {step === 5 ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#00ffcc]" />
              <p className="text-[11px] text-zinc-400">{status ?? "Generating deployment-ready code…"}</p>
            </div>
          ) : step >= 3 ? (
            <ArchitectChoicePanel
              payload={
                step === 3
                  ? backendPayload
                  : step === 4
                    ? databasePayload
                    : step === 6
                      ? payload
                      : backendPayload
              }
              selectedId={selectedOption}
              onSelect={handleSelect}
              onAction={(id, val) => void handleAction(id, val)}
              email={email}
              onEmailChange={setEmail}
              disabled={loading}
              variant={step === 6 ? "chips" : "chips"}
            />
          ) : (
            <p className="text-[10px] text-zinc-600">Backend, database, codegen &amp; deploy appear here.</p>
          )}
        </StepCard>

        {status && step !== 5 ? (
          <p className="text-[10px] text-[#00ffcc]/80">{status}</p>
        ) : null}
        {error ? <p className="text-[10px] text-amber-400">{error}</p> : null}
        {loading && step !== 5 ? (
          <p className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Working…
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex w-full flex-col gap-2.5", compact || isWorkspace ? "max-w-none" : "max-w-lg", className)}>
      {!isWorkspace ? (
        <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-2.5 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/15">
            <Code2 className="h-3.5 w-3.5 text-violet-300" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-zinc-100">Code Bot</p>
            <p className="text-[9px] text-zinc-500">
              {mode === "game" ? "Game · app scaffold wizard" : "Full-stack app wizard"}
            </p>
          </div>
          <Wand2 className="ml-auto h-3.5 w-3.5 text-emerald-500/60" />
        </div>
      ) : null}

      {splitMode && effectivePrompt.trim() ? (
        <p className="rounded-lg border border-white/[0.06] bg-black/25 px-2.5 py-1.5 text-[10px] text-zinc-500">
          <span className="font-semibold text-emerald-400/90">Analyzed: </span>
          {effectivePrompt.slice(0, 120)}
          {effectivePrompt.length > 120 ? "…" : ""}
        </p>
      ) : null}

      {!splitMode && step === 1 ? (
        <div className="rounded-xl border border-emerald-500/25 bg-[#15171E]/90 p-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/90">
            Step 1 · analyze
          </p>
          <textarea
            value={effectivePrompt}
            onChange={(e) => {
              onProjectPromptChange?.(e.target.value);
              setSelections((s) => ({ ...s, projectPrompt: e.target.value }));
            }}
            rows={4}
            placeholder="Describe your app, website, or game…"
            className="w-full resize-none rounded-lg border border-gray-800/80 bg-black/30 px-2.5 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500/40"
          />
          <button
            type="button"
            onClick={() => void handleAction("continue_analyze")}
            className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-[#00FF87] hover:bg-emerald-500/20"
          >
            Continue to stack selection
          </button>
        </div>
      ) : step === 5 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-500/25 bg-[#15171E]/90 p-5 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#10B981]" />
          <p className="text-xs font-medium text-zinc-200">Step 5 · Code generation</p>
          <p className="text-[10px] text-zinc-500">{status ?? "Writing deployment-ready structure…"}</p>
        </div>
      ) : (
        <div className={compact ? "rounded-xl border border-emerald-500/15 bg-black/30 p-3" : undefined}>
          <ArchitectChoicePanel
            payload={payload}
            selectedId={selectedOption}
            onSelect={handleSelect}
            onAction={(id, val) => void handleAction(id, val)}
            email={email}
            onEmailChange={setEmail}
            disabled={loading}
            variant={chipVariant}
          />
        </div>
      )}

      {status && step !== 5 ? (
        <p className="text-[10px] text-emerald-400/90">{status}</p>
      ) : null}
      {error ? <p className="text-[10px] text-amber-400">{error}</p> : null}

      {files.length > 0 && step === 6 ? (
        <div className="rounded-lg border border-gray-800/60 bg-black/20 p-2">
          <p className="mb-1 text-[10px] font-semibold text-zinc-300">
            Generated files ({files.length})
          </p>
          <ul className="max-h-20 overflow-y-auto text-[9px] text-zinc-500">
            {files.map((f) => (
              <li key={f.path} className="truncate font-mono">
                {f.path}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {deploySteps.length > 0 ? (
        <ol className="list-decimal space-y-0.5 pl-4 text-[9px] text-zinc-500">
          {deploySteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      ) : null}

      {loading ? (
        <p className="flex items-center gap-1.5 text-[10px] text-zinc-500">
          <Loader2 className="h-3 w-3 animate-spin" /> Working…
        </p>
      ) : null}
    </div>
  );
}
