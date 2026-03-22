// ---------------------------------------------------------------------------
// Formatica Core – Barrel export
// ---------------------------------------------------------------------------

// Types
export type * from "./types";

// Schema parser
export { parseFormSchema, SchemaValidationError, setFieldTypeChecker } from "./schemaParser";

// Validation
export { registerRule, unregisterRule, getRule, hasRule } from "./validation/ruleRegistry";

// Conditions
export { evaluateCondition } from "./conditions";

// Utilities
export { extractFields, isFieldNode } from "./extractFields";
export { deepMerge } from "./utils/deepMerge";
export { titleCase } from "./utils/titleCase";
export { sanitizeHtml } from "./utils/sanitize";
