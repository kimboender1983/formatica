// ---------------------------------------------------------------------------
// Formatica – Barrel export
// ---------------------------------------------------------------------------

// Re-export everything from core
export * from "@formatica/core";
export type * from "@formatica/core";

// Components
export { default as FormBuilder } from "./components/FormBuilder.vue";
// Field registry
export {
    FormComponentsKey,
    getFieldComponent,
    getRegisteredFieldTypes,
    hasFieldType,
    registerFieldType,
    unregisterFieldType,
} from "./core/fieldRegistry";
export type { UseFormOptions } from "./core/useForm";
// Composables
export { FormContextKey, useForm } from "./core/useForm";
export type { FormI18nInstance, UseFormI18nOptions } from "./core/useFormI18n";
export { FormI18nKey, useFormI18n, useFormI18nContext } from "./core/useFormI18n";
// Vue-specific types (from form.ts which depends on Vue)
export type {
    FieldInstance,
    FormContext,
    FormEvent,
    FormEventName,
    FormEventPayloadMap,
    FormInstance,
    SubmitHandler,
} from "./types/form";
