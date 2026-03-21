// ---------------------------------------------------------------------------
// FormCraft – I18n types
// ---------------------------------------------------------------------------

// Canonical definitions – re-exported from schema.ts to avoid duplication.
export type { FieldTranslations, FormTranslations } from "./schema";

// ---------------------------------------------------------------------------
// I18n context
// ---------------------------------------------------------------------------

export interface I18nContext {
    /** Current active locale. */
    locale: string;
    /** Fallback locale used when a key is missing in the active locale. */
    fallbackLocale: string;
    /** Available locales. */
    availableLocales: string[];
    /** Translate a key with optional interpolation parameters. */
    t: (key: string, params?: Record<string, unknown>) => string;
    /** Set the active locale. */
    setLocale: (locale: string) => void;
    /** Register translations for a locale. */
    registerLocale: (locale: string, messages: Record<string, string>) => void;
    /** Check whether a translation key exists for the active locale. */
    hasKey: (key: string) => boolean;
}
