/** Detect Roman English / Roman Urdu (Latin script) user input. */

const ROMAN_URDU_MARKERS =
  /\b(mujhe|mujhay|banani|banana|chahiye|chahte|k liye|ke liye|hy|hai|hain|krna|karna|website|kapray|kapde|dukan|business|bana|bano|banaye|karo|krdo)\b/i;

const LATIN_ONLY = /^[\x00-\x7F\s\d.,!?'"@#$%^&*()[\]{}:;+\-/\\]+$/;

const DEVANAGARI = /[\u0900-\u097F]/;
const ARABIC_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

const EXPLICIT_NATIVE_SCRIPT =
  /\b(devanagari|hindi\s*(me|mai|mein|script)|urdu\s*script|nastaliq|اردو|देवनागरी)\b/i;

export type RomanLanguageMode = "roman" | "devanagari" | "arabic" | "standard";

export function detectRomanLanguage(text: string): RomanLanguageMode {
  const t = text.trim();
  if (!t) return "standard";
  if (EXPLICIT_NATIVE_SCRIPT.test(t)) {
    if (DEVANAGARI.test(t)) return "devanagari";
    if (ARABIC_SCRIPT.test(t)) return "arabic";
    return "standard";
  }
  if (DEVANAGARI.test(t)) return "devanagari";
  if (ARABIC_SCRIPT.test(t)) return "arabic";
  if (ROMAN_URDU_MARKERS.test(t)) return "roman";
  if (LATIN_ONLY.test(t) && /[a-zA-Z]/.test(t)) return "roman";
  return "standard";
}

/** Polyglot script-lock prefix injected into agent prompts (belt-and-suspenders with backend system prompt). */
export function romanLanguageInstruction(mode: RomanLanguageMode): string {
  if (mode === "roman") {
    return (
      "[POLYGLOT RULE: User writes in Roman English/Roman Urdu using the LATIN alphabet only. " +
      "You MUST reply in the same Roman Latin script. " +
      "STRICTLY FORBIDDEN: Devanagari (हिंदी), Nastaliq, or Arabic-script Urdu unless explicitly requested. " +
      "Keep the reply concise and conversational — 1–4 short paragraphs, no encyclopedic essays.]\n"
    );
  }
  if (mode === "devanagari") {
    return "[POLYGLOT RULE: User writes in Devanagari. Match Devanagari script. Be concise.]\n";
  }
  if (mode === "arabic") {
    return "[POLYGLOT RULE: User writes in Arabic-script Urdu. Match that script. Be concise.]\n";
  }
  return "[Response style: Be concise and conversational — direct answers, no long essays.]\n";
}
