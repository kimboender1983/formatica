// ---------------------------------------------------------------------------
// FormCraft – Validation rule registry
// ---------------------------------------------------------------------------

import type { RuleFn } from "../types/validation";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const rules = new Map<string, RuleFn>();

export function registerRule(name: string, fn: RuleFn): void {
    rules.set(name, fn);
}

export function unregisterRule(name: string): void {
    rules.delete(name);
}

export function getRule(name: string): RuleFn | undefined {
    return rules.get(name);
}

export function hasRule(name: string): boolean {
    return rules.has(name);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined || value === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    return false;
}

function interpolate(template: string, params: Record<string, unknown>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        return params[key] !== undefined ? String(params[key]) : `{${key}}`;
    });
}

function toNumber(value: unknown): number | null {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const n = Number(value);
        return Number.isNaN(n) ? null : n;
    }
    return null;
}

// ---------------------------------------------------------------------------
// Built-in rules
// ---------------------------------------------------------------------------

registerRule("required", (value) => {
    if (isEmpty(value)) return "This field is required";
    return true;
});

registerRule("email", (value) => {
    if (isEmpty(value)) return true;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(value)) || "Please enter a valid email address";
});

registerRule("phone", async (value) => {
    if (isEmpty(value)) return true;
    const str = String(value);
    try {
        const lib = await import("libphonenumber-js");
        return lib.isValidPhoneNumber(str) || "Please enter a valid phone number";
    } catch {
        // Fallback if libphonenumber-js not available
        if (/^\+[1-9]\d{6,14}$/.test(str.replace(/[\s\-().]/g, ""))) return true;
        return "Please enter a valid phone number";
    }
});

registerRule("url", (value) => {
    if (isEmpty(value)) return true;
    try {
        new URL(String(value));
        return true;
    } catch {
        return "Please enter a valid URL";
    }
});

registerRule("min", (value, params) => {
    if (isEmpty(value)) return true;
    const num = toNumber(value);
    const min = toNumber(params.min);
    if (num === null || min === null) return true;
    return num >= min || interpolate("Must be at least {min}", params);
});

registerRule("max", (value, params) => {
    if (isEmpty(value)) return true;
    const num = toNumber(value);
    const max = toNumber(params.max);
    if (num === null || max === null) return true;
    return num <= max || interpolate("Must be at most {max}", params);
});

registerRule("minLength", (value, params) => {
    if (isEmpty(value)) return true;
    const len = typeof value === "string" ? value.length : Array.isArray(value) ? value.length : 0;
    const min = toNumber(params.min) ?? toNumber(params.minLength) ?? 0;
    return len >= min || interpolate("Must be at least {min} characters", { min, ...params });
});

registerRule("maxLength", (value, params) => {
    if (isEmpty(value)) return true;
    const len = typeof value === "string" ? value.length : Array.isArray(value) ? value.length : 0;
    const max = toNumber(params.max) ?? toNumber(params.maxLength) ?? Infinity;
    return len <= max || interpolate("Must be at most {max} characters", { max, ...params });
});

registerRule("between", (value, params) => {
    if (isEmpty(value)) return true;
    const num = toNumber(value);
    const min = toNumber(params.min);
    const max = toNumber(params.max);
    if (num === null || min === null || max === null) return true;
    return (num >= min && num <= max) || interpolate("Must be between {min} and {max}", params);
});

registerRule("pattern", (value, params) => {
    if (isEmpty(value)) return true;
    const pattern = params.pattern ?? params.regex;
    if (typeof pattern !== "string") return true;
    const re = new RegExp(pattern);
    return re.test(String(value)) || interpolate("Does not match the required pattern", params);
});

registerRule("numeric", (value) => {
    if (isEmpty(value)) return true;
    return toNumber(value) !== null || "Must be a number";
});

registerRule("integer", (value) => {
    if (isEmpty(value)) return true;
    const num = toNumber(value);
    return (num !== null && Number.isInteger(num)) || "Must be an integer";
});

registerRule("alpha", (value) => {
    if (isEmpty(value)) return true;
    return /^[a-zA-Z]+$/.test(String(value)) || "Must contain only letters";
});

registerRule("alphaNumeric", (value) => {
    if (isEmpty(value)) return true;
    return /^[a-zA-Z0-9]+$/.test(String(value)) || "Must contain only letters and numbers";
});

registerRule("confirmed", (value, params, ctx) => {
    if (isEmpty(value)) return true;
    const target = String(params.target ?? "");
    const other = ctx.values[target] ?? ctx.values[`${target}_confirmation`];
    return value === other || "Confirmation does not match";
});

registerRule("requiredIf", (value, params, ctx) => {
    const targetField = String(params.field ?? "");
    const targetValue = params.value;
    const actual = ctx.values[targetField];
    const shouldRequire = targetValue !== undefined ? actual === targetValue : !isEmpty(actual);
    if (!shouldRequire) return true;
    return !isEmpty(value) || interpolate("This field is required when {field} is set", params);
});

registerRule("date", (value) => {
    if (isEmpty(value)) return true;
    const d = new Date(String(value));
    return !Number.isNaN(d.getTime()) || "Please enter a valid date";
});

registerRule("before", (value, params) => {
    if (isEmpty(value)) return true;
    const d = new Date(String(value));
    const before = new Date(String(params.date ?? params.before));
    if (Number.isNaN(d.getTime()) || Number.isNaN(before.getTime())) return true;
    return d < before || interpolate("Must be before {date}", params);
});

registerRule("after", (value, params) => {
    if (isEmpty(value)) return true;
    const d = new Date(String(value));
    const after = new Date(String(params.date ?? params.after));
    if (Number.isNaN(d.getTime()) || Number.isNaN(after.getTime())) return true;
    return d > after || interpolate("Must be after {date}", params);
});

registerRule("in", (value, params) => {
    if (isEmpty(value)) return true;
    const allowed = Array.isArray(params.values) ? params.values : [];
    return (allowed as unknown[]).includes(value) || "The selected value is not valid";
});

registerRule("notIn", (value, params) => {
    if (isEmpty(value)) return true;
    const disallowed = Array.isArray(params.values) ? params.values : [];
    return !(disallowed as unknown[]).includes(value) || "The selected value is not allowed";
});

registerRule("fileSize", (value, params) => {
    if (isEmpty(value)) return true;
    const maxBytes = toNumber(params.max) ?? Infinity;
    const files = Array.isArray(value) ? value : [value];
    for (const file of files) {
        const size =
            typeof file === "object" && file !== null && "size" in file
                ? toNumber((file as { size: unknown }).size)
                : null;
        if (size !== null && size > maxBytes) {
            return interpolate("File must be smaller than {max} bytes", params);
        }
    }
    return true;
});

registerRule("mimeType", (value, params) => {
    if (isEmpty(value)) return true;
    const allowed = Array.isArray(params.types)
        ? (params.types as string[])
        : typeof params.types === "string"
          ? params.types.split(",").map((s: string) => s.trim())
          : [];
    const files = Array.isArray(value) ? value : [value];
    for (const file of files) {
        const fileType =
            typeof file === "object" && file !== null && "type" in file
                ? String((file as { type: unknown }).type)
                : "";
        if (fileType && !allowed.some((t) => fileType.match(new RegExp(t.replace("*", ".*"))))) {
            return interpolate("File type is not allowed. Allowed: {types}", params);
        }
    }
    return true;
});

registerRule("maxFiles", (value, params) => {
    if (isEmpty(value)) return true;
    const max = toNumber(params.max) ?? Infinity;
    const count = Array.isArray(value) ? value.length : 1;
    return count <= max || interpolate("Maximum {max} files allowed", params);
});

registerRule("unique", (value) => {
    if (isEmpty(value)) return true;
    if (!Array.isArray(value)) return true;
    const set = new Set(value as unknown[]);
    return set.size === value.length || "All values must be unique";
});

registerRule("custom", (value, params) => {
    // Custom rules are handled at the ValidationRule level via validator fn.
    // This is a no-op fallback.
    void value;
    void params;
    return true;
});
