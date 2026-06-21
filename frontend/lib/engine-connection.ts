/** Detect hard engine failures — not casual mentions of LM Studio in help text. */

const HARD_FAILURE_PATTERNS = [
  /^\*\*no\s+(ai\s+)?response/i,
  /no response from ai engine/i,
  /cannot reach lm studio/i,
  /lm studio unavailable/i,
  /lm studio timed out/i,
  /cannot reach api/i,
  /^stream failed \(\d/i,
  /gemini unavailable/i,
  /connection refused/i,
  /econnrefused/i,
  /failed to fetch/i,
  /probe timeout/i,
];

export function isEngineConnectionMessage(text: string): boolean {
  const t = text.trim();
  if (!t || t.length < 24) return false;
  return HARD_FAILURE_PATTERNS.some((re) => re.test(t));
}
