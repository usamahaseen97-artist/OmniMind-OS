import type { LocaleId } from "./types";
import { SUPPORTED_LOCALES } from "./constants";

type MessageTable = Record<string, string>;

const MESSAGES: Record<LocaleId, MessageTable> = {
  en: {
    "core.projects": "Projects",
    "core.search": "Search",
    "core.settings": "Settings",
    "core.commandPalette": "Command Palette",
  },
  ur: {
    "core.projects": "پروجیکٹس",
    "core.search": "تلاش",
    "core.settings": "ترتیبات",
    "core.commandPalette": "کمانڈ پیلیٹ",
  },
  ar: {
    "core.projects": "المشاريع",
    "core.search": "بحث",
    "core.settings": "الإعدادات",
    "core.commandPalette": "لوحة الأوامر",
  },
  es: { "core.projects": "Proyectos", "core.search": "Buscar", "core.settings": "Ajustes", "core.commandPalette": "Paleta de comandos" },
  fr: { "core.projects": "Projets", "core.search": "Rechercher", "core.settings": "Paramètres", "core.commandPalette": "Palette de commandes" },
  de: { "core.projects": "Projekte", "core.search": "Suchen", "core.settings": "Einstellungen", "core.commandPalette": "Befehlspalette" },
  ja: { "core.projects": "プロジェクト", "core.search": "検索", "core.settings": "設定", "core.commandPalette": "コマンドパレット" },
  zh: { "core.projects": "项目", "core.search": "搜索", "core.settings": "设置", "core.commandPalette": "命令面板" },
};

/** Localization layer for OmniCore platform strings. */
export class OmniLocalization {
  locale: LocaleId = "en";

  supported() {
    return SUPPORTED_LOCALES;
  }

  setLocale(locale: LocaleId) {
    this.locale = locale;
    return locale;
  }

  t(key: string, fallback?: string) {
    return MESSAGES[this.locale]?.[key] ?? MESSAGES.en[key] ?? fallback ?? key;
  }
}

export const omniLocalization = new OmniLocalization();
