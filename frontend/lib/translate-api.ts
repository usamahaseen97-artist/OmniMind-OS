export type LanguageOption = {
  code: string;
  label: string;
  native: string;
};

export type TranslateResult = {
  translated_text: string;
  detected_source?: string;
  urdu_script?: string;
  roman_urdu?: string;
  notes?: string;
  source_lang?: string;
  target_lang?: string;
  mode?: string;
};

import { getBackendUrl } from "./backend-url";

export async function fetchLanguages(): Promise<LanguageOption[]> {
  const res = await fetch(`${getBackendUrl()}/translate/languages`);
  if (!res.ok) return [];
  const data = (await res.json()) as { languages: LanguageOption[] };
  return data.languages ?? [];
}

export async function translateText(payload: {
  text: string;
  source_lang?: string;
  target_lang?: string;
  mode?: "text" | "speech";
}): Promise<TranslateResult> {
  const res = await fetch(`${getBackendUrl()}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_lang: payload.source_lang ?? "auto",
      target_lang: payload.target_lang ?? "ur",
      mode: payload.mode ?? "text",
      text: payload.text,
    }),
  });
  if (!res.ok) throw new Error(`Translation failed (${res.status})`);
  return res.json();
}
