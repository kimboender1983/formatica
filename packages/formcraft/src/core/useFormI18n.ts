// ---------------------------------------------------------------------------
// FormCraft – I18n composable
// ---------------------------------------------------------------------------

import { type InjectionKey, inject, provide, type Ref } from "vue";
import type { FieldTranslations, FormTranslations } from "../types/schema";
import { titleCase } from "../utils/titleCase";

// ---------------------------------------------------------------------------
// Injection key
// ---------------------------------------------------------------------------

export const FormI18nKey: InjectionKey<FormI18nInstance> = Symbol("FormCraftI18n");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormI18nInstance {
    locale: Ref<string>;
    fallbackLocale: string;
    t: (field: string, key: string) => string;
    tOption: (field: string, optionValue: string) => string;
    tValidation: (ruleName: string, params?: Record<string, unknown>) => string;
}

export interface UseFormI18nOptions {
    locale: Ref<string>;
    fallbackLocale?: string;
    fieldTranslations?: Record<string, FieldTranslations>;
    formTranslations?: FormTranslations;
}

// ---------------------------------------------------------------------------
// Default validation messages
// ---------------------------------------------------------------------------

const defaultMessages: Record<string, string> = {
    required: "This field is required",
    email: "Please enter a valid email address",
    url: "Please enter a valid URL",
    min: "Must be at least {min}",
    max: "Must be at most {max}",
    minLength: "Must be at least {min} characters",
    maxLength: "Must be at most {max} characters",
    between: "Must be between {min} and {max}",
    pattern: "Invalid format",
    numeric: "Must be a number",
    integer: "Must be an integer",
    alpha: "Must contain only letters",
    alphaNumeric: "Must contain only letters and numbers",
    confirmed: "Confirmation does not match",
    date: "Please enter a valid date",
};

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useFormI18n(options: UseFormI18nOptions): FormI18nInstance {
    const {
        locale,
        fallbackLocale = "en",
        fieldTranslations = {},
        formTranslations = {},
    } = options;

    /**
     * Resolve a translated string for a field.
     * Resolution order: translations[locale] -> translations[fallback] -> titleCase(fieldName)
     */
    function t(field: string, key: string): string {
        const translations = fieldTranslations[field];
        if (translations) {
            const localeData = translations[locale.value];
            if (localeData) {
                const value = localeData[key as keyof typeof localeData];
                if (typeof value === "string") return value;
            }

            const fallbackData = translations[fallbackLocale];
            if (fallbackData) {
                const value = fallbackData[key as keyof typeof fallbackData];
                if (typeof value === "string") return value;
            }
        }

        // For labels, fall back to title-cased field name
        if (key === "label") return titleCase(field);
        return "";
    }

    /**
     * Resolve a translated option label.
     */
    function tOption(field: string, optionValue: string): string {
        const translations = fieldTranslations[field];
        if (translations) {
            const localeData = translations[locale.value];
            if (localeData?.options?.[optionValue]) return localeData.options[optionValue];

            const fallbackData = translations[fallbackLocale];
            if (fallbackData?.options?.[optionValue]) return fallbackData.options[optionValue];
        }
        return optionValue;
    }

    /**
     * Resolve a translated validation message with parameter interpolation.
     */
    function tValidation(ruleName: string, params?: Record<string, unknown>): string {
        // Check form-level translations first
        const localeMessages = formTranslations[locale.value]?.messages;
        if (localeMessages?.[ruleName]) {
            return interpolate(localeMessages[ruleName], params ?? {});
        }

        const fallbackMessages = formTranslations[fallbackLocale]?.messages;
        if (fallbackMessages?.[ruleName]) {
            return interpolate(fallbackMessages[ruleName], params ?? {});
        }

        // Default messages
        const template = defaultMessages[ruleName];
        if (template) return interpolate(template, params ?? {});

        return `Validation failed: ${ruleName}`;
    }

    const instance: FormI18nInstance = {
        locale,
        fallbackLocale,
        t,
        tOption,
        tValidation,
    };

    provide(FormI18nKey, instance);

    return instance;
}

/**
 * Inject the i18n instance provided by a parent useFormI18n call.
 */
export function useFormI18nContext(): FormI18nInstance | undefined {
    return inject(FormI18nKey);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function interpolate(template: string, params: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        return params[key] !== undefined ? String(params[key]) : `{${key}}`;
    });
}
