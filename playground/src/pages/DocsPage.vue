<script setup lang="ts">
    import { computed, onMounted, onUnmounted, ref, watch } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import DocCodeBlock from "../components/docs/DocCodeBlock.vue";
    import DocPropsTable from "../components/docs/DocPropsTable.vue";
    import DocSection from "../components/docs/DocSection.vue";

    type Platform = "vue" | "react" | "core";

    const route = useRoute();
    const router = useRouter();

    const platform = computed<Platform>(() => (route.params.platform as Platform) || "vue");

    function switchPlatform(p: Platform) {
        router.push({ name: "docs", params: { platform: p } });
    }

    const sections = computed(() => {
        const shared = [
            { id: "installation", label: "Installation" },
            { id: "schema", label: "Schema Format" },
            { id: "field-types", label: "Field Types" },
            { id: "layout", label: "Layout" },
            { id: "validation", label: "Validation" },
        ];

        const vueOnly = [
            { id: "quick-start", label: "Quick Start" },
            { id: "plugin-setup", label: "Plugin Setup" },
            { id: "form-builder", label: "FormBuilder Props" },
            { id: "events", label: "Events & v-model" },
            { id: "use-form", label: "useForm()" },
            { id: "custom-fields", label: "Custom Field Types" },
            { id: "theming", label: "Theming" },
        ];

        const reactOnly = [
            { id: "quick-start", label: "Quick Start" },
            { id: "provider-setup", label: "Provider Setup" },
            { id: "form-builder", label: "FormBuilder Props" },
            { id: "use-form", label: "useForm()" },
            { id: "custom-components", label: "Custom Components" },
            { id: "theming", label: "Theming" },
        ];

        const coreOnly = [
            { id: "quick-start", label: "Quick Start" },
            { id: "schema-parsing", label: "Schema Parsing" },
            { id: "field-extraction", label: "Field Extraction" },
            { id: "condition-evaluation", label: "Condition Evaluation" },
            { id: "server-side", label: "Server-Side Usage" },
        ];

        const common = [
            { id: "custom-rules", label: "Custom Rules" },
            { id: "i18n", label: "i18n" },
            { id: "errors", label: "Error Handling" },
        ];

        const platformSections =
            platform.value === "vue" ? vueOnly : platform.value === "react" ? reactOnly : coreOnly;

        return [...shared, ...platformSections, ...common];
    });

    const activeSection = ref("installation");

    function scrollTo(id: string) {
        activeSection.value = id;
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }

    let observer: IntersectionObserver | null = null;

    function setupObserver() {
        observer?.disconnect();
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) activeSection.value = entry.target.id;
                }
            },
            { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
        );
        for (const s of sections.value) {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        }
    }

    onMounted(() => {
        setupObserver();
    });

    watch(
        () => platform.value,
        () => {
            activeSection.value = "installation";
            setTimeout(setupObserver, 50);
        },
    );

    onUnmounted(() => {
        observer?.disconnect();
    });

    // ── Data tables ──────────────────────────────────────────────────────────

    const fieldTypes = [
        {
            name: "text",
            desc: "Text input (also email, password, url, tel via inputType)",
        },
        { name: "number", desc: "Numeric input with min/max/step" },
        { name: "textarea", desc: "Multi-line text with optional autoResize" },
        {
            name: "select",
            desc: "Dropdown with options, searchable, clearable, multiple",
        },
        { name: "checkbox", desc: "Single boolean checkbox" },
        {
            name: "checkbox-group",
            desc: "Multiple checkboxes from options array",
        },
        { name: "radio", desc: "Radio button group from options array" },
        { name: "switch", desc: "Toggle switch with on/off labels" },
        { name: "date", desc: "Date picker (native)" },
        { name: "file", desc: "File upload with drag & drop" },
        { name: "slider", desc: "Range slider with min/max/step/tooltip" },
        { name: "tags", desc: "Tag input with suggestions" },
        { name: "phone", desc: "Phone number with country flag selector" },
    ];

    const validationRules = [
        { name: "required", desc: "Must not be empty, false, or null" },
        { name: "email", desc: "Must be a valid email address" },
        { name: "phone", desc: "Must be a valid phone number (E.164)" },
        { name: "url", desc: "Must be a valid URL" },
        { name: "numeric", desc: "Must be a number" },
        { name: "integer", desc: "Must be an integer" },
        { name: "min:n", desc: "Minimum numeric value (e.g. min:0)" },
        { name: "max:n", desc: "Maximum numeric value (e.g. max:100)" },
        {
            name: "minLength:n",
            desc: "Minimum string length (e.g. minLength:3)",
        },
        {
            name: "maxLength:n",
            desc: "Maximum string length (e.g. maxLength:200)",
        },
        {
            name: "between:min,max",
            desc: "Numeric value between min and max",
        },
        {
            name: "pattern:regex",
            desc: "Must match a regular expression",
        },
        { name: "alpha", desc: "Letters only" },
        { name: "alphaNumeric", desc: "Letters and numbers only" },
        {
            name: "confirmed",
            desc: "Must match another field (e.g. password confirmation)",
        },
    ];

    const vueFormBuilderProps = [
        {
            name: "schema",
            type: "FormSchema",
            def: "\u2014",
            desc: "The form schema (required)",
        },
        {
            name: "components",
            type: "Record<string, Component>",
            def: "{}",
            desc: "Override or add custom field components",
        },
        {
            name: "locale",
            type: "string",
            def: "'en'",
            desc: "Active locale for translations",
        },
        {
            name: "fallbackLocale",
            type: "string",
            def: "'en'",
            desc: "Fallback locale if key not found",
        },
        {
            name: "modelValue",
            type: "Record<string, unknown>",
            def: "undefined",
            desc: "v-model binding for form values",
        },
        {
            name: "theme",
            type: "ThemeConfig",
            def: "undefined",
            desc: "Theme configuration object",
        },
    ];

    const vueFormEvents = [
        {
            name: "submit",
            type: "(values: Record<string, unknown>) => void",
            desc: "Fires after successful validation",
        },
        {
            name: "error",
            type: "(error: unknown) => void",
            desc: "Fires when validation or submission fails",
        },
        {
            name: "update:modelValue",
            type: "(values: Record<string, unknown>) => void",
            desc: "v-model update for reactive form values",
        },
    ];

    const reactFormBuilderProps = [
        {
            name: "schema",
            type: "FormSchema",
            def: "\u2014",
            desc: "The form schema (required)",
        },
        {
            name: "onSubmit",
            type: "(values) => void | Promise<void>",
            def: "undefined",
            desc: "Called after successful validation",
        },
        {
            name: "onError",
            type: "(errors) => void",
            def: "undefined",
            desc: "Called when validation fails",
        },
        {
            name: "components",
            type: "Record<string, ComponentType<FieldComponentProps>>",
            def: "{}",
            desc: "Override or add custom field components",
        },
        {
            name: "locale",
            type: "string",
            def: "'en'",
            desc: "Active locale for translations",
        },
        {
            name: "className",
            type: "string",
            def: "undefined",
            desc: "CSS class on the form element",
        },
    ];

    // ── Code examples ────────────────────────────────────────────────────────

    const installCode = computed(() => {
        if (platform.value === "vue") {
            return "npm install @formatica/vue libphonenumber-js\n# or\nyarn add @formatica/vue libphonenumber-js";
        }
        if (platform.value === "react") {
            return "npm install @formatica/react libphonenumber-js\n# or\nyarn add @formatica/react libphonenumber-js";
        }
        return "npm install @formatica/core\n# or\nyarn add @formatica/core";
    });

    const installCssCode = computed(() => {
        if (platform.value === "vue") {
            return "import '@formatica/vue/style.css'";
        }
        if (platform.value === "react") {
            return [
                "// The CSS file is published via @formatica/vue",
                "import '@formatica/vue/style.css'",
            ].join("\n");
        }
        return "";
    });

    const installNote = computed(() => {
        if (platform.value === "core") {
            return "Zero external dependencies. Lightweight and framework-agnostic.";
        }
        return "libphonenumber-js is required for the phone field type. All other field types have zero external dependencies.";
    });

    const schemaTypesCode = [
        "interface FormSchema {",
        "  id?: string                   // Unique identifier",
        "  version?: string              // Schema version",
        "  fields: SchemaNode[]          // The form tree (fields + layout containers)",
        "  settings?: FormSettings       // Validation timing, layout mode",
        "  translations?: FormTranslations // Per-locale strings",
        "}",
        "",
        "// SchemaNode is either a field or a layout container:",
        "type SchemaNode =",
        "  | FieldSchema     // text, number, select, checkbox, etc.",
        "  | RowNode         // { type: 'row', children: [...] }",
        "  | GroupNode       // { type: 'group', title: '...', children: [...] }",
        "  | StepsNode       // { type: 'steps', steps: [...] }",
        "  | TabsNode        // { type: 'tabs', tabs: [...] }",
        "  | DividerNode     // { type: 'divider' }",
        "  | HtmlNode        // { type: 'html', content: '...' }",
    ].join("\n");

    const schemaJsonCode = [
        "{",
        '  "fields": [',
        '    { "type": "text", "name": "email", "label": "Email", "rules": ["required", "email"] },',
        "    {",
        '      "type": "row",',
        '      "children": [',
        '        { "type": "text", "name": "city", "label": "City", "span": 8 },',
        '        { "type": "text", "name": "zip", "label": "ZIP", "span": 4 }',
        "      ]",
        "    },",
        "    {",
        '      "type": "group", "title": "Preferences",',
        '      "children": [',
        '        { "type": "switch", "name": "newsletter", "label": "Subscribe" }',
        "      ]",
        "    }",
        "  ]",
        "}",
    ].join("\n");

    const fieldBaseCode = [
        "interface FieldBase {",
        "  type: string                // Field type discriminator",
        "  name: string                // Unique key in form values",
        "  label?: string              // Display label",
        "  placeholder?: string        // Placeholder text",
        "  helpText?: string           // Help text below the input",
        "  tooltip?: string            // Info icon tooltip",
        "  defaultValue?: unknown      // Initial value",
        "  rules?: string | string[]   // Validation rules",
        "  required?: boolean          // Adds 'required' rule + asterisk",
        "  disabled?: boolean          // Disable the field",
        "  readOnly?: boolean          // Read-only mode",
        "  span?: ColumnSpan           // Column width (1-12) when inside a row",
        "  condition?: Condition       // Show/hide based on other field values",
        "  className?: string          // CSS class on field wrapper",
        "  translations?: FieldTranslations // Per-locale overrides",
        "  meta?: Record<string, unknown>   // Arbitrary metadata",
        "}",
    ].join("\n");

    const phoneFieldCode = [
        "{",
        '  "type": "phone",',
        '  "name": "phone",',
        '  "label": "Phone number",',
        '  "defaultCountry": "NL",',
        '  "rules": ["required", "phone"]',
        "}",
    ].join("\n");

    const selectOptionsCode = [
        "{",
        '  "type": "select",',
        '  "name": "country",',
        '  "label": "Country",',
        '  "clearable": true,',
        '  "searchable": true,',
        '  "options": [',
        '    { "label": "Netherlands", "value": "NL" },',
        '    { "label": "Germany", "value": "DE" },',
        '    { "label": "France", "value": "FR" }',
        "  ]",
        "}",
    ].join("\n");

    const rowLayoutCode = [
        "{",
        '  "type": "row",',
        '  "children": [',
        '    { "type": "text", "name": "first", "label": "First name", "span": 6 },',
        '    { "type": "text", "name": "last", "label": "Last name", "span": 6 }',
        "  ]",
        "}",
    ].join("\n");

    const groupLayoutCode = [
        "{",
        '  "type": "group",',
        '  "title": "Address",',
        '  "collapsible": true,',
        '  "children": [',
        '    { "type": "text", "name": "street", "label": "Street" },',
        '    { "type": "row", "children": [',
        '      { "type": "text", "name": "city", "label": "City", "span": 8 },',
        '      { "type": "text", "name": "zip", "label": "ZIP", "span": 4 }',
        "    ]}",
        "  ]",
        "}",
    ].join("\n");

    const stepsLayoutCode = [
        "{",
        '  "type": "steps",',
        '  "linear": true,',
        '  "steps": [',
        '    { "title": "Account", "children": [',
        '      { "type": "text", "name": "email", "label": "Email", "rules": ["required", "email"] }',
        "    ]},",
        '    { "title": "Profile", "children": [',
        '      { "type": "text", "name": "bio", "label": "Bio" }',
        "    ]}",
        "  ]",
        "}",
    ].join("\n");

    const tabsLayoutCode = [
        "{",
        '  "type": "tabs",',
        '  "tabs": [',
        '    { "title": "General", "children": [',
        '      { "type": "text", "name": "name", "label": "Name" }',
        "    ]},",
        '    { "title": "Advanced", "children": [',
        '      { "type": "switch", "name": "debug", "label": "Debug mode" }',
        "    ]}",
        "  ]",
        "}",
    ].join("\n");

    const validationFormatsCode = [
        "// String shorthand (pipe-separated):",
        "{ rules: 'required|email|minLength:3' }",
        "",
        "// Array of strings:",
        "{ rules: ['required', 'email', 'minLength:3'] }",
        "",
        "// Simple required shorthand:",
        "{ required: true } // same as rules: ['required']",
    ].join("\n");

    // ── Vue code examples ────────────────────────────────────────────────────

    const vuePluginInstallCode = [
        "// main.ts",
        "import { createApp } from 'vue'",
        "import { createFormatica } from '@formatica/vue'",
        "import '@formatica/vue/style.css'",
        "import App from './App.vue'",
        "",
        "const app = createApp(App)",
        "app.use(createFormatica({",
        "  theme: {",
        "    name: 'my-theme',",
        "    colors: { primary: '#059669', error: '#dc2626' },",
        "    borders: { radius: '0.5rem' },",
        "  },",
        "  locale: 'en',",
        "}))",
        "app.mount('#app')",
    ].join("\n");

    const vueQuickStartCode = [
        "<script setup lang='ts'>",
        "import { ref } from 'vue'",
        "import { FormBuilder } from '@formatica/vue'",
        "import type { FormSchema } from '@formatica/vue'",
        "",
        "const schema: FormSchema = {",
        "  fields: [",
        "    { type: 'text', name: 'name', label: 'Full name', rules: ['required', 'minLength:2'] },",
        "    { type: 'text', name: 'email', label: 'Email', inputType: 'email', rules: ['required', 'email'] },",
        "    { type: 'textarea', name: 'message', label: 'Message', rules: ['required'] },",
        "  ],",
        "}",
        "",
        "const formValues = ref<Record<string, unknown>>({})",
        "",
        "function onSubmit(values: Record<string, unknown>) {",
        "  console.log('Form submitted:', values)",
        "}",
        "<\\/script>",
        "",
        "<template>",
        "  <FormBuilder",
        "    :schema='schema'",
        "    v-model='formValues'",
        "    @submit='onSubmit'",
        "  />",
        "</template>",
    ].join("\n");

    const vueVModelCode = [
        "<script setup lang='ts'>",
        "import { ref, watch } from 'vue'",
        "import { FormBuilder } from '@formatica/vue'",
        "",
        "const formValues = ref<Record<string, unknown>>({})",
        "",
        "// React to any field change",
        "watch(formValues, (values) => {",
        "  console.log('Form values changed:', values)",
        "}, { deep: true })",
        "<\\/script>",
        "",
        "<template>",
        "  <FormBuilder :schema='schema' v-model='formValues' />",
        "",
        "  <!-- Display live values -->",
        "  <pre>{{ JSON.stringify(formValues, null, 2) }}</pre>",
        "</template>",
    ].join("\n");

    const vueSubmitLoadingCode = [
        "<script setup lang='ts'>",
        "import { ref } from 'vue'",
        "import { FormBuilder } from '@formatica/vue'",
        "",
        "const isLoading = ref(false)",
        "",
        "async function onSubmit(values: Record<string, unknown>) {",
        "  isLoading.value = true",
        "  try {",
        "    await fetch('/api/submit', {",
        "      method: 'POST',",
        "      body: JSON.stringify(values),",
        "    })",
        "    alert('Success!')",
        "  } catch (err) {",
        "    console.error(err)",
        "  } finally {",
        "    isLoading.value = false",
        "  }",
        "}",
        "<\\/script>",
        "",
        "<template>",
        "  <FormBuilder",
        "    :schema='schema'",
        "    @submit='onSubmit'",
        "    @error='(e) => console.error(\"Validation failed:\", e)'",
        "  />",
        "</template>",
    ].join("\n");

    const vueUseFormCode = [
        "<script setup lang='ts'>",
        "import { useForm } from '@formatica/vue'",
        "import type { FormSchema } from '@formatica/vue'",
        "",
        "const schema: FormSchema = {",
        "  fields: [",
        "    { type: 'text', name: 'email', label: 'Email', rules: ['required', 'email'] },",
        "  ],",
        "}",
        "",
        "const form = useForm(schema, { locale: 'en' })",
        "",
        "// Reactive state",
        "form.values          // Record<string, unknown> \u2014 current values",
        "form.errors          // Record<string, string[]> \u2014 per-field errors",
        "form.touched         // Record<string, boolean> \u2014 has user interacted?",
        "form.dirty           // Record<string, boolean> \u2014 value differs from initial?",
        "form.isValid         // ComputedRef<boolean>",
        "form.isDirty         // ComputedRef<boolean>",
        "form.isSubmitting    // Ref<boolean>",
        "form.submitCount     // Ref<number>",
        "",
        "// Methods",
        "form.setFieldValue('email', 'test@example.com')",
        "form.validate()                // validate all, returns Promise<boolean>",
        "form.validateField('email')    // validate one field, returns Promise<string[]>",
        "form.reset()                   // reset to initial values",
        "form.clear()                   // clear all values to null",
        "form.setError('email', ['Already taken'])  // set server-side error",
        "form.clearError('email')       // clear error for one field",
        "form.clearErrors()             // clear all errors",
        "form.getField('email')         // get FieldInstance with value/errors/touched",
        "form.setFieldDisabled('email', true)",
        "form.setFieldVisible('email', false)",
        "form.setLocale('nl')           // change locale at runtime",
        "form.updateSchema(newSchema)   // swap schema dynamically",
        "",
        "// Submit (validates first, then calls handler)",
        "form.submit(async (values) => {",
        "  await api.post('/users', values)",
        "})",
        "<\\/script>",
    ].join("\n");

    const customFieldsVuePerInstanceCode = [
        "<script setup lang='ts'>",
        "import { FormBuilder } from '@formatica/vue'",
        "import type { FormSchema } from '@formatica/vue'",
        "import MyCustomTextInput from './MyCustomTextInput.vue'",
        "import MyRatingInput from './MyRatingInput.vue'",
        "",
        "const schema: FormSchema = {",
        "  fields: [",
        "    { type: 'text', name: 'name', label: 'Name' },          // uses MyCustomTextInput",
        "    { type: 'rating', name: 'score', label: 'Rate us' },     // uses MyRatingInput",
        "  ],",
        "}",
        "<\\/script>",
        "",
        "<template>",
        "  <FormBuilder",
        "    :schema='schema'",
        "    :components='{",
        "      text: MyCustomTextInput,    // override built-in text",
        "      rating: MyRatingInput,      // register new type",
        "    }'",
        "    @submit='onSubmit'",
        "  />",
        "</template>",
    ].join("\n");

    const customFieldsVueGlobalCode = [
        "// Option 1: Register via the plugin (recommended)",
        "app.use(createFormatica({",
        "  components: {",
        "    rating: MyRatingInput,  // register new type",
        "    text: MyCustomText,     // override built-in",
        "  },",
        "}))",
        "",
        "// Option 2: Register imperatively (e.g. in main.ts)",
        "import { registerFieldType } from '@formatica/vue'",
        "import MyRatingInput from './MyRatingInput.vue'",
        "",
        "registerFieldType('rating', MyRatingInput)",
        "",
        "// Both approaches make the type available to all FormBuilder instances",
    ].join("\n");

    const customFieldsVueComponentCode = [
        "<!-- MyRatingInput.vue -->",
        "<script setup lang='ts'>",
        "defineProps<{",
        "  modelValue: number | null",
        "  disabled?: boolean",
        "  min?: number",
        "  max?: number",
        "}>()",
        "",
        "const emit = defineEmits<{",
        "  'update:modelValue': [value: number]",
        "  blur: [event: FocusEvent]",
        "}>()",
        "<\\/script>",
        "",
        "<template>",
        "  <div class='flex gap-1'>",
        "    <button",
        "      v-for='n in (max ?? 5)'",
        "      :key='n'",
        "      type='button'",
        "      :disabled='disabled'",
        "      :class='[",
        '        "text-2xl transition-colors",',
        '        n <= (modelValue ?? 0) ? "text-yellow-400" : "text-gray-300"',
        "      ]'",
        "      @click='emit(\"update:modelValue\", n)'",
        "    >",
        "      &#9733;",
        "    </button>",
        "  </div>",
        "</template>",
    ].join("\n");

    const vuePluginOptionsCode = [
        "interface FormaticaOptions {",
        "  theme?: ThemeConfig      // Global theme (colors, borders, typography, etc.)",
        "  locale?: string          // Active locale (default: 'en')",
        "  fallbackLocale?: string  // Fallback when key is missing (default: 'en')",
        "  components?: Record<string, Component>  // Custom/override field components",
        "}",
        "",
        "// Props passed to FormBuilder always win over globals:",
        "// <FormBuilder :theme='localTheme' />  \u2190 localTheme overrides global theme",
        "// <FormBuilder locale='nl' />           \u2190 'nl' overrides global locale",
    ].join("\n");

    const reactProviderCode = [
        "import { FormaticaProvider } from '@formatica/react'",
        "import '@formatica/vue/style.css'",
        "",
        "function App() {",
        "  return (",
        "    <FormaticaProvider config={{",
        "      theme: {",
        "        name: 'my-theme',",
        "        colors: { primary: '#059669', error: '#dc2626' },",
        "        borders: { radius: '0.5rem' },",
        "      },",
        "      locale: 'en',",
        "    }}>",
        "      <MyForms />",
        "    </FormaticaProvider>",
        "  )",
        "}",
    ].join("\n");

    const reactProviderHookCode = [
        "import { useFormaticaConfig } from '@formatica/react'",
        "",
        "// Access global config from any component inside FormaticaProvider",
        "function MyComponent() {",
        "  const config = useFormaticaConfig()",
        "  console.log(config.locale)  // 'en'",
        "  console.log(config.theme)   // ThemeConfig object",
        "  return <div>...</div>",
        "}",
    ].join("\n");

    const reactProviderOptionsCode = [
        "interface FormaticaConfig {",
        "  theme?: ThemeConfig",
        "  locale?: string",
        "  fallbackLocale?: string",
        "  components?: Record<string, ComponentType<FieldComponentProps>>",
        "}",
        "",
        "// Props passed to FormBuilder always win over provider config",
    ].join("\n");

    const coreConfigureCode = [
        "import { configureFormatica } from '@formatica/core'",
        "",
        "configureFormatica({",
        "  theme: {",
        "    name: 'my-theme',",
        "    colors: { primary: '#059669' },",
        "  },",
        "  locale: 'en',",
        "})",
    ].join("\n");

    const themingCssVarsCode = [
        "/* CSS variables set by the theme (customizable via ThemeConfig) */",
        "--fc-color-primary       /* Primary color (buttons, focus rings, accents) */",
        "--fc-color-error         /* Error color (validation messages, borders) */",
        "--fc-color-success       /* Success color */",
        "--fc-border-radius       /* Border radius for inputs and buttons */",
        "--fc-color-border        /* Default border color */",
        "--fc-color-border-focus  /* Border color on focus (defaults to primary) */",
        "--fc-input-padding-x     /* Horizontal input padding */",
        "--fc-input-padding-y     /* Vertical input padding */",
    ].join("\n");

    const themingDarkModeCode = [
        "<!-- Dark mode: add the 'dark' class to an ancestor -->",
        "<!-- Works with Tailwind's darkMode: 'class' -->",
        '<html class="dark">',
        "  <body>",
        "    <!-- All Formatica components auto-switch to dark styles -->",
        "  </body>",
        "</html>",
    ].join("\n");

    const themingVueCode = [
        "<script setup lang='ts'>",
        "import { FormBuilder } from '@formatica/vue'",
        "import type { ThemeConfig } from '@formatica/vue'",
        "",
        "const theme: ThemeConfig = {",
        "  name: 'my-theme',",
        "  colors: {",
        "    primary: '#4f46e5',",
        "    error: '#dc2626',",
        "    success: '#059669',",
        "  },",
        "  cssVars: {",
        "    '--fc-radius': '0.75rem',",
        "    '--fc-input-bg': '#f9fafb',",
        "  },",
        "}",
        "<\\/script>",
        "",
        "<template>",
        "  <FormBuilder :schema='schema' :theme='theme' />",
        "</template>",
    ].join("\n");

    // ── React code examples ──────────────────────────────────────────────────

    const reactQuickStartCode = [
        "import { FormBuilder } from '@formatica/react'",
        "import type { FormSchema } from '@formatica/react'",
        "",
        "const schema: FormSchema = {",
        "  fields: [",
        "    { type: 'text', name: 'name', label: 'Full name', rules: ['required', 'minLength:2'] },",
        "    { type: 'text', name: 'email', label: 'Email', inputType: 'email', rules: ['required', 'email'] },",
        "    { type: 'textarea', name: 'message', label: 'Message', rules: ['required'] },",
        "  ],",
        "}",
        "",
        "export default function ContactForm() {",
        "  async function handleSubmit(values: Record<string, unknown>) {",
        "    console.log('Form submitted:', values)",
        "  }",
        "",
        "  return (",
        "    <FormBuilder",
        "      schema={schema}",
        "      onSubmit={handleSubmit}",
        "      onError={(errors) => console.error('Validation failed:', errors)}",
        "    />",
        "  )",
        "}",
    ].join("\n");

    const reactUseFormCode = [
        "import { useForm } from '@formatica/react'",
        "import type { FormSchema } from '@formatica/react'",
        "",
        "const schema: FormSchema = {",
        "  fields: [",
        "    { type: 'text', name: 'email', label: 'Email', rules: ['required', 'email'] },",
        "    { type: 'text', name: 'name', label: 'Name', rules: ['required'] },",
        "  ],",
        "}",
        "",
        "export default function MyForm() {",
        "  const form = useForm(schema, { locale: 'en' })",
        "",
        "  // State (plain objects, updated via React state)",
        "  form.values          // Record<string, unknown>",
        "  form.errors          // Record<string, string[]>",
        "  form.touched         // Record<string, boolean>",
        "  form.dirty           // Record<string, boolean>",
        "  form.isValid         // boolean",
        "  form.isDirty         // boolean",
        "  form.isSubmitting    // boolean",
        "  form.submitCount     // number",
        "",
        "  // Methods",
        "  form.setFieldValue('email', 'test@example.com')",
        "  form.getFieldValue('email')    // get current value",
        "  form.validate()                // validate all, returns Promise<boolean>",
        "  form.validateField('email')    // validate one field",
        "  form.reset()                   // reset to initial values",
        "  form.clear()                   // clear all values to null",
        "  form.setError('email', 'Already taken')  // set server-side error",
        "  form.clearError('email')       // clear error for one field",
        "  form.clearErrors()             // clear all errors",
        "",
        "  // Submit (validates first, then calls handler)",
        "  const handleSubmit = () => form.submit(async (values) => {",
        "    await fetch('/api/users', { method: 'POST', body: JSON.stringify(values) })",
        "  })",
        "",
        "  return <button onClick={handleSubmit}>Submit</button>",
        "}",
    ].join("\n");

    const reactCustomComponentCode = [
        "import { FormBuilder } from '@formatica/react'",
        "import type { FieldComponentProps, FormSchema } from '@formatica/react'",
        "",
        "// Custom field component receives standardized props",
        "function RatingField({ field, value, onChange, onBlur, errors, disabled }: FieldComponentProps) {",
        "  const stars = field.max ?? 5",
        "  const current = typeof value === 'number' ? value : 0",
        "",
        "  return (",
        "    <div style={{ display: 'flex', gap: '4px' }}>",
        "      {Array.from({ length: stars }, (_, i) => (",
        "        <button",
        "          key={i}",
        "          type='button'",
        "          disabled={disabled}",
        "          onClick={() => onChange(i + 1)}",
        "          onBlur={onBlur}",
        "          style={{ fontSize: '24px', color: i < current ? '#f59e0b' : '#d1d5db' }}",
        "        >",
        "          &#9733;",
        "        </button>",
        "      ))}",
        "    </div>",
        "  )",
        "}",
        "",
        "const schema: FormSchema = {",
        "  fields: [",
        "    { type: 'text', name: 'name', label: 'Name' },",
        "    { type: 'rating', name: 'score', label: 'Rate us' },",
        "  ],",
        "}",
        "",
        "export default function FeedbackForm() {",
        "  return (",
        "    <FormBuilder",
        "      schema={schema}",
        "      components={{ rating: RatingField }}",
        "      onSubmit={(values) => console.log(values)}",
        "    />",
        "  )",
        "}",
    ].join("\n");

    const reactFormContextCode = [
        "import { useFormContext } from '@formatica/react'",
        "",
        "// Access form state from any child component inside FormBuilder",
        "function SubmitButton() {",
        "  const form = useFormContext()",
        "",
        "  return (",
        "    <button",
        "      type='submit'",
        "      disabled={form.isSubmitting || !form.isValid}",
        "    >",
        "      {form.isSubmitting ? 'Saving...' : 'Submit'}",
        "    </button>",
        "  )",
        "}",
    ].join("\n");

    const themingReactCode = [
        "import { FormBuilder } from '@formatica/react'",
        "",
        "// React: use className and CSS variables",
        "export default function App() {",
        "  return (",
        "    <div",
        "      style={{",
        "        '--fc-radius': '0.75rem',",
        "        '--fc-input-bg': '#f9fafb',",
        "        '--fc-primary': '#4f46e5',",
        "        '--fc-error': '#dc2626',",
        "      } as React.CSSProperties}",
        "    >",
        "      <FormBuilder",
        "        schema={schema}",
        "        className='my-custom-form'",
        "        onSubmit={handleSubmit}",
        "      />",
        "    </div>",
        "  )",
        "}",
    ].join("\n");

    // ── Core code examples ───────────────────────────────────────────────────

    const coreQuickStartCode = [
        "import {",
        "  parseFormSchema,",
        "  extractFields,",
        "  evaluateCondition,",
        "  registerRule,",
        "} from '@formatica/core'",
        "",
        "// 1. Parse schema from JSON",
        "const raw = JSON.parse(jsonString)",
        "const schema = parseFormSchema(raw)",
        "",
        "// 2. Extract flat field list",
        "const fields = extractFields(schema.fields)",
        "console.log(fields.map(f => f.name))",
        "",
        "// 3. Evaluate a condition",
        "const visible = evaluateCondition(",
        "  { field: 'country', operator: 'eq', value: 'NL' },",
        "  { country: 'NL' },",
        ")",
        "console.log(visible) // true",
        "",
        "// 4. Register custom validation rules",
        "registerRule('postalCode', (value) => {",
        "  if (!value) return true",
        "  return /^\\d{4}\\s?[A-Za-z]{2}$/.test(String(value))",
        "    || 'Enter a valid Dutch postal code'",
        "})",
    ].join("\n");

    const coreParseSchemaCode = [
        "import { parseFormSchema } from '@formatica/core'",
        "",
        "const json = '{",
        '  "fields": [',
        '    { "type": "text", "name": "email", "label": "Email", "rules": ["required", "email"] }',
        "  ]",
        "}'",
        "",
        "try {",
        "  const schema = parseFormSchema(JSON.parse(json))",
        "  console.log('Valid schema:', schema)",
        "} catch (err) {",
        "  // SchemaValidationError with details about what is wrong",
        "  console.error('Invalid schema:', err.message)",
        "}",
    ].join("\n");

    const coreExtractFieldsCode = [
        "import { extractFields, isFieldNode } from '@formatica/core'",
        "",
        "// extractFields flattens the schema tree into a flat array of FieldSchema",
        "const fields = extractFields(schema.fields)",
        "",
        "for (const field of fields) {",
        "  console.log(field.name, field.type, field.rules)",
        "}",
        "",
        "// isFieldNode checks if a SchemaNode is a field (not a layout container)",
        "for (const node of schema.fields) {",
        "  if (isFieldNode(node)) {",
        "    console.log('Field:', node.name)",
        "  } else {",
        "    console.log('Layout:', node.type)",
        "  }",
        "}",
    ].join("\n");

    const coreConditionsCode = [
        "import { evaluateCondition } from '@formatica/core'",
        "",
        "const condition = { field: 'country', operator: 'eq', value: 'NL' }",
        "const values = { country: 'NL', city: 'Amsterdam' }",
        "",
        "const visible = evaluateCondition(condition, values)",
        "console.log(visible) // true",
        "",
        "// Complex condition group",
        "const group = {",
        "  and: [",
        "    { field: 'age', operator: 'gte', value: 18 },",
        "    { or: [",
        "      { field: 'country', operator: 'eq', value: 'NL' },",
        "      { field: 'country', operator: 'eq', value: 'DE' },",
        "    ]},",
        "  ],",
        "}",
    ].join("\n");

    const coreServerCode = [
        "// server.ts (Node.js / Bun / Deno)",
        "import {",
        "  parseFormSchema,",
        "  extractFields,",
        "  registerRule,",
        "  getRule,",
        "  evaluateCondition,",
        "} from '@formatica/core'",
        "",
        "// 1. Parse and validate schema from database or API",
        "const schema = parseFormSchema(jsonFromDatabase)",
        "",
        "// 2. Extract fields for server-side validation",
        "const fields = extractFields(schema.fields)",
        "",
        "// 3. Validate submitted data",
        "async function validateSubmission(data: Record<string, unknown>) {",
        "  const errors: Record<string, string[]> = {}",
        "  const ctx = { values: data, getFieldValue: (n: string) => data[n] }",
        "",
        "  for (const field of fields) {",
        "    // Skip hidden fields",
        "    if (field.condition && !evaluateCondition(field.condition, data)) continue",
        "",
        "    if (field.required) {",
        "      const requiredFn = getRule('required')",
        "      if (requiredFn) {",
        "        const result = await requiredFn(data[field.name], {}, ctx)",
        "        if (typeof result === 'string') {",
        "          errors[field.name] = [result]",
        "        }",
        "      }",
        "    }",
        "  }",
        "",
        "  return errors",
        "}",
    ].join("\n");

    const coreCustomRulesCode = [
        "import { registerRule, unregisterRule, getRule, hasRule } from '@formatica/core'",
        "",
        "// Register a custom rule",
        "registerRule('postalCode', (value) => {",
        "  if (!value) return true  // skip empty (use 'required' for that)",
        "  return /^\\d{4}\\s?[A-Za-z]{2}$/.test(String(value))",
        "    || 'Enter a valid Dutch postal code (e.g. 1234 AB)'",
        "})",
        "",
        "// Check if a rule exists",
        "console.log(hasRule('postalCode')) // true",
        "",
        "// Get rule function",
        "const ruleFn = getRule('postalCode')",
        "",
        "// Remove a rule",
        "unregisterRule('postalCode')",
    ].join("\n");

    // ── Shared code examples ─────────────────────────────────────────────────

    const customRulesSyncCode = [
        "import { registerRule } from '@formatica/core'",
        "",
        "// Sync rule",
        "registerRule('postalCode', (value) => {",
        "  if (!value) return true  // skip empty (use 'required' for that)",
        "  const str = String(value)",
        "  return /^\\d{4}\\s?[A-Za-z]{2}$/.test(str) || 'Enter a valid Dutch postal code (e.g. 1234 AB)'",
        "})",
        "",
        "// Async rule (e.g. check server)",
        "registerRule('uniqueEmail', async (value) => {",
        "  if (!value) return true",
        "  const res = await fetch('/api/check-email?email=' + value)",
        "  const data = await res.json()",
        "  return data.available || 'This email is already registered'",
        "})",
        "",
        "// Use in schema:",
        "{ type: 'text', name: 'zip', label: 'Postal code', rules: ['required', 'postalCode'] }",
        "{ type: 'text', name: 'email', label: 'Email', rules: ['required', 'email', 'uniqueEmail'] }",
    ].join("\n");

    const i18nSchemaCode = [
        "// Same schema works in both Vue and React",
        "const schema: FormSchema = {",
        "  fields: [",
        "    {",
        "      type: 'text', name: 'email', label: 'Email',",
        "      translations: {",
        "        nl: { label: 'E-mailadres', placeholder: 'Voer e-mail in', helpText: 'We delen dit nooit' },",
        "        de: { label: 'E-Mail', placeholder: 'E-Mail eingeben' },",
        "      },",
        "    },",
        "    {",
        "      type: 'select', name: 'role', label: 'Role',",
        "      options: [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }],",
        "      translations: {",
        "        nl: { label: 'Rol', options: { admin: 'Beheerder', user: 'Gebruiker' } },",
        "      },",
        "    },",
        "  ],",
        "  translations: {",
        "    en: { submit: 'Save', reset: 'Cancel' },",
        "    nl: { submit: 'Opslaan', reset: 'Annuleren' },",
        "  },",
        "}",
    ].join("\n");

    const i18nUsageCode = computed(() => {
        if (platform.value === "vue") {
            return "<!-- Switch locale with a prop -->\n<FormBuilder :schema='schema' locale='nl' />";
        }
        if (platform.value === "react") {
            return "// Switch locale with a prop\n<FormBuilder schema={schema} locale='nl' />";
        }
        return [
            "// Core: access translated labels programmatically",
            "import { resolveTranslation } from '@formatica/core'",
            "",
            "const label = resolveTranslation(field, 'label', 'nl', 'en')",
        ].join("\n");
    });

    const errorHandlingCode = computed(() => {
        if (platform.value === "vue") {
            return [
                "<script setup lang='ts'>",
                "import { useForm } from '@formatica/vue'",
                "import type { FormSchema } from '@formatica/vue'",
                "",
                "const schema: FormSchema = {",
                "  fields: [",
                "    { type: 'text', name: 'email', label: 'Email', rules: ['required', 'email'] },",
                "  ],",
                "}",
                "",
                "const form = useForm(schema)",
                "",
                "async function onSubmit(values: Record<string, unknown>) {",
                "  try {",
                "    await fetch('/api/register', {",
                "      method: 'POST',",
                "      body: JSON.stringify(values),",
                "    })",
                "  } catch (err: any) {",
                "    // API returns { errors: { email: 'Already taken' } }",
                "    const serverErrors = err.response?.data?.errors ?? {}",
                "    for (const [field, message] of Object.entries(serverErrors)) {",
                "      form.setError(field, [message as string])",
                "    }",
                "  }",
                "}",
                "<\\/script>",
            ].join("\n");
        }
        if (platform.value === "react") {
            return [
                "import { useForm } from '@formatica/react'",
                "import type { FormSchema } from '@formatica/react'",
                "",
                "const schema: FormSchema = {",
                "  fields: [",
                "    { type: 'text', name: 'email', label: 'Email', rules: ['required', 'email'] },",
                "  ],",
                "}",
                "",
                "export default function RegisterForm() {",
                "  const form = useForm(schema)",
                "",
                "  const handleSubmit = () => form.submit(async (values) => {",
                "    const res = await fetch('/api/register', {",
                "      method: 'POST',",
                "      body: JSON.stringify(values),",
                "    })",
                "    if (!res.ok) {",
                "      const data = await res.json()",
                "      // API returns { errors: { email: 'Already taken' } }",
                "      for (const [field, message] of Object.entries(data.errors)) {",
                "        form.setError(field, message as string)",
                "      }",
                "    }",
                "  })",
                "",
                "  return <button onClick={handleSubmit}>Register</button>",
                "}",
            ].join("\n");
        }
        return [
            "import { getRule } from '@formatica/core'",
            "",
            "// Validate a single field value against a rule",
            "const requiredFn = getRule('required')",
            "if (requiredFn) {",
            "  const result = await requiredFn(value, {}, ctx)",
            "  if (typeof result === 'string') {",
            "    // result is the error message",
            "    console.error('Validation error:', result)",
            "  }",
            "}",
            "",
            "// Collect all errors for a submission",
            "const errors: Record<string, string[]> = {}",
            "for (const field of fields) {",
            "  const fieldErrors: string[] = []",
            "  for (const ruleName of field.rules ?? []) {",
            "    const ruleFn = getRule(ruleName)",
            "    if (ruleFn) {",
            "      const result = await ruleFn(data[field.name], {}, ctx)",
            "      if (typeof result === 'string') fieldErrors.push(result)",
            "    }",
            "  }",
            "  if (fieldErrors.length) errors[field.name] = fieldErrors",
            "}",
        ].join("\n");
    });

    const errorHandlingLang = computed(() => {
        if (platform.value === "vue") return "vue";
        if (platform.value === "react") return "tsx";
        return "typescript";
    });

    const themingTailwindCode = [
        "// tailwind.config.ts",
        "export default {",
        "  content: [",
        "    './src/**/*.{vue,ts,tsx}',",
        "    './node_modules/@formatica/vue/dist/**/*.js',",
        "    './node_modules/@formatica/react/dist/**/*.js',",
        "  ],",
        "}",
    ].join("\n");

    const platformLabels: Record<Platform, string> = {
        vue: "Vue",
        react: "React",
        core: "Core",
    };
</script>

<template>
  <div class="-m-6 lg:-m-8 flex h-[calc(100vh-3.5rem)] overflow-hidden">
    <!-- Sidebar -->
    <nav class="hidden lg:flex w-56 shrink-0 flex-col overflow-y-auto scrollbar-thin border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-6">
      <p class="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">On this page</p>
      <ul class="space-y-0.5">
        <li v-for="s in sections" :key="s.id">
          <button
            :class="['block w-full rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors', activeSection === s.id ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200']"
            @click="scrollTo(s.id)"
          >{{ s.label }}</button>
        </li>
      </ul>
    </nav>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto scrollbar-thin px-6 py-8 lg:px-12 lg:py-10">
      <div class="mx-auto max-w-3xl space-y-14">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Documentation</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">API reference for Formatica.</p>

          <!-- Platform switcher -->
          <div class="sticky top-0 z-10 mt-4 -mx-2 px-2 py-3 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
            <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-0.5">
              <button
                v-for="p in (['vue', 'react', 'core'] as Platform[])"
                :key="p"
                :class="[
                  'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                  platform === p
                    ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                ]"
                @click="switchPlatform(p)"
              >{{ platformLabels[p] }}</button>
            </div>
          </div>
        </div>

        <!-- ─── INSTALLATION ────────────────────────────────── -->
        <DocSection id="installation" title="Installation" description="Install the package for your project.">
          <DocCodeBlock language="bash" :code="installCode" />
          <template v-if="platform !== 'core'">
            <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Import the CSS</h4>
            <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
              Required for theming, dark mode, and base styling. Add this import once in your entry file.
            </p>
            <DocCodeBlock language="typescript" :code="installCssCode" />
          </template>
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">{{ installNote }}</p>
        </DocSection>

        <!-- ─── SCHEMA FORMAT ───────────────────────────────── -->
        <DocSection id="schema" title="Schema Format" description="The schema format is identical across all three packages. Fields and layout live together in one tree.">
          <DocCodeBlock language="typescript" :code="schemaTypesCode" />
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Fields and layout are the same tree. No separate layout object, no name references to get wrong.
          </p>
          <DocCodeBlock language="json" :code="schemaJsonCode" />
        </DocSection>

        <!-- ─── FIELD TYPES ─────────────────────────────────── -->
        <DocSection id="field-types" title="Field Types" description="All 13 built-in field types. The same types work across Vue, React, and core.">
          <DocPropsTable :columns="['Type', 'Description']" :rows="fieldTypes" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Common field properties (all types)</h4>
          <DocCodeBlock language="typescript" :code="fieldBaseCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Phone field</h4>
          <DocCodeBlock language="json" :code="phoneFieldCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Select with options</h4>
          <DocCodeBlock language="json" :code="selectOptionsCode" />
        </DocSection>

        <!-- ─── LAYOUT ──────────────────────────────────────── -->
        <DocSection id="layout" title="Layout (Rows, Groups, Steps, Tabs)" description="Layout containers are part of the schema tree, mixed inline with fields. The same layout works in Vue and React.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Row - 12-column grid</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">Each child field uses <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">span</code> (1-12) to control its width. Fields wrap to the next line when spans exceed 12.</p>
          <DocCodeBlock language="json" :code="rowLayoutCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Group - fieldset with title</h4>
          <DocCodeBlock language="json" :code="groupLayoutCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Steps - multi-step wizard</h4>
          <DocCodeBlock language="json" :code="stepsLayoutCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Tabs</h4>
          <DocCodeBlock language="json" :code="tabsLayoutCode" />
        </DocSection>

        <!-- ─── VALIDATION ──────────────────────────────────── -->
        <DocSection id="validation" title="Validation" description="Built-in rules as shorthand strings. Works identically in Vue, React, and core. Runs on blur by default, always on submit.">
          <DocCodeBlock language="typescript" :code="validationFormatsCode" />
          <div class="mt-4">
            <DocPropsTable :columns="['Rule', 'Description']" :rows="validationRules" />
          </div>
        </DocSection>

        <!-- ─── VUE: QUICK START ────────────────────────────── -->
        <DocSection v-if="platform === 'vue'" id="quick-start" title="Quick Start" description="Install the plugin, then drop in a FormBuilder component.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">1. Install the plugin (main.ts)</h4>
          <DocCodeBlock language="typescript" :code="vuePluginInstallCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">2. Use FormBuilder in any component</h4>
          <DocCodeBlock language="vue" :code="vueQuickStartCode" />
        </DocSection>

        <!-- ─── VUE: PLUGIN SETUP ──────────────────────────── -->
        <DocSection v-if="platform === 'vue'" id="plugin-setup" title="Plugin Setup" description="createFormatica() configures global defaults for theme, locale, and custom components. All options are optional.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">FormaticaOptions interface</h4>
          <DocCodeBlock language="typescript" :code="vuePluginOptionsCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">How globals merge with props</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            When you install the plugin, all FormBuilder instances inherit the global theme, locale, and components.
            Props passed directly to FormBuilder always take priority over the global values.
            This lets you set sensible defaults once and override them per-form when needed.
          </p>

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Registering custom components globally</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Components passed to <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">createFormatica({ components })</code>
            are registered in the global field registry. Every FormBuilder instance can then use those types in its schema
            without passing <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">:components</code> as a prop.
          </p>
        </DocSection>

        <!-- ─── VUE: FORMBUILDER PROPS ──────────────────────── -->
        <DocSection v-if="platform === 'vue'" id="form-builder" title="FormBuilder Props" description="All props accepted by the Vue FormBuilder component. When using the plugin, theme, locale, and components are optional (inherited from createFormatica).">
          <DocPropsTable :columns="['Prop', 'Type', 'Default', 'Description']" :rows="vueFormBuilderProps" />
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            When the <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">createFormatica()</code> plugin is installed,
            <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">theme</code>,
            <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">locale</code>, and
            <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">components</code>
            are inherited from the global config. Props override globals.
          </p>
        </DocSection>

        <!-- ─── VUE: EVENTS & V-MODEL ───────────────────────── -->
        <DocSection v-if="platform === 'vue'" id="events" title="Events & v-model" description="How to react to form changes, submission, and bind values reactively.">
          <DocPropsTable :columns="['Event', 'Payload', 'Description']" :rows="vueFormEvents" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">v-model - reactive form values</h4>
          <DocCodeBlock language="vue" :code="vueVModelCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Submit with loading state</h4>
          <DocCodeBlock language="vue" :code="vueSubmitLoadingCode" />
        </DocSection>

        <!-- ─── VUE: useForm() ──────────────────────────────── -->
        <DocSection v-if="platform === 'vue'" id="use-form" title="useForm() Composable" description="For advanced use cases where you need direct access to form state outside the FormBuilder component.">
          <DocCodeBlock language="vue" :code="vueUseFormCode" />
        </DocSection>

        <!-- ─── VUE: CUSTOM FIELD TYPES ─────────────────────── -->
        <DocSection v-if="platform === 'vue'" id="custom-fields" title="Custom Field Types" description="Override built-in components or register entirely new field types.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Per-instance via <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">components</code> prop</h4>
          <DocCodeBlock language="vue" :code="customFieldsVuePerInstanceCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Global registry</h4>
          <DocCodeBlock language="typescript" :code="customFieldsVueGlobalCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Writing a custom field component</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Your component receives props from the field schema and must emit <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">update:modelValue</code> and <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">blur</code>.
            The component is wrapped by BaseField which handles label, error messages, help text, and tooltip automatically.
          </p>
          <DocCodeBlock language="vue" :code="customFieldsVueComponentCode" />
        </DocSection>

        <!-- ─── VUE: THEMING ────────────────────────────────── -->
        <DocSection v-if="platform === 'vue'" id="theming" title="Theming" description="Customize colors, spacing, and component styles. Requires the CSS import.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">CSS file import</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            The CSS file (<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">@formatica/vue/style.css</code>) is required for theming.
            It defines CSS variables that map to your ThemeConfig values and provides base styling for all form elements.
          </p>

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">ThemeConfig prop</h4>
          <DocCodeBlock language="vue" :code="themingVueCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">CSS variables</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Theme colors and spacing map to CSS custom properties. You can also override these directly in your own CSS.
          </p>
          <DocCodeBlock language="css" :code="themingCssVarsCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Dark mode</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Formatica supports dark mode via the <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">.dark</code> class on any ancestor element.
            This is compatible with Tailwind's <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">darkMode: 'class'</code> setting.
          </p>
          <DocCodeBlock language="html" :code="themingDarkModeCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Tailwind CSS configuration</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Formatica uses Tailwind CSS classes. Your Tailwind config must include the library's dist files in <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">content</code> to scan for classes:
          </p>
          <DocCodeBlock language="typescript" :code="themingTailwindCode" />
        </DocSection>

        <!-- ─── REACT: QUICK START ──────────────────────────── -->
        <DocSection v-if="platform === 'react'" id="quick-start" title="Quick Start" description="Wrap your app in FormaticaProvider, then use FormBuilder anywhere.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">1. Set up the provider (App.tsx)</h4>
          <DocCodeBlock language="tsx" :code="reactProviderCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">2. Use FormBuilder in any component</h4>
          <DocCodeBlock language="tsx" :code="reactQuickStartCode" />
        </DocSection>

        <!-- ─── REACT: PROVIDER SETUP ─────────────────────── -->
        <DocSection v-if="platform === 'react'" id="provider-setup" title="Provider Setup" description="FormaticaProvider supplies global theme, locale, and components to all nested FormBuilder instances.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">FormaticaConfig interface</h4>
          <DocCodeBlock language="typescript" :code="reactProviderOptionsCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">useFormaticaConfig()</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Access the global config from any component inside the provider tree.
          </p>
          <DocCodeBlock language="tsx" :code="reactProviderHookCode" />
        </DocSection>

        <!-- ─── REACT: FORMBUILDER PROPS ────────────────────── -->
        <DocSection v-if="platform === 'react'" id="form-builder" title="FormBuilder Props" description="All props accepted by the React FormBuilder component.">
          <DocPropsTable :columns="['Prop', 'Type', 'Default', 'Description']" :rows="reactFormBuilderProps" />
          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">useFormContext()</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Access form state from any child component rendered inside <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">FormBuilder</code>.
          </p>
          <DocCodeBlock language="tsx" :code="reactFormContextCode" />
        </DocSection>

        <!-- ─── REACT: useForm() ────────────────────────────── -->
        <DocSection v-if="platform === 'react'" id="use-form" title="useForm() Hook" description="For advanced use cases where you need direct access to form state.">
          <DocCodeBlock language="tsx" :code="reactUseFormCode" />
        </DocSection>

        <!-- ─── REACT: CUSTOM COMPONENTS ────────────────────── -->
        <DocSection v-if="platform === 'react'" id="custom-components" title="Custom Components" description="Override built-in field renderers or register entirely new field types via the components prop.">
          <DocCodeBlock language="tsx" :code="reactCustomComponentCode" />
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Your component receives <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">FieldComponentProps</code>: field schema, current value, onChange, onBlur, errors array, and disabled state.
            The component is wrapped by <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">BaseField</code> which handles label, error messages, and help text automatically.
          </p>
        </DocSection>

        <!-- ─── REACT: THEMING ──────────────────────────────── -->
        <DocSection v-if="platform === 'react'" id="theming" title="Theming" description="Customize colors, spacing, and component styles. Requires the CSS import.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">CSS file import</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            The CSS file (<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">@formatica/vue/style.css</code>) is required for theming.
            The same file works for both Vue and React.
          </p>

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">className and CSS variables</h4>
          <DocCodeBlock language="tsx" :code="themingReactCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">CSS variables</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Theme colors and spacing map to CSS custom properties. You can also override these directly in your own CSS.
          </p>
          <DocCodeBlock language="css" :code="themingCssVarsCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Dark mode</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Formatica supports dark mode via the <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">.dark</code> class on any ancestor element.
            This is compatible with Tailwind's <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">darkMode: 'class'</code> setting.
          </p>
          <DocCodeBlock language="html" :code="themingDarkModeCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Tailwind CSS configuration</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Formatica uses Tailwind CSS classes. Your Tailwind config must include the library's dist files in <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">content</code> to scan for classes:
          </p>
          <DocCodeBlock language="typescript" :code="themingTailwindCode" />
        </DocSection>

        <!-- ─── CORE: QUICK START ───────────────────────────── -->
        <DocSection v-if="platform === 'core'" id="quick-start" title="Quick Start (Standalone)" description="Use @formatica/core without any framework for schema parsing, validation, condition evaluation, and server-side processing.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Global configuration (optional)</h4>
          <DocCodeBlock language="typescript" :code="coreConfigureCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Usage</h4>
          <DocCodeBlock language="typescript" :code="coreQuickStartCode" />
        </DocSection>

        <!-- ─── CORE: SCHEMA PARSING ────────────────────────── -->
        <DocSection v-if="platform === 'core'" id="schema-parsing" title="Schema Parsing" description="Parse and validate JSON schemas with full error reporting.">
          <DocCodeBlock language="typescript" :code="coreParseSchemaCode" />
        </DocSection>

        <!-- ─── CORE: FIELD EXTRACTION ──────────────────────── -->
        <DocSection v-if="platform === 'core'" id="field-extraction" title="Field Extraction" description="Flatten the schema tree into a plain array of fields for processing.">
          <DocCodeBlock language="typescript" :code="coreExtractFieldsCode" />
        </DocSection>

        <!-- ─── CORE: CONDITION EVALUATION ──────────────────── -->
        <DocSection v-if="platform === 'core'" id="condition-evaluation" title="Condition Evaluation" description="Evaluate show/hide conditions against a set of form values.">
          <DocCodeBlock language="typescript" :code="coreConditionsCode" />
        </DocSection>

        <!-- ─── CORE: SERVER-SIDE USAGE ─────────────────────── -->
        <DocSection v-if="platform === 'core'" id="server-side" title="Server-Side Usage" description="Use the same schema and validation on your Node.js / Bun / Deno backend.">
          <DocCodeBlock language="typescript" :code="coreServerCode" />
        </DocSection>

        <!-- ─── CUSTOM RULES ────────────────────────────────── -->
        <DocSection id="custom-rules" title="Custom Validation Rules" description="Register custom validation rules globally. Works the same in all packages (core API).">
          <DocCodeBlock language="typescript" :code="customRulesSyncCode" />
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Both <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">@formatica/vue</code> and <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">@formatica/react</code> re-export <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">registerRule</code> from core, so you can import it from whichever package you are using.
          </p>
        </DocSection>

        <!-- ─── I18N ────────────────────────────────────────── -->
        <DocSection id="i18n" title="i18n / Translations" description="Per-field and form-level translations. Same schema format works across all packages.">
          <DocCodeBlock language="typescript" :code="i18nSchemaCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Usage</h4>
          <DocCodeBlock :language="platform === 'vue' ? 'vue' : platform === 'react' ? 'tsx' : 'typescript'" :code="i18nUsageCode" />

          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Resolution order: field translations[locale] &rarr; field translations[fallback] &rarr; field.label &rarr; titleCase(field.name)
          </p>
        </DocSection>

        <!-- ─── ERROR HANDLING ──────────────────────────────── -->
        <DocSection id="errors" title="Error Handling" description="Handle server-side errors and display them alongside validation errors.">
          <DocCodeBlock :language="errorHandlingLang" :code="errorHandlingCode" />
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <template v-if="platform !== 'core'">Server-side errors display exactly like validation errors. They auto-clear when the user changes that field's value.</template>
            <template v-else>Use the core validation utilities to build server-side validation that mirrors client-side behavior.</template>
          </p>
        </DocSection>

        <div class="h-16" />
      </div>
    </div>
  </div>
</template>
