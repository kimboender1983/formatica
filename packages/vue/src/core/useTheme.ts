// ---------------------------------------------------------------------------
// Formatica – Theme composable
// ---------------------------------------------------------------------------

import type { ThemeConfig } from "@formatica/core";
import {
    type ComputedRef,
    computed,
    type InjectionKey,
    inject,
    isRef,
    provide,
    type Ref,
    ref,
    toRef,
} from "vue";

// ---------------------------------------------------------------------------
// Injection key
// ---------------------------------------------------------------------------

export const FormThemeKey: InjectionKey<ThemeInstance> = Symbol("FormaticaTheme");

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ThemeClasses {
    form: string;
    field: string;
    label: string;
    input: string;
    error: string;
    helpText: string;
    group: string;
    row: string;
    steps: string;
    tabs: string;
    button: string;
}

export interface ThemeInstance {
    config: ThemeConfig;
    classes: ComputedRef<ThemeClasses>;
    cssVars: ComputedRef<Record<string, string>>;
}

// ---------------------------------------------------------------------------
// Default theme
// ---------------------------------------------------------------------------

const defaultTheme: ThemeConfig = {
    name: "default",
    colors: {
        primary: "#3b82f6",
        primaryHover: "#2563eb",
        error: "#ef4444",
        errorHover: "#dc2626",
        success: "#22c55e",
        warning: "#f59e0b",
        info: "#3b82f6",
        text: "#1f2937",
        textSecondary: "#6b7280",
        textDisabled: "#9ca3af",
        background: "#ffffff",
        backgroundDisabled: "#f3f4f6",
        border: "#d1d5db",
        borderFocus: "#3b82f6",
        borderError: "#ef4444",
        placeholder: "#9ca3af",
    },
    typography: {
        fontFamily: "inherit",
        fontSize: "0.875rem",
        fontSizeSmall: "0.75rem",
        fontSizeLarge: "1rem",
        lineHeight: "1.5",
        labelFontWeight: "500",
    },
    spacing: {
        fieldGap: "1rem",
        rowGap: "1rem",
        inputPaddingX: "0.75rem",
        inputPaddingY: "0.5rem",
        labelMarginBottom: "0.375rem",
    },
    borders: {
        radius: "0.375rem",
        radiusSmall: "0.25rem",
        radiusLarge: "0.5rem",
        width: "1px",
        style: "solid",
    },
    shadows: {
        focus: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        error: "0 0 0 3px rgba(239, 68, 68, 0.1)",
        dropdown: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    },
    transitions: {
        duration: "150ms",
        timingFunction: "ease-in-out",
    },
};

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useTheme(config?: ThemeConfig | Ref<ThemeConfig | undefined>): ThemeInstance {
    const themeRef: Ref<ThemeConfig> = isRef(config)
        ? computed(() => config.value ?? defaultTheme)
        : ref(config ?? defaultTheme);

    const classes = computed<ThemeClasses>(() => {
        const comps = themeRef.value.components ?? {};
        return {
            form: comps.form ?? "fc-form",
            field: comps.field ?? "fc-field",
            label: comps.label ?? "fc-label",
            input: comps.input ?? "fc-input",
            error: comps.error ?? "fc-error",
            helpText: comps.helpText ?? "fc-help-text",
            group: comps.group ?? "fc-group",
            row: comps.row ?? "fc-row",
            steps: comps.steps ?? "fc-steps",
            tabs: comps.tabs ?? "fc-tabs",
            button: comps.button ?? "fc-button",
        };
    });

    const cssVars = computed<Record<string, string>>(() => {
        const t = themeRef.value;
        const vars: Record<string, string> = {};

        if (t.colors) {
            for (const [key, value] of Object.entries(t.colors)) {
                if (value) vars[`--fc-color-${camelToKebab(key)}`] = value;
            }
        }
        if (t.typography) {
            for (const [key, value] of Object.entries(t.typography)) {
                if (value) vars[`--fc-${camelToKebab(key)}`] = value;
            }
        }
        if (t.spacing) {
            for (const [key, value] of Object.entries(t.spacing)) {
                if (value) vars[`--fc-${camelToKebab(key)}`] = value;
            }
        }
        if (t.borders) {
            for (const [key, value] of Object.entries(t.borders)) {
                if (value) vars[`--fc-border-${camelToKebab(key)}`] = value;
            }
        }
        if (t.shadows) {
            for (const [key, value] of Object.entries(t.shadows)) {
                if (value) vars[`--fc-shadow-${camelToKebab(key)}`] = value;
            }
        }
        if (t.transitions) {
            for (const [key, value] of Object.entries(t.transitions)) {
                if (value) vars[`--fc-transition-${camelToKebab(key)}`] = value;
            }
        }
        if (t.cssVars) {
            Object.assign(vars, t.cssVars);
        }

        return vars;
    });

    const instance: ThemeInstance = {
        config: themeRef.value,
        classes,
        cssVars,
    };

    provide(FormThemeKey, instance);

    return instance;
}

/**
 * Inject the theme instance provided by a parent useTheme call.
 * Falls back to default theme classes if no provider exists.
 */
export function useThemeClasses(): ThemeInstance {
    const injected = inject(FormThemeKey);
    if (injected) return injected;
    // Return a minimal default without providing (read-only consumer)
    return useThemeDefault();
}

function useThemeDefault(): ThemeInstance {
    const classes = computed<ThemeClasses>(() => ({
        form: "fc-form",
        field: "fc-field",
        label: "fc-label",
        input: "fc-input",
        error: "fc-error",
        helpText: "fc-help-text",
        group: "fc-group",
        row: "fc-row",
        steps: "fc-steps",
        tabs: "fc-tabs",
        button: "fc-button",
    }));

    const cssVars = computed<Record<string, string>>(() => ({}));

    return { config: defaultTheme, classes, cssVars };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
