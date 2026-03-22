// ---------------------------------------------------------------------------
// Formatica React – useForm hook
// ---------------------------------------------------------------------------

import type { FieldSchema, FormSchema } from "@formatica/core";
import { evaluateCondition, extractFields, getRule } from "@formatica/core";
import { useCallback, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormInstance {
    values: Record<string, unknown>;
    errors: Record<string, string[]>;
    touched: Record<string, boolean>;
    dirty: Record<string, boolean>;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
    submitCount: number;
    setFieldValue: (name: string, value: unknown) => void;
    validate: () => Promise<boolean>;
    validateField: (name: string) => Promise<boolean>;
    submit: (handler: (values: Record<string, unknown>) => void | Promise<void>) => Promise<void>;
    reset: () => void;
    clear: () => void;
    setError: (field: string, message: string | string[]) => void;
    clearError: (field: string) => void;
    clearErrors: () => void;
    getFieldValue: (name: string) => unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTypeDefault(field: FieldSchema): unknown {
    switch (field.type) {
        case "tags":
        case "checkbox-group":
            return [];
        case "checkbox":
        case "switch":
            return false;
        case "number":
        case "slider":
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

interface ParsedRule {
    name: string;
    params: Record<string, unknown>;
}

function parseRules(rules: string | string[] | Record<string, unknown> | undefined): ParsedRule[] {
    if (!rules) return [];

    if (typeof rules === "string") {
        return rules.split("|").map(parseRuleString);
    }
    if (Array.isArray(rules)) {
        return rules.map(parseRuleString);
    }
    // Record form: { required: true, minLength: 3, ... }
    return Object.entries(rules)
        .filter(([, v]) => v !== false && v !== undefined)
        .map(([name, paramValue]) => ({
            name,
            params:
                typeof paramValue === "object" && paramValue !== null
                    ? (paramValue as Record<string, unknown>)
                    : { [name]: paramValue },
        }));
}

function parseRuleString(rule: string): ParsedRule {
    const [name = "", ...paramParts] = rule.split(":");
    const paramStr = paramParts.join(":");
    const params: Record<string, unknown> = {};
    if (paramStr) {
        // "min:3" → { min: 3 }, "between:1,10" → { min: 1, max: 10 }
        const values = paramStr.split(",");
        if (name === "between" && values.length === 2) {
            params.min = Number(values[0]);
            params.max = Number(values[1]);
        } else if (name === "pattern") {
            params.pattern = paramStr;
        } else {
            params[name] = values.length === 1 ? values[0] : values;
            // Also set as numeric if parseable
            if (values.length === 1) {
                const n = Number(values[0]);
                if (!Number.isNaN(n)) {
                    params[name] = n;
                    // Common alias: minLength:3 → params.min = 3
                    if (name === "minLength") params.min = n;
                    if (name === "maxLength") params.max = n;
                }
            }
        }
    }
    return { name, params };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseFormOptions {
    locale?: string;
}

export function useForm(schema: FormSchema, _options?: UseFormOptions): FormInstance {
    const fields = extractFields(schema.fields);
    const initialValuesRef = useRef(buildDefaults(fields));
    const fieldsRef = useRef(fields);

    const [values, setValues] = useState<Record<string, unknown>>(() => ({
        ...initialValuesRef.current,
    }));
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [dirty, setDirty] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitCount, setSubmitCount] = useState(0);

    // Keep latest values in a ref for async validation
    const valuesRef = useRef(values);
    valuesRef.current = values;
    const errorsRef = useRef(errors);
    errorsRef.current = errors;

    const isValid = Object.values(errors).every((e) => e.length === 0);
    const isDirty = Object.values(dirty).some(Boolean);

    // ---- Field value ----

    const setFieldValue = useCallback((name: string, value: unknown) => {
        setValues((prev) => ({ ...prev, [name]: value }));
        setDirty((prev) => ({ ...prev, [name]: true }));
    }, []);

    const getFieldValue = useCallback((name: string) => valuesRef.current[name], []);

    // ---- Validation ----

    const validateSingleField = useCallback(
        async (name: string, currentValues: Record<string, unknown>): Promise<string[]> => {
            const field = fieldsRef.current.find((f) => f.name === name);
            if (!field) return [];

            // Check condition — if field is hidden, skip validation
            if (field.condition) {
                const visible = evaluateCondition(field.condition, currentValues);
                if (!visible) return [];
            }

            const rules = parseRules(field.rules);
            // If field is marked required, ensure required rule is included
            if (field.required && !rules.some((r) => r.name === "required")) {
                rules.unshift({ name: "required", params: {} });
            }

            const fieldErrors: string[] = [];
            const ctx = {
                values: currentValues,
                getFieldValue: (n: string) => currentValues[n],
            };

            for (const rule of rules) {
                const ruleFn = getRule(rule.name);
                if (!ruleFn) continue;

                const result = await ruleFn(currentValues[name], rule.params, ctx);
                if (typeof result === "string") {
                    fieldErrors.push(result);
                }
            }

            return fieldErrors;
        },
        [],
    );

    const validateField = useCallback(
        async (name: string): Promise<boolean> => {
            const fieldErrors = await validateSingleField(name, valuesRef.current);
            setErrors((prev) => ({ ...prev, [name]: fieldErrors }));
            setTouched((prev) => ({ ...prev, [name]: true }));
            return fieldErrors.length === 0;
        },
        [validateSingleField],
    );

    const validate = useCallback(async (): Promise<boolean> => {
        const currentValues = valuesRef.current;
        const allErrors: Record<string, string[]> = {};
        let allValid = true;

        for (const field of fieldsRef.current) {
            const fieldErrors = await validateSingleField(field.name, currentValues);
            allErrors[field.name] = fieldErrors;
            if (fieldErrors.length > 0) allValid = false;
        }

        setErrors(allErrors);
        return allValid;
    }, [validateSingleField]);

    // ---- Submit ----

    const submit = useCallback(
        async (
            handler: (values: Record<string, unknown>) => void | Promise<void>,
        ): Promise<void> => {
            setIsSubmitting(true);
            setSubmitCount((prev) => prev + 1);

            // Mark all as touched
            const allTouched: Record<string, boolean> = {};
            for (const field of fieldsRef.current) {
                allTouched[field.name] = true;
            }
            setTouched(allTouched);

            try {
                const valid = await validate();
                if (!valid) return;
                await handler({ ...valuesRef.current });
            } finally {
                setIsSubmitting(false);
            }
        },
        [validate],
    );

    // ---- Reset / Clear ----

    const reset = useCallback(() => {
        setValues({ ...initialValuesRef.current });
        setErrors({});
        setTouched({});
        setDirty({});
    }, []);

    const clear = useCallback(() => {
        const cleared: Record<string, unknown> = {};
        for (const field of fieldsRef.current) {
            cleared[field.name] = null;
        }
        setValues(cleared);
        setErrors({});
    }, []);

    // ---- Error management ----

    const setError = useCallback((field: string, message: string | string[]) => {
        const msgs = Array.isArray(message) ? message : [message];
        setErrors((prev) => ({ ...prev, [field]: msgs }));
    }, []);

    const clearError = useCallback((field: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        values,
        errors,
        touched,
        dirty,
        isValid,
        isDirty,
        isSubmitting,
        submitCount,
        setFieldValue,
        validate,
        validateField,
        submit,
        reset,
        clear,
        setError,
        clearError,
        clearErrors,
        getFieldValue,
    };
}
