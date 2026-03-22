import type { InjectionKey } from "vue";
import { reactive } from "vue";

export interface PreviewValidationStore {
    values: Record<string, string>;
    errors: Record<string, string | null>;
    touched: Record<string, boolean>;
    /** Register a field's validate function so submit can call it */
    registerValidator: (name: string, fn: () => void) => void;
    /** Validate all registered fields, returns true if no errors */
    validateAll: () => boolean;
}

export const PreviewValidationKey: InjectionKey<PreviewValidationStore> =
    Symbol("PreviewValidation");

export function createPreviewValidation(): PreviewValidationStore {
    const values = reactive<Record<string, string>>({});
    const errors = reactive<Record<string, string | null>>({});
    const touched = reactive<Record<string, boolean>>({});
    const validators = new Map<string, () => void>();

    function registerValidator(name: string, fn: () => void) {
        validators.set(name, fn);
    }

    function validateAll(): boolean {
        // Mark all as touched and run validators
        for (const [name, validate] of validators) {
            touched[name] = true;
            validate();
        }
        return !Object.values(errors).some((e) => e !== null && e !== undefined);
    }

    return { values, errors, touched, registerValidator, validateAll };
}
