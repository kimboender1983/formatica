// ---------------------------------------------------------------------------
// Formatica – Main form composable
// ---------------------------------------------------------------------------

import { computed, type InjectionKey, provide, reactive, ref, watch } from "vue";
import type { FieldSchema, FieldTranslations, FormSchema } from "@formatica/core";
import { evaluateCondition, extractFields } from "@formatica/core";
import type { FieldInstance, FormContext, FormInstance, SubmitHandler } from "../types/form";
import { createEventBus } from "./eventBus";
import { useFormI18n } from "./useFormI18n";
import { useValidation } from "./useValidation";

// ---------------------------------------------------------------------------
// Injection key
// ---------------------------------------------------------------------------

export const FormContextKey: InjectionKey<FormInstance> = Symbol("FormaticaContext");

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface UseFormOptions {
    locale?: string;
    fallbackLocale?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeDefault(field: FieldSchema): unknown {
    switch (field.type) {
        case "tags":
            return [];
        case "checkbox-group":
            return [];
        case "checkbox":
            return false;
        case "switch":
            return false;
        case "number":
        case "slider":
            return null;
        case "file":
            return null;
        default:
            return "";
    }
}

function buildDefaults(fields: FieldSchema[]): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const field of fields) {
        values[field.name] = field.defaultValue ?? getTypeDefault(field);
    }
    return values;
}

function collectFieldTranslations(fields: FieldSchema[]): Record<string, FieldTranslations> {
    const map: Record<string, FieldTranslations> = {};
    for (const field of fields) {
        if (field.translations) map[field.name] = field.translations;
    }
    return map;
}

// ---------------------------------------------------------------------------
// Main composable
// ---------------------------------------------------------------------------

export function useForm(schema: FormSchema, options?: UseFormOptions): FormInstance {
    const locale = ref(options?.locale ?? "en");
    const fallbackLocale = options?.fallbackLocale ?? "en";

    let currentSchema = schema;
    const fieldsRef = ref<FieldSchema[]>(extractFields(schema.fields));

    // Core reactive state
    const values = reactive<Record<string, unknown>>(buildDefaults(extractFields(schema.fields)));
    const errors = reactive<Record<string, string[]>>({});
    const touched = reactive<Record<string, boolean>>({});
    const dirty = reactive<Record<string, boolean>>({});
    const isSubmitting = ref(false);
    const submitCount = ref(0);

    const isValid = computed(() => Object.values(errors).every((e) => e.length === 0));
    const isDirty = computed(() => Object.values(dirty).some(Boolean));

    const bus = createEventBus();

    function getFormContext(): FormContext {
        return { values: { ...values }, getFieldValue: (name: string) => values[name] };
    }

    // Validation & i18n
    const valuesRef = computed(() => ({ ...values }));
    const validation = useValidation({
        fields: fieldsRef,
        values: valuesRef,
        settings: schema.settings,
    });

    useFormI18n({
        locale,
        fallbackLocale,
        fieldTranslations: collectFieldTranslations(extractFields(schema.fields)),
        formTranslations: schema.translations,
    });

    let initialValues = buildDefaults(extractFields(schema.fields));

    // Watch value changes
    watch(
        () => ({ ...values }),
        (newVals, oldVals) => {
            if (!oldVals) return;
            for (const key of Object.keys(newVals)) {
                if (newVals[key] !== oldVals[key]) {
                    dirty[key] = true;
                    bus.emit("field:change", {
                        field: key,
                        value: newVals[key],
                        previousValue: oldVals[key],
                    });
                    if (schema.settings?.validateOnChange) validateField(key);
                }
            }
            bus.emit("change", { values: newVals });
        },
        { deep: true },
    );

    // Field instances
    const fieldInstances = new Map<string, FieldInstance>();

    function buildFieldInstance(fs: FieldSchema): FieldInstance {
        const n = fs.name;
        return {
            name: n,
            value: computed({
                get: () => values[n],
                set: (v) => {
                    values[n] = v;
                },
            }),
            errors: computed(() => errors[n] ?? []),
            touched: computed({
                get: () => touched[n] ?? false,
                set: (v) => {
                    touched[n] = v;
                },
            }),
            dirty: computed({
                get: () => dirty[n] ?? false,
                set: (v) => {
                    dirty[n] = v;
                },
            }),
            disabled: computed(() =>
                typeof fs.disabled === "function"
                    ? fs.disabled(getFormContext())
                    : (fs.disabled ?? false),
            ),
            visible: computed(() => {
                if (fs.condition) return evaluateCondition(fs.condition, values);
                if (typeof fs.visible === "function") return fs.visible(getFormContext());
                return fs.visible ?? true;
            }),
            schema: fs,
            validate: () => validateField(n),
            reset: () => {
                values[n] = initialValues[n] ?? null;
                delete errors[n];
                touched[n] = false;
                dirty[n] = false;
            },
            clear: () => {
                values[n] = null;
                delete errors[n];
            },
        };
    }

    function initFieldInstances(): void {
        fieldInstances.clear();
        for (const field of extractFields(currentSchema.fields)) {
            fieldInstances.set(field.name, buildFieldInstance(field));
        }
    }
    initFieldInstances();

    // ---- Core methods ----

    async function validateField(name: string): Promise<string[]> {
        const fieldErrors = await validation.validateField(name, getFormContext());
        errors[name] = fieldErrors;
        bus.emit("validate:field", {
            field: name,
            valid: fieldErrors.length === 0,
            errors: fieldErrors,
        });
        return fieldErrors;
    }

    async function validate(): Promise<boolean> {
        const allErrors = await validation.validateAll(getFormContext());
        for (const key of Object.keys(errors)) {
            if (!(key in allErrors)) delete errors[key];
        }
        for (const [key, errs] of Object.entries(allErrors)) {
            errors[key] = errs;
        }
        const valid = Object.values(allErrors).every((e) => e.length === 0);
        bus.emit("validate", { valid, errors: { ...allErrors } });
        return valid;
    }

    async function submit(handler?: SubmitHandler): Promise<void> {
        isSubmitting.value = true;
        submitCount.value += 1;
        try {
            for (const f of extractFields(currentSchema.fields)) touched[f.name] = true;
            const valid = await validate();
            if (!valid) {
                bus.emit("submit:error", {
                    values: { ...values },
                    error: new Error("Validation failed"),
                });
                return;
            }
            bus.emit("submit", { values: { ...values } });
            if (handler) await handler({ ...values }, getFormContext());
            bus.emit("submit:success", { values: { ...values }, result: undefined });
        } catch (error: unknown) {
            bus.emit("submit:error", { values: { ...values }, error });
            throw error;
        } finally {
            isSubmitting.value = false;
        }
    }

    function reset(): void {
        for (const f of extractFields(currentSchema.fields)) {
            values[f.name] = initialValues[f.name] ?? null;
            delete errors[f.name];
            touched[f.name] = false;
            dirty[f.name] = false;
        }
        validation.clearAllErrors();
        bus.emit("reset", undefined);
    }

    function clear(): void {
        for (const f of extractFields(currentSchema.fields)) {
            values[f.name] = null;
            delete errors[f.name];
        }
        validation.clearAllErrors();
    }

    function updateSchema(newSchema: FormSchema): void {
        currentSchema = newSchema;
        const newFields = extractFields(newSchema.fields);
        fieldsRef.value = newFields;
        initialValues = buildDefaults(newFields);
        for (const f of newFields) {
            if (!(f.name in values)) values[f.name] = f.defaultValue ?? null;
        }
        const newNames = new Set(newFields.map((f) => f.name));
        for (const key of Object.keys(values)) {
            if (!newNames.has(key)) {
                delete values[key];
                delete errors[key];
                delete touched[key];
                delete dirty[key];
            }
        }
        initFieldInstances();
    }

    // ---- Build instance ----

    const instance: FormInstance = {
        values,
        errors,
        touched,
        dirty,
        isValid,
        isDirty,
        isSubmitting,
        submitCount,
        validate,
        validateField,
        submit,
        reset,
        clear,
        setError: (name, messages) => {
            errors[name] = messages;
        },
        clearError: (name) => {
            delete errors[name];
            validation.clearFieldErrors(name);
        },
        clearErrors: () => {
            for (const k of Object.keys(errors)) delete errors[k];
            validation.clearAllErrors();
        },
        getField: (name) => fieldInstances.get(name),
        setFieldValue: (name, value) => {
            values[name] = value;
        },
        setFieldDisabled: (name, disabled) => {
            const fs = extractFields(currentSchema.fields).find((f) => f.name === name);
            if (fs) fs.disabled = disabled;
        },
        setFieldVisible: (name, visible) => {
            const fs = extractFields(currentSchema.fields).find((f) => f.name === name);
            if (fs) fs.visible = visible;
        },
        on: bus.on,
        locale,
        setLocale: (l) => {
            locale.value = l;
        },
        schema: currentSchema,
        updateSchema,
    };

    provide(FormContextKey, instance);
    return instance;
}
