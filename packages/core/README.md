# @formatica/core

Framework-agnostic schema-driven form engine. Provides types, validation, parsing, and conditional logic used by `@formatica/vue` and `@formatica/react`.

## Installation

```bash
npm install @formatica/core
```

## Usage

`@formatica/core` is typically used indirectly through `@formatica/vue` or `@formatica/react`. You can also use it directly to work with form schemas, validators, and parsers.

```ts
import type { FormSchema, FieldConfig } from "@formatica/core";
import { validateField, parseFieldValue } from "@formatica/core";

const schema: FormSchema = {
  fields: [
    { name: "email", type: "email", label: "Email", required: true },
  ],
};

// Validate a field value
const error = validateField(schema.fields[0], "user@example.com");

// Parse a field value
const parsed = parseFieldValue(schema.fields[0], "user@example.com");
```

## License

[MIT](../../LICENSE)
