# @formatica/core

Framework-agnostic schema-driven form engine. Provides types, validation, schema parsing, condition evaluation, field extraction, and global configuration used by `@formatica/vue` and `@formatica/react`.

## Installation

```bash
npm install @formatica/core
# or
yarn add @formatica/core
```

Zero external dependencies. Lightweight and framework-agnostic.

## What's Included

- **Types** -- `FormSchema`, `FieldSchema`, `SchemaNode`, `ThemeConfig`, `Condition`, and all related interfaces
- **Validation** -- Rule registry with 14+ built-in rules, custom sync/async rules, `registerRule`, `getRule`, `hasRule`, `unregisterRule`
- **Schema parsing** -- `parseFormSchema()` validates and parses raw JSON into typed `FormSchema` objects
- **Field extraction** -- `extractFields()` flattens the schema tree into a plain array of `FieldSchema`
- **Condition evaluation** -- `evaluateCondition()` resolves show/hide conditions against form values
- **Global configuration** -- `configureFormatica()` sets default theme and locale

## Global Configuration

```ts
import { configureFormatica, getFormaticaConfig } from "@formatica/core";

configureFormatica({
  theme: {
    name: "my-theme",
    colors: { primary: "#059669" },
  },
  locale: "en",
});

// Access later
const config = getFormaticaConfig();
```

### FormaticaCoreConfig

```ts
interface FormaticaCoreConfig {
  theme?: ThemeConfig;
  locale?: string;
}
```

## Usage

### Parse a schema

```ts
import { parseFormSchema } from "@formatica/core";

const json = '{ "fields": [{ "type": "text", "name": "email", "label": "Email" }] }';

try {
  const schema = parseFormSchema(JSON.parse(json));
  console.log("Valid schema:", schema);
} catch (err) {
  // SchemaValidationError with details
  console.error("Invalid schema:", err.message);
}
```

### Extract fields

```ts
import { extractFields, isFieldNode } from "@formatica/core";

// Flatten the schema tree into a plain array of FieldSchema
const fields = extractFields(schema.fields);

for (const field of fields) {
  console.log(field.name, field.type, field.rules);
}

// Check if a node is a field (not a layout container)
for (const node of schema.fields) {
  if (isFieldNode(node)) {
    console.log("Field:", node.name);
  } else {
    console.log("Layout:", node.type);
  }
}
```

### Evaluate conditions

```ts
import { evaluateCondition } from "@formatica/core";

const condition = { field: "country", operator: "eq", value: "NL" };
const values = { country: "NL", city: "Amsterdam" };

const visible = evaluateCondition(condition, values);
console.log(visible); // true

// Complex condition group
const group = {
  and: [
    { field: "age", operator: "gte", value: 18 },
    {
      or: [
        { field: "country", operator: "eq", value: "NL" },
        { field: "country", operator: "eq", value: "DE" },
      ],
    },
  ],
};
```

### Validate data

```ts
import { getRule, registerRule, hasRule, unregisterRule } from "@formatica/core";

// Register a custom rule
registerRule("postalCode", (value) => {
  if (!value) return true;
  return /^\d{4}\s?[A-Za-z]{2}$/.test(String(value)) || "Enter a valid Dutch postal code";
});

// Check if a rule exists
console.log(hasRule("postalCode")); // true

// Get and run a rule
const ruleFn = getRule("required");
if (ruleFn) {
  const result = await ruleFn(value, {}, ctx);
  if (typeof result === "string") {
    console.error("Validation error:", result);
  }
}

// Remove a rule
unregisterRule("postalCode");
```

## All Exports

### Functions

| Export | Description |
| --- | --- |
| `configureFormatica()` | Set global theme and locale |
| `getFormaticaConfig()` | Get current global config |
| `parseFormSchema()` | Parse and validate raw JSON into `FormSchema` |
| `extractFields()` | Flatten schema tree into `FieldSchema[]` |
| `isFieldNode()` | Type guard: is a `SchemaNode` a field? |
| `evaluateCondition()` | Evaluate a condition against form values |
| `registerRule()` | Register a custom validation rule |
| `unregisterRule()` | Remove a validation rule |
| `getRule()` | Get a validation rule function by name |
| `hasRule()` | Check if a rule is registered |
| `setFieldTypeChecker()` | Override field type validation |
| `deepMerge()` | Deep-merge utility |
| `sanitizeHtml()` | Sanitize HTML for safe rendering |
| `titleCase()` | Convert string to title case |

### Types

| Export | Description |
| --- | --- |
| `FormSchema` | Root schema interface |
| `FieldSchema` | Field configuration |
| `SchemaNode` | Union of field and layout node types |
| `ThemeConfig` | Theme configuration (colors, typography, spacing, borders, etc.) |
| `FormaticaCoreConfig` | Global config interface |
| `Condition` | Show/hide condition |
| `I18nContext` | Internationalization context |
| `SchemaValidationError` | Error thrown by `parseFormSchema()` |

### Error Classes

| Export | Description |
| --- | --- |
| `SchemaValidationError` | Thrown when schema parsing fails with details |

## License

[MIT](../../LICENSE)
