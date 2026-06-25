import type { SupportedLocale, LocalePack } from "../types";

const PACKS: LocalePack[] = [
  { code: "en", label: "English", rtl: false, loaded: true },
  { code: "ur", label: "Urdu", rtl: true, loaded: false },
  { code: "ar", label: "Arabic", rtl: true, loaded: false },
  { code: "zh", label: "Chinese", rtl: false, loaded: false },
  { code: "fr", label: "French", rtl: false, loaded: false },
  { code: "de", label: "German", rtl: false, loaded: false },
  { code: "es", label: "Spanish", rtl: false, loaded: false },
];

const STRINGS: Record<SupportedLocale, Record<string, string>> = {
  en: { "app.title": "OmniMind Medical", "ai.disclaimer": "Clinician review required" },
  ur: { "app.title": "اومنی مائنڈ میڈیکل", "ai.disclaimer": "کلینیشن جائزہ ضروری" },
  ar: { "app.title": "أومني مايند الطبي", "ai.disclaimer": "مراجعة الطبيب مطلوبة" },
  zh: { "app.title": "OmniMind 医疗", "ai.disclaimer": "需要临床医生审核" },
  fr: { "app.title": "OmniMind Médical", "ai.disclaimer": "Révision clinicien requise" },
  de: { "app.title": "OmniMind Medizin", "ai.disclaimer": "Klinische Überprüfung erforderlich" },
  es: { "app.title": "OmniMind Médico", "ai.disclaimer": "Revisión clínica requerida" },
};

/** Localization architecture — language packs, RTL support */
export class LocalizationArchitecture {
  private activeLocale: SupportedLocale = "en";
  private customPacks = new Map<string, Record<string, string>>();

  listLocales() {
    return [...PACKS];
  }

  setLocale(code: SupportedLocale) {
    this.activeLocale = code;
    const pack = PACKS.find((p) => p.code === code);
    if (pack) pack.loaded = true;
    return { locale: code, rtl: pack?.rtl ?? false };
  }

  t(key: string, locale?: SupportedLocale) {
    const loc = locale ?? this.activeLocale;
    return this.customPacks.get(loc)?.[key] ?? STRINGS[loc]?.[key] ?? STRINGS.en[key] ?? key;
  }

  registerPack(code: SupportedLocale, strings: Record<string, string>) {
    this.customPacks.set(code, strings);
  }

  getActiveLocale() {
    return this.activeLocale;
  }

  isRTL() {
    return PACKS.find((p) => p.code === this.activeLocale)?.rtl ?? false;
  }
}

let i18n: LocalizationArchitecture | null = null;

export function getLocalizationArchitecture() {
  if (!i18n) i18n = new LocalizationArchitecture();
  return i18n;
}
