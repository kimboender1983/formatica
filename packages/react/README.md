# @formatica/react

Schema-driven form builder for React. Powered by `@formatica/core`, it provides components and hooks for building forms from JSON schemas with automatic validation and conditional logic.

## Installation

```bash
npm install @formatica/react
```

## Quick Start

```tsx
import { FormRenderer, useForm } from "@formatica/react";
import type { FormSchema } from "@formatica/core";

const schema: FormSchema = {
  fields: [
    { name: "name", type: "text", label: "Name", required: true },
    { name: "email", type: "email", label: "Email", required: true },
    {
      name: "role",
      type: "select",
      label: "Role",
      options: [
        { label: "Developer", value: "dev" },
        { label: "Designer", value: "design" },
      ],
    },
  ],
};

function App() {
  const form = useForm(schema);

  function handleSubmit(data: Record<string, unknown>) {
    console.log("Form submitted:", data);
  }

  return <FormRenderer form={form} onSubmit={handleSubmit} />;
}
```

## Features

- Schema-driven rendering with 15+ field types
- Built-in validation with custom validator support
- Conditional field visibility and behavior
- Multi-step form support
- Full TypeScript support
- React 18 and 19 compatible

## License

[MIT](../../LICENSE)
