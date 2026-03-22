// ---------------------------------------------------------------------------
// Formatica React – Global configuration provider
// ---------------------------------------------------------------------------

import type { ThemeConfig } from "@formatica/core";
import type { ComponentType } from "react";
import { createContext, type ReactNode, useContext } from "react";
import type { FieldComponentProps } from "./FormBuilder";

export interface FormaticaConfig {
    theme?: ThemeConfig;
    locale?: string;
    fallbackLocale?: string;
    components?: Record<string, ComponentType<FieldComponentProps>>;
}

const FormaticaConfigContext = createContext<FormaticaConfig>({});

export function FormaticaProvider({
    config,
    children,
}: {
    config: FormaticaConfig;
    children: ReactNode;
}) {
    return (
        <FormaticaConfigContext.Provider value={config}>{children}</FormaticaConfigContext.Provider>
    );
}

export function useFormaticaConfig(): FormaticaConfig {
    return useContext(FormaticaConfigContext);
}
