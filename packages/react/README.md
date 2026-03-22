# @formatica/react

Schema-driven form builder for React. Powered by `@formatica/core`, it provides a context provider, components, and hooks for building forms from JSON schemas with automatic validation, conditional logic, theming, and dark mode.

## Installation

```bash
npm install @formatica/react libphonenumber-js
# or
yarn add @formatica/react libphonenumber-js
```

Import the CSS file in your entry point (required for theming and dark mode):

```ts
// The CSS file is published via @formatica/vue
import "@formatica/vue/style.css";
```

`libphonenumber-js` is required for the phone field type. All other field types have zero external dependencies.

## FormaticaProvider Setup

Wrap your app (or a subtree) in `FormaticaProvider` to configure global defaults:

```tsx
import { FormaticaProvider } from "@formatica/react";
import "@formatica/vue/style.css";

function App() {
  return (
    <FormaticaProvider
      config={{
        theme: {
          name: "my-theme",
          colors: { primary: "#059669", error: "#dc2626" },
          borders: { radius: "0.5rem" },
        },
        locale: "en",
        // components: { rating: MyRatingField },  // register custom types globally
      }}
    >
      <MyForms />
    </FormaticaProvider>
  );
}
```

### FormaticaConfig

```ts
interface FormaticaConfig {
  theme?: ThemeConfig;
  locale?: string;
  fallbackLocale?: string;
  components?: Record<string, ComponentType<FieldComponentProps>>;
}
```

Props passed directly to `FormBuilder` always override the provider config.

### useFormaticaConfig()

Access the global config from any component inside the provider:

```tsx
import { useFormaticaConfig } from "@formatica/react";

function MyComponent() {
  const config = useFormaticaConfig();
  console.log(config.locale); // 'en'
  console.log(config.theme); // ThemeConfig object
  return <div>...</div>;
}
```

## Quick Start

```tsx
import { FormBuilder } from "@formatica/react";
import type { FormSchema } from "@formatica/react";

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

export default function ContactForm() {
  async function handleSubmit(values: Record<string, unknown>) {
    console.log("Form submitted:", values);
  }

  return (
    <FormBuilder
      schema={schema}
      onSubmit={handleSubmit}
      onError={(errors) => console.error("Validation failed:", errors)}
    />
  );
}
```

## Schema Format

The schema format is identical across all three packages. Fields and layout containers live together in a single tree. See the [`@formatica/core` README](../core/README.md) for full details.

```ts
const schema: FormSchema = {
  fields: [
    { type: "text", name: "email", label: "Email", rules: ["required", "email"] },
    {
      type: "row",
      children: [
        { type: "text", name: "city", label: "City", span: 8 },
        { type: "text", name: "zip", label: "ZIP", span: 4 },
      ],
    },
  ],
};
```

## Custom Components

### Via provider

```tsx
<FormaticaProvider
  config={{
    components: {
      rating: MyRatingField,
      text: MyCustomTextField,
    },
  }}
>
  <MyForms />
</FormaticaProvider>
```

### Via props

```tsx
<FormBuilder
  schema={schema}
  components={{ rating: MyRatingField }}
  onSubmit={handleSubmit}
/>
```

Custom components receive `FieldComponentProps`:

```ts
interface FieldComponentProps {
  field: FieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  errors: string[];
  disabled: boolean;
}
```

Components are wrapped by `BaseField` which handles label, error messages, and help text automatically.

## useForm() Hook

For advanced use cases where you need direct access to form state:

```tsx
import { useForm } from "@formatica/react";

const form = useForm(schema, { locale: "en" });

// State
form.values; // Record<string, unknown>
form.errors; // Record<string, string[]>
form.touched; // Record<string, boolean>
form.dirty; // Record<string, boolean>
form.isValid; // boolean
form.isDirty; // boolean
form.isSubmitting; // boolean
form.submitCount; // number

// Methods
form.setFieldValue("email", "test@example.com");
form.getFieldValue("email");
form.validate(); // validate all, returns Promise<boolean>
form.validateField("email");
form.reset();
form.clear();
form.setError("email", "Already taken");
form.clearError("email");
form.clearErrors();

// Submit (validates first, then calls handler)
form.submit(async (values) => {
  await fetch("/api/users", { method: "POST", body: JSON.stringify(values) });
});
```

## useFormContext()

Access form state from any child component rendered inside `FormBuilder`:

```tsx
import { useFormContext } from "@formatica/react";

function SubmitButton() {
  const form = useFormContext();

  return (
    <button type="submit" disabled={form.isSubmitting || !form.isValid}>
      {form.isSubmitting ? "Saving..." : "Submit"}
    </button>
  );
}
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
| `--fc-color-border-focus` | Border color on focus |
| `--fc-input-padding-x` | Horizontal input padding |
| `--fc-input-padding-y` | Vertical input padding |

You can also set CSS variables directly via a wrapper div:

```tsx
<div
  style={
    {
      "--fc-color-primary": "#4f46e5",
      "--fc-border-radius": "0.75rem",
    } as React.CSSProperties
  }
>
  <FormBuilder schema={schema} onSubmit={handleSubmit} />
</div>
```

### Dark mode

Add the `.dark` class to any ancestor element. Compatible with Tailwind's `darkMode: 'class'`:

```html
<html class="dark">
  ...
</html>
```

## TypeScript Support

All types are exported from `@formatica/react` (re-exported from `@formatica/core`):

```ts
import type {
  FormSchema,
  FieldSchema,
  SchemaNode,
  ThemeConfig,
  FormaticaConfig,
  FieldComponentProps,
  FormBuilderProps,
  FormInstance,
  UseFormOptions,
} from "@formatica/react";
```

## License

[MIT](../../LICENSE)
