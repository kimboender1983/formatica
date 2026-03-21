// ---------------------------------------------------------------------------
// FormCraft – Theme types
// ---------------------------------------------------------------------------

export interface ThemeConfig {
    /** Unique theme identifier. */
    name: string;

    // ---- Colour tokens ----
    colors?: {
        primary?: string;
        primaryHover?: string;
        error?: string;
        errorHover?: string;
        success?: string;
        warning?: string;
        info?: string;
        text?: string;
        textSecondary?: string;
        textDisabled?: string;
        background?: string;
        backgroundDisabled?: string;
        border?: string;
        borderFocus?: string;
        borderError?: string;
        placeholder?: string;
    };

    // ---- Typography tokens ----
    typography?: {
        fontFamily?: string;
        fontSize?: string;
        fontSizeSmall?: string;
        fontSizeLarge?: string;
        lineHeight?: string;
        labelFontWeight?: string;
    };

    // ---- Spacing / sizing tokens ----
    spacing?: {
        fieldGap?: string;
        rowGap?: string;
        inputPaddingX?: string;
        inputPaddingY?: string;
        labelMarginBottom?: string;
    };

    // ---- Border / radius tokens ----
    borders?: {
        radius?: string;
        radiusSmall?: string;
        radiusLarge?: string;
        width?: string;
        style?: string;
    };

    // ---- Shadows ----
    shadows?: {
        focus?: string;
        error?: string;
        dropdown?: string;
    };

    // ---- Transitions ----
    transitions?: {
        duration?: string;
        timingFunction?: string;
    };

    // ---- Per-component class overrides ----
    components?: {
        form?: string;
        field?: string;
        label?: string;
        input?: string;
        error?: string;
        helpText?: string;
        group?: string;
        row?: string;
        steps?: string;
        tabs?: string;
        button?: string;
        [component: string]: string | undefined;
    };

    // ---- Arbitrary CSS custom-properties ----
    cssVars?: Record<string, string>;
}
