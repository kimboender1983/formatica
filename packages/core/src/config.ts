// ---------------------------------------------------------------------------
// Formatica Core – Global configuration
// ---------------------------------------------------------------------------

import type { ThemeConfig } from "./types/theme";

export interface FormaticaCoreConfig {
    theme?: ThemeConfig;
    locale?: string;
}

let globalConfig: FormaticaCoreConfig = {};

export function configureFormatica(config: FormaticaCoreConfig): void {
    globalConfig = { ...config };
}

export function getFormaticaConfig(): FormaticaCoreConfig {
    return globalConfig;
}
