# @formatica/vue

Schema-driven, fully-typed form builder for Vue 3. Define forms with a JSON schema and get automatic rendering, validation, conditional logic, and Tailwind-ready styling.

## Installation

```bash
npm install @formatica/vue
```

## Quick Start

```vue
<script setup lang="ts">
import { FormRenderer, useForm } from "@formatica/vue";
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

const { form } = useForm(schema);

function handleSubmit(data: Record<string, unknown>) {
  console.log("Form submitted:", data);
}
</script>

<template>
  <FormRenderer :form="form" @submit="handleSubmit" />
</template>
```

## Features

- Schema-driven rendering with 15+ field types
- Built-in validation with custom validator support
- Conditional field visibility and behavior
- Multi-step form support
- Full TypeScript support
- Tailwind CSS ready

## License

[MIT](../../LICENSE)
