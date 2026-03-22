// ---------------------------------------------------------------------------
// Formatica Vue – Plugin (global configuration)
// ---------------------------------------------------------------------------

import type { ThemeConfig } from "@formatica/core";
import type { App, Component, InjectionKey, Plugin } from "vue";
import { reactive } from "vue";
import { registerFieldType } from "./core/fieldRegistry";

export interface FormaticaOptions {
    theme?: ThemeConfig;
    locale?: string;
    fallbackLocale?: string;
    components?: Record<string, Component>;
}

export const FormaticaKey: InjectionKey<FormaticaOptions> = Symbol("Formatica");

export function createFormatica(options: FormaticaOptions = {}): Plugin {
    return {
        install(app: App) {
            app.provide(FormaticaKey, reactive(options));

            // Register global custom components
            if (options.components) {
                for (const [type, component] of Object.entries(options.components)) {
                    registerFieldType(type, component);
                }
            }
        },
    };
}
