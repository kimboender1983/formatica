// ---------------------------------------------------------------------------
// Formatica Core – Schema parser & validator
// ---------------------------------------------------------------------------

import { extractFields } from "./extractFields";
import type {
    Condition,
    ConditionGroup,
    FormSchema,
    FormSettings,
    SchemaNode,
} from "./types/schema";
import type { SchemaError } from "./types/validation";

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class SchemaValidationError extends Error {
    public readonly errors: SchemaError[];

    constructor(errors: SchemaError[]) {
        const summary = errors.map((e) => `[${e.field}] ${e.message}`).join("; ");
        super(`Schema validation failed: ${summary}`);
        this.name = "SchemaValidationError";
        this.errors = errors;
    }
}

// ---------------------------------------------------------------------------
// Known field types
// ---------------------------------------------------------------------------

const KNOWN_FIELD_TYPES = new Set([
    "text",
    "number",
    "textarea",
    "select",
    "checkbox",
    "checkbox-group",
    "radio",
    "switch",
    "date",
    "file",
    "slider",
    "tags",
    "richtext",
    "hidden",
    "phone",
]);

const CONTAINER_TYPES = new Set(["row", "group", "steps", "tabs", "divider", "html"]);

// ---------------------------------------------------------------------------
// Custom field type checker (pluggable for framework-specific registries)
// ---------------------------------------------------------------------------

let customFieldTypeChecker: ((type: string) => boolean) | null = null;

/**
 * Register a custom field type checker. This allows framework-specific packages
 * (e.g. @formatica/vue) to hook their field registry into schema validation.
 */
export function setFieldTypeChecker(checker: ((type: string) => boolean) | null): void {
    customFieldTypeChecker = checker;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateCondition(
    condition: unknown,
    fieldPath: string,
    allFieldNames: Set<string>,
    errors: SchemaError[],
): void {
    if (!isPlainObject(condition)) {
        errors.push({
            field: fieldPath,
            rule: "condition",
            message: "Condition must be an object",
        });
        return;
    }

    const cond = condition as Record<string, unknown>;

    // Compound conditions
    if ("and" in cond || "or" in cond) {
        const group = cond as ConditionGroup;
        const children = group.and ?? group.or ?? [];
        if (!Array.isArray(children)) {
            errors.push({
                field: fieldPath,
                rule: "condition",
                message: "Compound condition must have an array of sub-conditions",
            });
            return;
        }
        for (let i = 0; i < children.length; i++) {
            validateCondition(children[i], `${fieldPath}.condition[${i}]`, allFieldNames, errors);
        }
        return;
    }

    // Simple condition
    const simple = cond as unknown as Condition;
    if (typeof simple.field !== "string") {
        errors.push({
            field: fieldPath,
            rule: "condition",
            message: 'Condition must have a "field" property of type string',
        });
    } else if (!allFieldNames.has(simple.field)) {
        errors.push({
            field: fieldPath,
            rule: "condition",
            message: `Condition references unknown field "${simple.field}"`,
        });
    }

    if (typeof simple.operator !== "string") {
        errors.push({
            field: fieldPath,
            rule: "condition",
            message: 'Condition must have an "operator" property',
        });
    }
}

function validateFieldNode(
    field: unknown,
    path: string,
    allFieldNames: Set<string>,
    errors: SchemaError[],
): void {
    if (!isPlainObject(field)) {
        errors.push({ field: path, rule: "type", message: "Field must be an object" });
        return;
    }

    const f = field as Record<string, unknown>;

    // name
    if (typeof f.name !== "string" || f.name.length === 0) {
        errors.push({ field: path, rule: "name", message: 'Field must have a non-empty "name"' });
    }

    // type
    if (typeof f.type !== "string") {
        errors.push({ field: path, rule: "type", message: 'Field must have a "type" string' });
    } else if (!KNOWN_FIELD_TYPES.has(f.type) && !customFieldTypeChecker?.(f.type)) {
        errors.push({
            field: `${path}.${f.name as string}`,
            rule: "type",
            message: `Unknown field type "${f.type}"`,
        });
    }

    // options required for select, radio, checkbox-group
    if (["select", "radio", "checkbox-group"].includes(f.type as string)) {
        if (f.options === undefined || f.options === null) {
            errors.push({
                field: `${path}.${f.name as string}`,
                rule: "options",
                message: `Field type "${f.type as string}" requires an "options" property`,
            });
        }
    }

    // condition references
    if (f.condition) {
        validateCondition(f.condition, `${path}.${f.name as string}`, allFieldNames, errors);
    }
}

function validateNode(
    node: unknown,
    path: string,
    allFieldNames: Set<string>,
    errors: SchemaError[],
): void {
    if (!isPlainObject(node)) {
        errors.push({ field: path, rule: "type", message: "Node must be an object" });
        return;
    }

    const n = node as Record<string, unknown>;
    const type = n.type as string;

    if (typeof type !== "string") {
        errors.push({ field: path, rule: "type", message: 'Node must have a "type" string' });
        return;
    }

    // If it's a field node (has a name), validate as field
    if (typeof n.name === "string") {
        validateFieldNode(node, path, allFieldNames, errors);
        return;
    }

    // Container nodes
    if (!CONTAINER_TYPES.has(type)) {
        errors.push({
            field: path,
            rule: "type",
            message: `Unknown node type "${type}"`,
        });
        return;
    }

    if (type === "row" || type === "group") {
        if (!Array.isArray(n.children)) {
            errors.push({
                field: path,
                rule: "children",
                message: `"${type}" node must have a "children" array`,
            });
        } else {
            validateNodes(n.children, `${path}.children`, allFieldNames, errors);
        }
        if (type === "group" && n.condition) {
            validateCondition(n.condition, `${path}.condition`, allFieldNames, errors);
        }
    } else if (type === "steps") {
        if (!Array.isArray(n.steps)) {
            errors.push({
                field: path,
                rule: "steps",
                message: '"steps" node must have a "steps" array',
            });
        } else {
            for (let i = 0; i < n.steps.length; i++) {
                const step = n.steps[i] as Record<string, unknown>;
                if (!isPlainObject(step)) {
                    errors.push({
                        field: `${path}.steps[${i}]`,
                        rule: "type",
                        message: "Step item must be an object",
                    });
                    continue;
                }
                if (typeof step.title !== "string") {
                    errors.push({
                        field: `${path}.steps[${i}]`,
                        rule: "title",
                        message: 'Step item must have a "title" string',
                    });
                }
                if (Array.isArray(step.children)) {
                    validateNodes(
                        step.children,
                        `${path}.steps[${i}].children`,
                        allFieldNames,
                        errors,
                    );
                }
            }
        }
    } else if (type === "tabs") {
        if (!Array.isArray(n.tabs)) {
            errors.push({
                field: path,
                rule: "tabs",
                message: '"tabs" node must have a "tabs" array',
            });
        } else {
            for (let i = 0; i < n.tabs.length; i++) {
                const tab = n.tabs[i] as Record<string, unknown>;
                if (!isPlainObject(tab)) {
                    errors.push({
                        field: `${path}.tabs[${i}]`,
                        rule: "type",
                        message: "Tab item must be an object",
                    });
                    continue;
                }
                if (typeof tab.title !== "string") {
                    errors.push({
                        field: `${path}.tabs[${i}]`,
                        rule: "title",
                        message: 'Tab item must have a "title" string',
                    });
                }
                if (Array.isArray(tab.children)) {
                    validateNodes(
                        tab.children,
                        `${path}.tabs[${i}].children`,
                        allFieldNames,
                        errors,
                    );
                }
            }
        }
    } else if (type === "html") {
        if (typeof n.content !== "string") {
            errors.push({
                field: path,
                rule: "content",
                message: '"html" node must have a "content" string',
            });
        }
    }
    // "divider" has no required children/content — always valid if type matches
}

function validateNodes(
    nodes: unknown[],
    basePath: string,
    allFieldNames: Set<string>,
    errors: SchemaError[],
): void {
    for (let i = 0; i < nodes.length; i++) {
        validateNode(nodes[i], `${basePath}[${i}]`, allFieldNames, errors);
    }
}

function validateSettings(settings: unknown, errors: SchemaError[]): void {
    if (!isPlainObject(settings)) {
        errors.push({ field: "settings", rule: "type", message: "Settings must be an object" });
        return;
    }

    const s = settings as Record<string, unknown>;

    if (
        s.layout !== undefined &&
        !["vertical", "horizontal", "inline"].includes(s.layout as string)
    ) {
        errors.push({
            field: "settings.layout",
            rule: "enum",
            message: 'Layout must be "vertical", "horizontal", or "inline"',
        });
    }

    if (s.size !== undefined && !["small", "medium", "large"].includes(s.size as string)) {
        errors.push({
            field: "settings.size",
            rule: "enum",
            message: 'Size must be "small", "medium", or "large"',
        });
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse and validate a JSON schema, returning a typed FormSchema.
 * Collects all validation errors before throwing a single SchemaValidationError.
 */
export function parseFormSchema(json: unknown): FormSchema {
    const errors: SchemaError[] = [];

    if (!isPlainObject(json)) {
        errors.push({ field: "$root", rule: "type", message: "Schema must be a plain object" });
        throw new SchemaValidationError(errors);
    }

    const raw = json as Record<string, unknown>;

    // fields
    if (!Array.isArray(raw.fields)) {
        errors.push({ field: "fields", rule: "type", message: '"fields" must be an array' });
        throw new SchemaValidationError(errors);
    }

    // Collect all field names recursively for cross-reference validation
    const allFields = extractFields(raw.fields as SchemaNode[]);
    const allFieldNames = new Set<string>();
    const nameTracker = new Map<string, number>();
    for (const f of allFields) {
        allFieldNames.add(f.name);
        const count = (nameTracker.get(f.name) ?? 0) + 1;
        nameTracker.set(f.name, count);
        if (count > 1) {
            errors.push({
                field: f.name,
                rule: "unique",
                message: `Duplicate field name "${f.name}"`,
            });
        }
    }

    // Validate each node recursively (fields and containers)
    validateNodes(raw.fields, "fields", allFieldNames, errors);

    // Validate settings
    if (raw.settings !== undefined) {
        validateSettings(raw.settings, errors);
    }

    if (errors.length > 0) {
        throw new SchemaValidationError(errors);
    }

    return {
        id: typeof raw.id === "string" ? raw.id : undefined,
        version: typeof raw.version === "string" ? raw.version : undefined,
        fields: raw.fields as SchemaNode[],
        settings: raw.settings as FormSettings | undefined,
        translations: raw.translations as FormSchema["translations"],
    };
}
