// ---------------------------------------------------------------------------
// Formatica Core – Barrel export
// ---------------------------------------------------------------------------

// Conditions
export { evaluateCondition } from "./conditions";
export type { FormaticaCoreConfig } from "./config";
// Global configuration
export { configureFormatica, getFormaticaConfig } from "./config";
// Utilities
export { extractFields, isFieldNode } from "./extractFields";
// Schema parser
export { parseFormSchema, SchemaValidationError, setFieldTypeChecker } from "./schemaParser";
// Types
export type * from "./types";
export { deepMerge } from "./utils/deepMerge";
export { sanitizeHtml } from "./utils/sanitize";
export { titleCase } from "./utils/titleCase";
// Validation
export { getRule, hasRule, registerRule, unregisterRule } from "./validation/ruleRegistry";
