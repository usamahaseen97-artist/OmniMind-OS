"use client";

import { Orbit, Sigma } from "lucide-react";
import { DeckShell } from "../DeckShell";

const EQUATIONS = [
  "F = G(m₁m₂)/r²",
  "E = mc²",
  "vₑ = √(2GM/r)",
  "Δv = I_sp · g₀ · ln(m₀/m_f)",
];

export function DeckNasaPanel() {
  return (
    <DeckShell title="Physics & Structural Solver" subtitle="High-fidelity equation engine (mock)">
      <div className="flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-950/20 px-2 py-2">
        <Orbit className="h-5 w-5 text-violet-400" />
        <span className="text-[10px] text-violet-200">Orbital mechanics · stress tensors</span>
      </div>
      <ul className="space-y-2">
        {EQUATIONS.map((eq) => (
          <li
            key={eq}
            className="flex items-center gap-2 rounded border border-gray-800/80 bg-[#0B0C10] px-2 py-1.5 font-mono text-[11px] text-violet-200/90"
          >
            <Sigma className="h-3.5 w-3.5 shrink-0 text-violet-400" />
            {eq}
          </li>
        ))}
      </ul>
    </DeckShell>
  );
}
