// ---------------------------------------------------------------------------
// Formatica Core – Validation types
// ---------------------------------------------------------------------------

import type { FormContext } from "./schema";

// ---------------------------------------------------------------------------
// Built-in rule name literals
// ---------------------------------------------------------------------------

export type BuiltInRuleName =
    | "required"
    | "email"
    | "url"
    | "min"
    | "max"
    | "minLength"
    | "maxLength"
    | "pattern"
    | "numeric"
    | "integer"
    | "alpha"
    | "alphaNumeric"
    | "between"
    | "confirmed"
    | "date"
    | "before"
    | "after"
    | "in"
    | "notIn"
    | "mimeType"
    | "fileSize"
    | "maxFiles"
    | "unique"
    | "custom";

// ---------------------------------------------------------------------------
// Rule function signature
// ---------------------------------------------------------------------------

export type RuleFn = (
    value: unknown,
    params: Record<string, unknown>,
    ctx: FormContext,
) => boolean | string | Promise<boolean | string>;

// ---------------------------------------------------------------------------
// Validation rule descriptor
// ---------------------------------------------------------------------------

export interface ValidationRule {
    /** Name of a built-in rule or a custom identifier. */
    name: BuiltInRuleName | (string & Record<never, never>);
    /** Parameters forwarded to the rule function. */
    params?: Record<string, unknown>;
    /** Custom error message (may contain {field} / {param} placeholders). */
    message?: string;
    /** Custom rule function – takes precedence over name-based lookup. */
    validator?: RuleFn;
    /** When true the rule is only evaluated if the value is non-empty. */
    optional?: boolean;
    /** Abort remaining rules for this field on failure. */
    bail?: boolean;
    /** Debounce interval in ms (useful for async rules). */
    debounce?: number;
}

// ---------------------------------------------------------------------------
// Schema-level validation error
// ---------------------------------------------------------------------------

export interface SchemaError {
    field: string;
    rule: string;
    message: string;
    params?: Record<string, unknown>;
}
