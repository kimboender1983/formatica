# @formatica/vue

Schema-driven, fully-typed form builder for Vue 3. Define forms with a JSON schema and get automatic rendering, validation, conditional logic, theming, and dark mode support.

## Installation

```bash
npm install @formatica/vue libphonenumber-js
# or
yarn add @formatica/vue libphonenumber-js
```

Import the CSS file in your entry point (required for theming and dark mode):

```ts
import "@formatica/vue/style.css";
```

`libphonenumber-js` is required for the phone field type. All other field types have zero external dependencies.

## Plugin Setup

Install the plugin in your `main.ts` to configure global defaults for theme, locale, and custom components:

```ts
import { createApp } from "vue";
import { createFormatica } from "@formatica/vue";
import "@formatica/vue/style.css";
import App from "./App.vue";

const app = createApp(App);
app.use(
  createFormatica({
    theme: {
      name: "my-theme",
      colors: { primary: "#059669", error: "#dc2626" },
      borders: { radius: "0.5rem" },
    },
    locale: "en",
    fallbackLocale: "en",
    // components: { rating: MyRatingInput },  // register custom field types globally
  }),
);
app.mount("#app");
```

### FormaticaOptions

```ts
interface FormaticaOptions {
  theme?: ThemeConfig; // Global theme (colors, borders, typography, etc.)
  locale?: string; // Active locale (default: 'en')
  fallbackLocale?: string; // Fallback when key is missing (default: 'en')
  components?: Record<string, Component>; // Custom/override field components
}
```

All options are optional. Props passed directly to `FormBuilder` always override the global values from the plugin.

## Quick Start

Once the plugin is installed, use `FormBuilder` in any component:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { FormBuilder } from "@formatica/vue";
import type { FormSchema } from "@formatica/vue";

const schema: FormSchema = {
  fields: [
    {
      type: "text",
      name: "name",
      label: "Full name",
      rules: ["required", "minLength:2"],
    },
    {
      type: "text",
      name: "email",
      label: "Email",
      inputType: "email",
      rules: ["required", "email"],
    },
    { type: "textarea", name: "message", label: "Message", rules: ["required"] },
  ],
};

const formValues = ref<Record<string, unknown>>({});

function onSubmit(values: Record<string, unknown>) {
  console.log("Form submitted:", values);
}
</script>

<template>
  <FormBuilder :schema="schema" v-model="formValues" @submit="onSubmit" />
</template>
```

## Schema Format

The schema format is identical across `@formatica/vue`, `@formatica/react`, and `@formatica/core`. Fields and layout containers live together in a single tree:

```ts
interface FormSchema {
  id?: string; // Unique identifier
  version?: string; // Schema version
  fields: SchemaNode[]; // The form tree (fields + layout containers)
  settings?: FormSettings; // Validation timing, layout mode
  translations?: FormTranslations; // Per-locale strings
}

// SchemaNode is either a field or a layout container:
type SchemaNode =
  | FieldSchema // text, number, select, checkbox, etc.
  | RowNode // { type: 'row', children: [...] }
  | GroupNode // { type: 'group', title: '...', children: [...] }
  | StepsNode // { type: 'steps', steps: [...] }
  | TabsNode // { type: 'tabs', tabs: [...] }
  | DividerNode // { type: 'divider' }
  | HtmlNode; // { type: 'html', content: '...' }
```

## Custom Components

### Global registration via plugin

```ts
import { createFormatica } from "@formatica/vue";
import MyRatingInput from "./MyRatingInput.vue";

app.use(
  createFormatica({
    components: {
      rating: MyRatingInput, // register new type
      text: MyCustomTextInput, // override built-in
    },
  }),
);
```

### Per-instance via props

```vue
<template>
  <FormBuilder
    :schema="schema"
    :components="{ rating: MyRatingInput, text: MyCustomTextInput }"
    @submit="onSubmit"
  />
</template>
```

### Imperative registration

```ts
import { registerFieldType } from "@formatica/vue";
import MyRatingInput from "./MyRatingInput.vue";

registerFieldType("rating", MyRatingInput);
```

Custom field components receive field schema values as props and must emit `update:modelValue` and `blur`. They are wrapped by `BaseField` which handles label, error messages, help text, and tooltip automatically.

## useForm() Composable

For advanced use cases where you need direct access to form state:

```ts
import { useForm } from "@formatica/vue";
import type { FormSchema } from "@formatica/vue";

const schema: FormSchema = {
  fields: [{ type: "text", name: "email", label: "Email", rules: ["required", "email"] }],
};

const form = useForm(schema, { locale: "en" });

// Reactive state
form.values; // Record<string, unknown>
form.errors; // Record<string, string[]>
form.touched; // Record<string, boolean>
form.dirty; // Record<string, boolean>
form.isValid; // ComputedRef<boolean>
form.isDirty; // ComputedRef<boolean>
form.isSubmitting; // Ref<boolean>
form.submitCount; // Ref<number>

// Methods
form.setFieldValue("email", "test@example.com");
form.validate(); // validate all, returns Promise<boolean>
form.validateField("email"); // validate one field
form.reset(); // reset to initial values
form.clear(); // clear all values to null
form.setError("email", ["Already taken"]); // set server-side error
form.clearError("email");
form.clearErrors();
form.getField("email"); // get FieldInstance
form.setFieldDisabled("email", true);
form.setFieldVisible("email", false);
form.setLocale("nl"); // change locale at runtime
form.updateSchema(newSchema); // swap schema dynamically

// Submit (validates first, then calls handler)
form.submit(async (values) => {
  await api.post("/users", values);
});
```

## Theming

### CSS variables

The CSS file (`@formatica/vue/style.css`) maps ThemeConfig values to CSS custom properties:

| Variable | Description |
| --- | --- |
| `--fc-color-primary` | Primary color (buttons, focus rings, accents) |
| `--fc-color-error` | Error color (validation messages, borders) |
| `--fc-color-success` | Success color |
| `--fc-border-radius` | Border radius for inputs and buttons |
| `--fc-color-border` | Default border color |
| `--fc-color-border-focus` | Border color on focus (defaults to primary) |
| `--fc-input-padding-x` | Horizontal input padding |
| `--fc-input-padding-y` | Vertical input padding |

Override these in your own CSS or pass them via `ThemeConfig.cssVars`:

```ts
const theme: ThemeConfig = {
  name: "custom",
  colors: { primary: "#4f46e5", error: "#dc2626" },
  borders: { radius: "0.75rem" },
  cssVars: {
    "--fc-input-bg": "#f9fafb",
  },
};
```

### Dark mode

Formatica supports dark mode via the `.dark` class on any ancestor element, compatible with Tailwind's `darkMode: 'class'`:

```html
<html class="dark">
  <body>
    <!-- All Formatica components auto-switch to dark styles -->
  </body>
</html>
```

### Tailwind CSS configuration

Include the library's dist files in your Tailwind config's `content` array:

```ts
// tailwind.config.ts
export default {
  content: [
    "./src/**/*.{vue,ts,tsx}",
    "./node_modules/@formatica/vue/dist/**/*.js",
  ],
};
```

## i18n

Translations are defined per-field and at the form level in the schema:

```ts
const schema: FormSchema = {
  fields: [
    {
      type: "text",
      name: "email",
      label: "Email",
      translations: {
        nl: { label: "E-mailadres", placeholder: "Voer e-mail in" },
      },
    },
  ],
  translations: {
    en: { submit: "Save", reset: "Cancel" },
    nl: { submit: "Opslaan", reset: "Annuleren" },
  },
};
```

Switch locale via the plugin config, the `locale` prop, or `form.setLocale()`.

## TypeScript Support

All types are exported from `@formatica/vue` (re-exported from `@formatica/core`):

```ts
import type {
  FormSchema,
  FieldSchema,
  SchemaNode,
  ThemeConfig,
  FormaticaOptions,
  UseFormOptions,
} from "@formatica/vue";
```

## Playground

Try the interactive playground at [formatica-playground.vercel.app](https://formatica-playground.vercel.app) or run locally with `yarn dev`.

## License

[MIT](../../LICENSE)
