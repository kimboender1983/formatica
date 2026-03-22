// ---------------------------------------------------------------------------
// Formatica – Form instance & context types
// ---------------------------------------------------------------------------

import type { ComputedRef, Ref } from "vue";
import type { FieldSchema, FormSchema } from "./schema";

// ---------------------------------------------------------------------------
// Form context (passed into dynamic callbacks like disabled / visible / options)
// ---------------------------------------------------------------------------

export interface FormContext {
    values: Record<string, unknown>;
    getFieldValue: (name: string) => unknown;
}

// ---------------------------------------------------------------------------
// Field instance (runtime representation of a field)
// ---------------------------------------------------------------------------

export interface FieldInstance {
    name: string;
    value: Ref<unknown>;
    errors: Ref<string[]>;
    touched: Ref<boolean>;
    dirty: Ref<boolean>;
    disabled: Ref<boolean>;
    visible: Ref<boolean>;
    schema: FieldSchema;
    validate: () => Promise<string[]>;
    reset: () => void;
    clear: () => void;
}

// ---------------------------------------------------------------------------
// Form events
// ---------------------------------------------------------------------------

export type FormEventName =
    | "submit"
    | "submit:success"
    | "submit:error"
    | "reset"
    | "change"
    | "field:change"
    | "field:blur"
    | "field:focus"
    | "validate"
    | "validate:field";

export interface FormEventPayloadMap {
    submit: { values: Record<string, unknown> };
    "submit:success": { values: Record<string, unknown>; result: unknown };
    "submit:error": { values: Record<string, unknown>; error: unknown };
    reset: undefined;
    change: { values: Record<string, unknown> };
    "field:change": { field: string; value: unknown; previousValue: unknown };
    "field:blur": { field: string; value: unknown };
    "field:focus": { field: string };
    validate: { valid: boolean; errors: Record<string, string[]> };
    "validate:field": { field: string; valid: boolean; errors: string[] };
}

export type FormEvent<E extends FormEventName = FormEventName> = {
    type: E;
    payload: FormEventPayloadMap[E];
    timestamp: number;
};

// ---------------------------------------------------------------------------
// Submit handler
// ---------------------------------------------------------------------------

export type SubmitHandler = (
    values: Record<string, unknown>,
    ctx: FormContext,
) => void | Promise<void>;

// ---------------------------------------------------------------------------
// Form instance (the object returned by useForm / provided to templates)
// ---------------------------------------------------------------------------

export interface FormInstance {
    // ---- Reactive state ----
    values: Record<string, unknown>;
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
    dirty: Record<string, boolean>;

    // ---- Computed state ----
    isValid: ComputedRef<boolean>;
    isDirty: ComputedRef<boolean>;
    isSubmitting: Ref<boolean>;
    submitCount: Ref<number>;

    // ---- Methods ----
    validate: () => Promise<boolean>;
    validateField: (name: string) => Promise<string[]>;
    submit: (handler?: SubmitHandler) => Promise<void>;
    reset: () => void;
    clear: () => void;
    setError: (name: string, messages: string[]) => void;
    clearError: (name: string) => void;
    clearErrors: () => void;
    getField: (name: string) => FieldInstance | undefined;
    setFieldValue: (name: string, value: unknown) => void;
    setFieldDisabled: (name: string, disabled: boolean) => void;
    setFieldVisible: (name: string, visible: boolean) => void;

    // ---- Events ----
    on: <E extends FormEventName>(
        event: E,
        handler: (payload: FormEventPayloadMap[E]) => void,
    ) => () => void;

    // ---- Locale ----
    locale: Ref<string>;
    setLocale: (locale: string) => void;

    // ---- Schema ----
    schema: FormSchema;
    updateSchema: (schema: FormSchema) => void;
}
