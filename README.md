# Formatica

Schema-driven, fully-typed form builder for Vue and React. Define your forms with a JSON schema and let Formatica handle rendering, validation, conditional logic, and data parsing.

## Packages

| Package | Description |
| --- | --- |
| [`@formatica/core`](./packages/core) | Framework-agnostic form engine -- types, validation, parsing, conditions |
| [`@formatica/vue`](./packages/vue) | Vue 3 form components and composables |
| [`@formatica/react`](./packages/react) | React form components and hooks |

## Quick Start

### Vue

```bash
npm install @formatica/vue
```

```vue
<script setup lang="ts">
import { FormRenderer, useForm } from "@formatica/vue";
import type { FormSchema } from "@formatica/core";

const schema: FormSchema = {
  fields: [
    { name: "email", type: "email", label: "Email", required: true },
    { name: "password", type: "password", label: "Password", required: true },
  ],
};

const { form } = useForm(schema);
</script>

<template>
  <FormRenderer :form="form" @submit="console.log" />
</template>
```

### React

```bash
npm install @formatica/react
```

```tsx
import { FormRenderer, useForm } from "@formatica/react";
import type { FormSchema } from "@formatica/core";

const schema: FormSchema = {
  fields: [
    { name: "email", type: "email", label: "Email", required: true },
    { name: "password", type: "password", label: "Password", required: true },
  ],
};

function App() {
  const form = useForm(schema);
  return <FormRenderer form={form} onSubmit={console.log} />;
}
```

## Playground

An interactive playground showcasing all field types and features is available. Run it locally:

```bash
yarn dev
```

## Development

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run playground
yarn dev

# Lint & format
yarn lint:fix
yarn format

# Run tests
yarn test
```

## License

[MIT](./LICENSE)
