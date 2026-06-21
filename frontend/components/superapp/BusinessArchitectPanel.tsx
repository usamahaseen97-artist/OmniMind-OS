"use client";

import { Bot, BrainCircuit, Building2, Loader2, Send, Users } from "lucide-react";
import { useState } from "react";
import { useSuperToolPromptListener } from "../../lib/super-tool-prompt-bus";
import { MarkdownMessage } from "../chat/MarkdownMessage";
import { Button } from "../ui/button";
import { streamBusinessAgents, streamBusinessPlan } from "../../lib/superapp";
import { cn } from "../../lib/utils";

const SOFTWARE_TYPES = [
  { id: "accounting", label: "Accounting" },
  { id: "inventory", label: "Inventory" },
  { id: "crm", label: "CRM" },
  { id: "erp", label: "ERP" },
  { id: "custom", label: "Custom" },
];

type Mode = "blueprint" | "agents";

export function BusinessArchitectPanel() {
  const [mode, setMode] = useState<Mode>("blueprint");
  const [businessName, setBusinessName] = useState("");
  const [softwareType, setSoftwareType] = useState("crm");
  const [requirements, setRequirements] = useState("");
  const [useCases, setUseCases] = useState("");
  const [founderPersona, setFounderPersona] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useSuperToolPromptListener("business-software-architect", (text) => {
    setRequirements((prev) => (prev.trim() ? `${prev.trim()}\n${text}` : text));
  });

  const run = async () => {
    if (loading) return;
    setOutput("");
    setLoading(true);
    try {
      if (mode === "blueprint") {
        if (!businessName.trim() || !requirements.trim()) return;
        await streamBusinessPlan(
          {
            business_name: businessName,
            software_type: softwareType,
            requirements,
            team_size: "1-10",
          },
          (t) => setOutput((p) => p + t),
        );
      } else {
        if (!businessName.trim() || !useCases.trim()) return;
        await streamBusinessAgents(
          {
            business_name: businessName,
            use_cases: useCases,
            clone_founder: true,
            founder_persona: founderPersona,
          },
          (t) => setOutput((p) => p + t),
        );
      }
    } catch (e) {
      setOutput(`**Error:** ${e instanceof Error ? e.message : "Request failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <div className="cockpit-hero flex items-center gap-4 border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-cyan-500/5 p-4">
        <BrainCircuit className="h-8 w-8 text-violet-400 drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]" />
        <div>
          <h2 className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-xl font-bold text-transparent">
            Business Software Architect
          </h2>
          <p className="text-xs text-zinc-500">
            Accounting · Inventory · CRM · AI agents · digital clones
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/[0.06] p-3">
        <button
          type="button"
          onClick={() => setMode("blueprint")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
            mode === "blueprint"
              ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/40"
              : "text-zinc-500",
          )}
        >
          <Building2 className="h-4 w-4" /> Software Blueprint
        </button>
        <button
          type="button"
          onClick={() => setMode("agents")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
            mode === "agents"
              ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-400/40"
              : "text-zinc-500",
          )}
        >
          <Bot className="h-4 w-4" /> Agents &amp; Clones
        </button>
      </div>

      <div className="space-y-3 p-4">
        <input
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Business name"
          className="glass-input w-full rounded-xl px-3 py-2 text-sm"
        />
        {mode === "blueprint" ? (
          <>
            <div className="flex flex-wrap gap-2">
              {SOFTWARE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSoftwareType(t.id)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[11px]",
                    softwareType === t.id ? "bg-violet-500/20 text-violet-300" : "text-zinc-600",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Requirements: invoicing, multi-warehouse, role-based access…"
              rows={3}
              className="glass-input w-full resize-none rounded-xl px-3 py-2 text-sm"
            />
          </>
        ) : (
          <>
            <textarea
              value={useCases}
              onChange={(e) => setUseCases(e.target.value)}
              placeholder="Support bot, sales assistant, ops automation…"
              rows={2}
              className="glass-input w-full resize-none rounded-xl px-3 py-2 text-sm"
            />
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Users className="h-4 w-4 text-violet-400" />
              Founder digital clone persona
            </div>
            <textarea
              value={founderPersona}
              onChange={(e) => setFounderPersona(e.target.value)}
              placeholder="Tone, expertise, boundaries for your AI clone…"
              rows={2}
              className="glass-input w-full resize-none rounded-xl px-3 py-2 text-sm"
            />
          </>
        )}
        <Button
          onClick={run}
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Generate {mode === "blueprint" ? "Blueprint" : "Agent Workforce"}
        </Button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto border-t border-white/[0.06] p-4">
        {output ? (
          <MarkdownMessage content={output} />
        ) : (
          <p className="py-12 text-center text-sm text-zinc-500">
            Design custom business software and AI workforce
          </p>
        )}
      </div>
    </div>
  );
}

