# Formatica

Schema-driven, fully-typed form builder for Vue and React. Define your forms with a JSON schema and let Formatica handle rendering, validation, conditional logic, theming, and data parsing.

## Packages

| Package | Description |
| --- | --- |
| [`@formatica/core`](./packages/core) | Framework-agnostic form engine -- types, validation, parsing, conditions, global config |
| [`@formatica/vue`](./packages/vue) | Vue 3 plugin, form components, and composables |
| [`@formatica/react`](./packages/react) | React provider, form components, and hooks |

## Quick Start

### Vue

```bash
npm install @formatica/vue libphonenumber-js
```

```ts
// main.ts
import { createApp } from "vue";
import { createFormatica } from "@formatica/vue";
import "@formatica/vue/style.css";
import App from "./App.vue";

const app = createApp(App);
app.use(
  createFormatica({
    theme: {
      name: "default",
      colors: { primary: "#059669", error: "#dc2626" },
      borders: { radius: "0.5rem" },
    },
    locale: "en",
  }),
);
app.mount("#app");
```

```vue
<script setup lang="ts">
import { FormBuilder } from "@formatica/vue";
import type { FormSchema } from "@formatica/vue";

const schema: FormSchema = {
  fields: [
    { name: "email", type: "email", label: "Email", required: true },
    { name: "password", type: "password", label: "Password", required: true },
  ],
};
</script>

<template>
  <FormBuilder :schema="schema" @submit="console.log" />
</template>
```

### React

```bash
npm install @formatica/react libphonenumber-js
```

```tsx
import { FormaticaProvider, FormBuilder } from "@formatica/react";
import "@formatica/vue/style.css";
import type { FormSchema } from "@formatica/react";

const schema: FormSchema = {
  fields: [
    { name: "email", type: "email", label: "Email", required: true },
    { name: "password", type: "password", label: "Password", required: true },
  ],
};

function App() {
  return (
    <FormaticaProvider
      config={{
        theme: {
          name: "default",
          colors: { primary: "#059669" },
        },
        locale: "en",
      }}
    >
      <FormBuilder schema={schema} onSubmit={console.log} />
    </FormaticaProvider>
  );
}
```

### Core (standalone)

```bash
npm install @formatica/core
```

```ts
import {
  configureFormatica,
  parseFormSchema,
  extractFields,
  evaluateCondition,
  registerRule,
} from "@formatica/core";

// Optional: set global config
configureFormatica({
  theme: { name: "default", colors: { primary: "#059669" } },
  locale: "en",
});

// Parse and work with schemas
const schema = parseFormSchema(jsonFromApi);
const fields = extractFields(schema.fields);
const visible = evaluateCondition(
  { field: "country", operator: "eq", value: "NL" },
  formValues,
);
```

## Playground

An interactive playground showcasing all field types and features is available at [formatica-playground.vercel.app](https://formatica-playground.vercel.app) or run it locally:

```bash
yarn dev
```

## Documentation

- [`@formatica/core` README](./packages/core/README.md) -- Types, validation, parsing, conditions
- [`@formatica/vue` README](./packages/vue/README.md) -- Plugin, components, composables, theming
- [`@formatica/react` README](./packages/react/README.md) -- Provider, components, hooks, theming

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

## Contributing

1. Fork and clone the repo
2. Install dependencies: `yarn install`
3. Create a branch: `git checkout -b feat/my-feature`
4. Make your changes and add tests
5. Run `yarn lint:fix && yarn format && yarn test` to verify
6. Build all packages: `yarn build`
7. Submit a pull request

Please follow the existing code style (enforced by Biome) and include tests for new features.

## License

[MIT](./LICENSE)
