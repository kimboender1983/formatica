// ---------------------------------------------------------------------------
// Formatica – Validation composable
// ---------------------------------------------------------------------------

import type { FieldSchema, FormSettings, ValidationRule } from "@formatica/core";
import { evaluateCondition, getRule } from "@formatica/core";
import { type Ref, ref } from "vue";
import type { FormContext } from "../types/form";

// ---------------------------------------------------------------------------
// Rule string parser ("required|minLength:3|email" → ValidationRule[])
// ---------------------------------------------------------------------------

function parseRuleString(input: string): ValidationRule[] {
    return input.split("|").map((segment) => {
        const [name, ...paramParts] = segment.split(":");
        const params: Record<string, unknown> = {};
        if (paramParts.length > 0) {
            const paramStr = paramParts.join(":");
            // Support "min:3" → { min: 3 } or "between:1,10" → { min: 1, max: 10 }
            const values = paramStr.split(",");
            if (name === "between" && values.length === 2) {
                params.min = values[0];
                params.max = values[1];
            } else if (values.length === 1) {
                // Use the rule name as the param key
                params[name] = values[0];
            } else {
                params.values = values;
            }
        }
        return { name, params };
    });
}

function normalizeRules(field: FieldSchema): ValidationRule[] {
    const raw = field.rules;
    if (!raw) {
        const rules: ValidationRule[] = [];
        if (field.required) rules.push({ name: "required" });
        return rules;
    }

    if (typeof raw === "string") {
        return parseRuleString(raw);
    }

    if (Array.isArray(raw)) {
        return raw.flatMap((r) => (typeof r === "string" ? parseRuleString(r) : []));
    }

    // Record<string, unknown> form: { required: true, minLength: 3 }
    const rules: ValidationRule[] = [];
    for (const [name, paramValue] of Object.entries(raw)) {
        if (paramValue === false) continue;
        const params: Record<string, unknown> = {};
        if (typeof paramValue === "object" && paramValue !== null && !Array.isArray(paramValue)) {
            Object.assign(params, paramValue);
        } else if (paramValue !== true) {
            params[name] = paramValue;
        }
        rules.push({ name, params });
    }
    return rules;
}

// ---------------------------------------------------------------------------
// Debounce helper
// ---------------------------------------------------------------------------

function debounce<T extends (...args: never[]) => Promise<unknown>>(
    fn: T,
    ms: number,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pendingResolve: ((v: Awaited<ReturnType<T>>) => void) | null = null;

    return (...args: Parameters<T>) => {
        return new Promise<Awaited<ReturnType<T>>>((resolve) => {
            if (timer !== null) {
                clearTimeout(timer);
                // Resolve the previous pending promise with empty errors
                if (pendingResolve) pendingResolve([] as Awaited<ReturnType<T>>);
            }
            pendingResolve = resolve;
            timer = setTimeout(async () => {
                timer = null;
                const result = await fn(...args);
                resolve(result as Awaited<ReturnType<T>>);
                pendingResolve = null;
            }, ms);
        });
    };
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export interface UseValidationOptions {
    fields: Ref<FieldSchema[]>;
    values: Ref<Record<string, unknown>>;
    settings?: FormSettings;
}

export interface UseValidationReturn {
    errors: Ref<Record<string, string[]>>;
    validateField: (name: string, ctx: FormContext) => Promise<string[]>;
    validateAll: (ctx: FormContext) => Promise<Record<string, string[]>>;
    clearFieldErrors: (name: string) => void;
    clearAllErrors: () => void;
}

export function useValidation(options: UseValidationOptions): UseValidationReturn {
    const { fields, values, settings } = options;
    const errors = ref<Record<string, string[]>>({});
    const debouncedValidators = new Map<string, (...args: never[]) => Promise<string[]>>();

    function getDebounced(name: string, ms: number): (...args: never[]) => Promise<string[]> {
        const key = `${name}:${ms}`;
        if (!debouncedValidators.has(key)) {
            debouncedValidators.set(
                key,
                debounce(async (...args: never[]) => {
                    return runValidateField(args[0] as string, args[1] as FormContext);
                }, ms),
            );
        }
        const validator = debouncedValidators.get(key);
        if (!validator) throw new Error(`Debounced validator not found for ${key}`);
        return validator;
    }

    async function runValidateField(name: string, ctx: FormContext): Promise<string[]> {
        const field = fields.value.find((f) => f.name === name);
        if (!field) return [];

        const fieldRules = normalizeRules(field);
        const value = values.value[name];
        const fieldErrors: string[] = [];

        for (const rule of fieldRules) {
            // Check conditional rules
            if (rule.params?.when) {
                const condition = rule.params.when as Record<string, unknown>;
                if ("field" in condition || "and" in condition || "or" in condition) {
                    const met = evaluateCondition(
                        condition as Parameters<typeof evaluateCondition>[0],
                        values.value,
                    );
                    if (!met) continue;
                }
            }

            // Skip optional rules when value is empty
            if (rule.optional && isEmpty(value)) continue;

            // Resolve the rule function
            let result: boolean | string;

            if (rule.validator) {
                result = await rule.validator(value, rule.params ?? {}, ctx);
            } else {
                const fn = getRule(rule.name);
                if (!fn) continue;
                result = await fn(value, rule.params ?? {}, ctx);
            }

            if (result !== true) {
                const message = rule.message
                    ? interpolateMessage(rule.message, rule.params ?? {})
                    : typeof result === "string"
                      ? result
                      : `Validation failed for rule: ${rule.name}`;
                fieldErrors.push(message);

                if (rule.bail) break;
            }
        }

        errors.value[name] = fieldErrors;
        return fieldErrors;
    }

    async function validateField(name: string, ctx: FormContext): Promise<string[]> {
        const debounceMs = settings?.debounce;
        if (debounceMs && debounceMs > 0) {
            const fn = getDebounced(name, debounceMs);
            return fn(name as never, ctx as never);
        }
        return runValidateField(name, ctx);
    }

    async function validateAll(ctx: FormContext): Promise<Record<string, string[]>> {
        const results: Record<string, string[]> = {};
        const promises = fields.value.map(async (field) => {
            const fieldErrors = await runValidateField(field.name, ctx);
            if (fieldErrors.length > 0) {
                results[field.name] = fieldErrors;
            }
        });
        await Promise.all(promises);
        errors.value = { ...results };
        return results;
    }

    function clearFieldErrors(name: string): void {
        delete errors.value[name];
    }

    function clearAllErrors(): void {
        errors.value = {};
    }

    return {
        errors,
        validateField,
        validateAll,
        clearFieldErrors,
        clearAllErrors,
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined || value === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
}

function interpolateMessage(template: string, params: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        return params[key] !== undefined ? String(params[key]) : `{${key}}`;
    });
}
