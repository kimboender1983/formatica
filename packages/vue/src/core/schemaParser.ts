// ---------------------------------------------------------------------------
// Formatica Vue – Schema parser (hooks Vue field registry into core parser)
// ---------------------------------------------------------------------------

import {
    SchemaValidationError,
    parseFormSchema as coreParseFormSchema,
    setFieldTypeChecker,
} from "@formatica/core";
import { hasFieldType } from "./fieldRegistry";

// Register the Vue field registry as the custom type checker
setFieldTypeChecker(hasFieldType);

// Re-export with the Vue field registry hooked in
export { SchemaValidationError };
export const parseFormSchema = coreParseFormSchema;
