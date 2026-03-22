<script setup lang="ts">
    import { onMounted, onUnmounted, ref } from "vue";
    import DocCodeBlock from "../components/docs/DocCodeBlock.vue";
    import DocPropsTable from "../components/docs/DocPropsTable.vue";
    import DocSection from "../components/docs/DocSection.vue";

    const sections = [
        { id: "installation", label: "Installation" },
        { id: "quick-start", label: "Quick Start" },
        { id: "schema", label: "Schema Format" },
        { id: "field-types", label: "Field Types" },
        { id: "layout", label: "Layout (Rows, Groups)" },
        { id: "validation", label: "Validation" },
        { id: "form-builder-props", label: "FormBuilder Props" },
        { id: "events", label: "Events & v-model" },
        { id: "use-form", label: "useForm() Composable" },
        { id: "errors", label: "Error Handling" },
        { id: "i18n", label: "i18n / Translations" },
        { id: "custom-fields", label: "Custom Field Types" },
        { id: "custom-rules", label: "Custom Validation Rules" },
        { id: "theming", label: "Theming" },
    ];

    const activeSection = ref("installation");

    function scrollTo(id: string) {
        activeSection.value = id;
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }

    let observer: IntersectionObserver | null = null;

    onMounted(() => {
        observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) activeSection.value = entry.target.id;
                }
            },
            { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
        );
        for (const s of sections) {
            const el = document.getElementById(s.id);
            if (el) observer?.observe(el);
        }
    });

    onUnmounted(() => {
        observer?.disconnect();
    });

    const formBuilderProps = [
        { name: "schema", type: "FormSchema", def: "—", desc: "The form schema (required)" },
        {
            name: "components",
            type: "Record<string, Component>",
            def: "{}",
            desc: "Override or add custom field components",
        },
        { name: "locale", type: "string", def: "'en'", desc: "Active locale for translations" },
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

    const formEvents = [
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

    const validationRules = [
        { name: "required", desc: "Must not be empty, false, or null" },
        { name: "email", desc: "Must be a valid email address" },
        { name: "phone", desc: "Must be a valid phone number (E.164)" },
        { name: "url", desc: "Must be a valid URL" },
        { name: "numeric", desc: "Must be a number" },
        { name: "min:n", desc: "Minimum numeric value (e.g. min:0)" },
        { name: "max:n", desc: "Maximum numeric value (e.g. max:100)" },
        { name: "minLength:n", desc: "Minimum string length (e.g. minLength:3)" },
        { name: "maxLength:n", desc: "Maximum string length (e.g. maxLength:200)" },
        { name: "pattern:regex", desc: "Must match a regular expression" },
        { name: "alpha", desc: "Letters only" },
        { name: "alphaNumeric", desc: "Letters and numbers only" },
    ];

    const fieldTypes = [
        { name: "text", desc: "Text input (also email, password, url, tel via inputType)" },
        { name: "number", desc: "Numeric input with min/max/step" },
        { name: "textarea", desc: "Multi-line text with optional autoResize" },
        { name: "select", desc: "Dropdown with options, searchable, clearable, multiple" },
        { name: "checkbox", desc: "Single boolean checkbox" },
        { name: "checkbox-group", desc: "Multiple checkboxes from options array" },
        { name: "radio", desc: "Radio button group from options array" },
        { name: "switch", desc: "Toggle switch with on/off labels" },
        { name: "date", desc: "Date picker (native)" },
        { name: "file", desc: "File upload with drag & drop" },
        { name: "slider", desc: "Range slider with min/max/step/tooltip" },
        { name: "tags", desc: "Tag input with suggestions" },
        { name: "phone", desc: "Phone number with country flag selector" },
    ];

    const quickStartCode = `<script setup lang='ts'>
import { ref } from 'vue'
import { FormBuilder } from '@formatica/vue'
import type { FormSchema } from '@formatica/vue'

const schema: FormSchema = {
  fields: [
    { type: 'text', name: 'name', label: 'Full name', rules: ['required', 'minLength:2'] },
    { type: 'text', name: 'email', label: 'Email', inputType: 'email', rules: ['required', 'email'] },
    { type: 'textarea', name: 'message', label: 'Message', rules: ['required'] },
  ],
  translations: {
    en: { submit: 'Send message' },
  },
}

const formValues = ref<Record<string, unknown>>({})

function onSubmit(values: Record<string, unknown>) {
  console.log('Form submitted:', values)
  alert('Submitted! Check console.')
}
<\/script>

<template>
  <FormBuilder
    :schema='schema'
    v-model='formValues'
    @submit='onSubmit'
  />
</template>`;

    const schemaJsonCode = `{
  "fields": [
    { "type": "text", "name": "email", "label": "Email", "rules": ["required", "email"] },
    {
      "type": "row",
      "children": [
        { "type": "text", "name": "city", "label": "City", "span": 8 },
        { "type": "text", "name": "zip", "label": "ZIP", "span": 4 }
      ]
    },
    {
      "type": "group", "title": "Preferences",
      "children": [
        { "type": "switch", "name": "newsletter", "label": "Subscribe" }
      ]
    }
  ]
}`;

    const phoneFieldCode = `{
  "type": "phone",
  "name": "phone",
  "label": "Phone number",
  "defaultCountry": "NL",
  "rules": ["required", "phone"]
}`;

    const selectOptionsCode = `{
  "type": "select",
  "name": "country",
  "label": "Country",
  "clearable": true,
  "searchable": true,
  "options": [
    { "label": "Netherlands", "value": "NL" },
    { "label": "Germany", "value": "DE" },
    { "label": "France", "value": "FR" }
  ]
}`;

    const rowLayoutCode = `{
  "type": "row",
  "children": [
    { "type": "text", "name": "first", "label": "First name", "span": 6 },
    { "type": "text", "name": "last", "label": "Last name", "span": 6 }
  ]
}`;

    const groupLayoutCode = `{
  "type": "group",
  "title": "Address",
  "collapsible": true,
  "children": [
    { "type": "text", "name": "street", "label": "Street" },
    { "type": "row", "children": [
      { "type": "text", "name": "city", "label": "City", "span": 8 },
      { "type": "text", "name": "zip", "label": "ZIP", "span": 4 }
    ]}
  ]
}`;

    const stepsLayoutCode = `{
  "type": "steps",
  "linear": true,
  "steps": [
    { "title": "Account", "children": [
      { "type": "text", "name": "email", "label": "Email", "rules": ["required", "email"] }
    ]},
    { "title": "Profile", "children": [
      { "type": "text", "name": "bio", "label": "Bio" }
    ]}
  ]
}`;

    const tabsLayoutCode = `{
  "type": "tabs",
  "tabs": [
    { "title": "General", "children": [...] },
    { "title": "Advanced", "children": [...] }
  ]
}`;

    const vModelCode = `<script setup lang='ts'>
import { ref, watch } from 'vue'
import { FormBuilder } from '@formatica/vue'

const formValues = ref<Record<string, unknown>>({})

// React to any field change
watch(formValues, (values) => {
  console.log('Form values changed:', values)
}, { deep: true })
<\/script>

<template>
  <FormBuilder :schema='schema' v-model='formValues' />

  <!-- Display live values -->
  <pre>{{ JSON.stringify(formValues, null, 2) }}</pre>
</template>`;

    const submitLoadingCode = `<script setup lang='ts'>
import { ref } from 'vue'
import { FormBuilder } from '@formatica/vue'

const isLoading = ref(false)

async function onSubmit(values: Record<string, unknown>) {
  isLoading.value = true
  try {
    await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(values),
    })
    alert('Success!')
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}
<\/script>

<template>
  <FormBuilder
    :schema='schema'
    @submit='onSubmit'
    @error='(e) => console.error("Validation failed:", e)'
  />
</template>`;

    const useFormCode = `<script setup lang='ts'>
import { useForm } from '@formatica/vue'
import type { FormSchema } from '@formatica/vue'

const schema: FormSchema = {
  fields: [
    { type: 'text', name: 'email', label: 'Email', rules: ['required', 'email'] },
  ],
}

const form = useForm(schema, { locale: 'en' })

// Reactive state
form.values          // Record<string, unknown> — current values
form.errors          // Record<string, string[]> — per-field errors
form.touched         // Record<string, boolean> — has user interacted?
form.dirty           // Record<string, boolean> — value differs from initial?
form.isValid         // ComputedRef<boolean>
form.isDirty         // ComputedRef<boolean>
form.isSubmitting    // Ref<boolean>
form.submitCount     // Ref<number>

// Methods
form.setFieldValue('email', 'test@example.com')
form.validate()       // validate all, returns Promise<boolean>
form.validateField('email')  // validate one field
form.reset()          // reset to initial values
form.clear()          // clear all values, errors, touched
form.setError('email', 'Already taken')  // set server-side error
form.clearError('email')
form.clearErrors()

// Submit (validates first, then calls handler)
form.submit(async (values) => {
  await api.post('/users', values)
})
<\/script>`;

    const errorsReactiveCode = `<template>
  <FormBuilder :schema='schema' @submit='onSubmit' />

  <!-- Show all current errors -->
  <div v-for='(errors, fieldName) in form.errors' :key='fieldName'>
    <p v-for='error in errors' :key='error' class='text-red-500'>
      {{ fieldName }}: {{ error }}
    </p>
  </div>
</template>`;

    const i18nLocaleCode = `<!-- Switch locale with a prop -->
<FormBuilder :schema='schema' locale='nl' />`;

    const customFieldsPerInstanceCode = `<script setup lang='ts'>
import { FormBuilder } from '@formatica/vue'
import type { FormSchema } from '@formatica/vue'
import MyCustomTextInput from './MyCustomTextInput.vue'
import MyRatingInput from './MyRatingInput.vue'

const schema: FormSchema = {
  fields: [
    { type: 'text', name: 'name', label: 'Name' },          // uses MyCustomTextInput
    { type: 'rating', name: 'score', label: 'Rate us' },     // uses MyRatingInput
  ],
}
<\/script>

<template>
  <FormBuilder
    :schema='schema'
    :components='{
      text: MyCustomTextInput,    // override built-in text
      rating: MyRatingInput,      // register new type
    }'
    @submit='onSubmit'
  />
</template>`;

    const customRatingComponentCode = `<!-- MyRatingInput.vue -->
<script setup lang='ts'>
defineProps<{
  modelValue: number | null
  disabled?: boolean
  min?: number
  max?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  blur: [event: FocusEvent]
}>()
<\/script>

<template>
  <div class='flex gap-1'>
    <button
      v-for='n in (max ?? 5)'
      :key='n'
      type='button'
      :disabled='disabled'
      :class='[
        "text-2xl transition-colors",
        n <= (modelValue ?? 0) ? "text-yellow-400" : "text-gray-300"
      ]'
      @click='emit("update:modelValue", n)'
    >
      &#9733;
    </button>
  </div>
</template>`;

    const themingCode = `<script setup lang='ts'>
import { FormBuilder } from '@formatica/vue'
import type { ThemeConfig } from '@formatica/vue'

const theme: ThemeConfig = {
  name: 'my-theme',
  colors: {
    primary: '#4f46e5',
    error: '#dc2626',
    success: '#059669',
  },
  cssVars: {
    '--fc-radius': '0.75rem',
    '--fc-input-bg': '#f9fafb',
  },
}
<\/script>

<template>
  <FormBuilder :schema='schema' :theme='theme' />
</template>`;
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
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Complete API reference for @formatica/vue.</p>
        </div>

        <!-- ─── INSTALLATION ─────────────────────────────── -->
        <DocSection id="installation" title="Installation" description="Install Formatica and its peer dependency.">
          <DocCodeBlock language="bash" code="npm install @formatica/vue libphonenumber-js
# or
yarn add @formatica/vue libphonenumber-js" />
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <code class="text-[11px] bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">libphonenumber-js</code> is required for the phone field type. All other field types have zero external dependencies.
          </p>
        </DocSection>

        <!-- ─── QUICK START ──────────────────────────────── -->
        <DocSection id="quick-start" title="Quick Start" description="Minimal working form in 20 lines.">
          <DocCodeBlock language="vue" :code="quickStartCode" />
        </DocSection>

        <!-- ─── SCHEMA FORMAT ────────────────────────────── -->
        <DocSection id="schema" title="Schema Format" description="The schema is a single object. Fields and layout live together in one tree.">
          <DocCodeBlock language="typescript" code="interface FormSchema {
  id?: string                   // Unique identifier
  version?: string              // Schema version
  fields: SchemaNode[]          // The form tree (fields + layout containers)
  settings?: FormSettings       // Validation timing, layout mode
  translations?: FormTranslations // Per-locale strings
}

// SchemaNode is either a field or a layout container:
type SchemaNode =
  | FieldSchema     // text, number, select, checkbox, etc.
  | RowNode         // { type: 'row', children: [...] }
  | GroupNode       // { type: 'group', title: '...', children: [...] }
  | StepsNode       // { type: 'steps', steps: [...] }
  | TabsNode        // { type: 'tabs', tabs: [...] }
  | DividerNode     // { type: 'divider' }
  | HtmlNode        // { type: 'html', content: '...' }" />
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Fields and layout are the same tree. No separate layout object, no name references to get wrong.
          </p>
          <DocCodeBlock language="json" :code="schemaJsonCode" />
        </DocSection>

        <!-- ─── FIELD TYPES ──────────────────────────────── -->
        <DocSection id="field-types" title="Field Types" description="All 13 built-in field types.">
          <DocPropsTable :columns="['Type', 'Description']" :rows="fieldTypes" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Common field properties (all types)</h4>
          <DocCodeBlock language="typescript" code="interface FieldBase {
  type: string                // Field type discriminator
  name: string                // Unique key in form values
  label?: string              // Display label
  placeholder?: string        // Placeholder text
  helpText?: string           // Help text below the input
  tooltip?: string            // Info icon tooltip
  defaultValue?: unknown      // Initial value
  rules?: string | string[]   // Validation rules
  required?: boolean          // Adds 'required' rule + asterisk
  disabled?: boolean          // Disable the field
  span?: ColumnSpan           // Column width (1-12) when inside a row
  condition?: Condition       // Show/hide based on other field values
  translations?: FieldTranslations // Per-locale overrides
}" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Phone field</h4>
          <DocCodeBlock language="json" :code="phoneFieldCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Select with options</h4>
          <DocCodeBlock language="json" :code="selectOptionsCode" />
        </DocSection>

        <!-- ─── LAYOUT ───────────────────────────────────── -->
        <DocSection id="layout" title="Layout (Rows, Groups, Steps, Tabs)" description="Layout containers are part of the schema tree, mixed inline with fields.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Row — 12-column grid</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">Each child field uses <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">span</code> (1–12) to control its width. Fields wrap to the next line when spans exceed 12.</p>
          <DocCodeBlock language="json" :code="rowLayoutCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Group — fieldset with title</h4>
          <DocCodeBlock language="json" :code="groupLayoutCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Steps — multi-step wizard</h4>
          <DocCodeBlock language="json" :code="stepsLayoutCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Tabs</h4>
          <DocCodeBlock language="json" :code="tabsLayoutCode" />
        </DocSection>

        <!-- ─── VALIDATION ───────────────────────────────── -->
        <DocSection id="validation" title="Validation" description="Built-in rules as shorthand strings. Runs on blur by default, always on submit.">
          <DocCodeBlock language="typescript" code="// String shorthand (pipe-separated):
{ rules: 'required|email|minLength:3' }

// Array of strings:
{ rules: ['required', 'email', 'minLength:3'] }

// Simple required shorthand:
{ required: true } // same as rules: ['required']" />
          <div class="mt-4">
            <DocPropsTable :columns="['Rule', 'Description']" :rows="validationRules" />
          </div>
        </DocSection>

        <!-- ─── FORMBUILDER PROPS ────────────────────────── -->
        <DocSection id="form-builder-props" title="FormBuilder Props" description="All props accepted by the FormBuilder component.">
          <DocPropsTable :columns="['Prop', 'Type', 'Default', 'Description']" :rows="formBuilderProps" />
        </DocSection>

        <!-- ─── EVENTS & V-MODEL ─────────────────────────── -->
        <DocSection id="events" title="Events & v-model" description="How to react to form changes, submission, and bind values reactively.">
          <DocPropsTable :columns="['Event', 'Payload', 'Description']" :rows="formEvents" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">v-model — reactive form values</h4>
          <DocCodeBlock language="vue" :code="vModelCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Submit with loading state</h4>
          <DocCodeBlock language="vue" :code="submitLoadingCode" />
        </DocSection>

        <!-- ─── useForm() ────────────────────────────────── -->
        <DocSection id="use-form" title="useForm() Composable" description="For advanced use cases where you need direct access to form state outside the FormBuilder component.">
          <DocCodeBlock language="vue" :code="useFormCode" />
        </DocSection>

        <!-- ─── ERROR HANDLING ───────────────────────────── -->
        <DocSection id="errors" title="Error Handling" description="Client-side validation errors, server-side errors, and how to display them.">
          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Server-side errors (after submit)</h4>
          <DocCodeBlock language="typescript" code="async function onSubmit(values: Record<string, unknown>) {
  try {
    await api.post('/register', values)
  } catch (err) {
    // API returns { errors: { email: 'Already taken' } }
    const serverErrors = err.response.data.errors
    for (const [field, message] of Object.entries(serverErrors)) {
      form.setError(field, message as string)
    }
    // Errors display exactly like validation errors.
    // They auto-clear when the user changes that field's value.
  }
}" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Reading errors reactively</h4>
          <DocCodeBlock language="vue" :code="errorsReactiveCode" />
        </DocSection>

        <!-- ─── I18N ─────────────────────────────────────── -->
        <DocSection id="i18n" title="i18n / Translations" description="Per-field and form-level translations. Switch locale at runtime.">
          <DocCodeBlock language="typescript" code="const schema: FormSchema = {
  fields: [
    {
      type: 'text', name: 'email', label: 'Email',
      translations: {
        nl: { label: 'E-mailadres', placeholder: 'Voer e-mail in', helpText: 'We delen dit nooit' },
        de: { label: 'E-Mail', placeholder: 'E-Mail eingeben' },
      },
    },
    {
      type: 'select', name: 'role', label: 'Role',
      options: [{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }],
      translations: {
        nl: { label: 'Rol', options: { admin: 'Beheerder', user: 'Gebruiker' } },
      },
    },
  ],
  translations: {
    en: { submit: 'Save', reset: 'Cancel' },
    nl: { submit: 'Opslaan', reset: 'Annuleren' },
  },
}" />
          <DocCodeBlock language="vue" :code="i18nLocaleCode" />
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Resolution order: field translations[locale] → field translations[fallback] → field.label → titleCase(field.name)
          </p>
        </DocSection>

        <!-- ─── CUSTOM FIELD TYPES ───────────────────────── -->
        <DocSection id="custom-fields" title="Custom Field Types" description="Override built-in components or register entirely new field types.">

          <h4 class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Option 1: Per-instance via <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">components</code> prop (recommended)</h4>
          <DocCodeBlock language="vue" :code="customFieldsPerInstanceCode" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Option 2: Global registry</h4>
          <DocCodeBlock language="typescript" code="import { registerFieldType } from '@formatica/vue'
import MyRatingInput from './MyRatingInput.vue'

// Call once at app startup (e.g. in main.ts)
registerFieldType('rating', MyRatingInput)

// Now all FormBuilder instances can use { type: 'rating' }" />

          <h4 class="mt-6 mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Writing a custom field component</h4>
          <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Your component receives props from the field schema and must emit <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">update:modelValue</code> and <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">blur</code>.
          </p>
          <DocCodeBlock language="vue" :code="customRatingComponentCode" />
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            The component is wrapped by BaseField which handles label, error messages, help text, and tooltip automatically. You only render the interactive input.
          </p>
        </DocSection>

        <!-- ─── CUSTOM RULES ─────────────────────────────── -->
        <DocSection id="custom-rules" title="Custom Validation Rules" description="Register custom validation rules globally.">
          <DocCodeBlock language="typescript" code="import { registerRule } from '@formatica/vue'

// Sync rule
registerRule('postalCode', (value) => {
  if (!value) return true  // don't validate empty (use 'required' for that)
  const str = String(value)
  return /^\d{4}\s?[A-Za-z]{2}$/.test(str) || 'Enter a valid Dutch postal code (e.g. 1234 AB)'
})

// Async rule (e.g. check server)
registerRule('uniqueEmail', async (value) => {
  if (!value) return true
  const res = await fetch('/api/check-email?email=' + value)
  const data = await res.json()
  return data.available || 'This email is already registered'
})

// Use in schema:
{ type: 'text', name: 'zip', label: 'Postal code', rules: ['required', 'postalCode'] }
{ type: 'text', name: 'email', label: 'Email', rules: ['required', 'email', 'uniqueEmail'] }" />
        </DocSection>

        <!-- ─── THEMING ──────────────────────────────────── -->
        <DocSection id="theming" title="Theming" description="Pass a theme config to customize colors, spacing, and component classes.">
          <DocCodeBlock language="vue" :code="themingCode" />
          <p class="mt-3 text-xs text-gray-500 dark:text-gray-400">
            Formatica uses Tailwind CSS classes. Your Tailwind config must include the library's dist files in <code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">content</code> to scan for classes:
          </p>
          <DocCodeBlock language="typescript" code="// tailwind.config.ts
export default {
  content: [
    './src/**/*.{vue,ts}',
    './node_modules/@formatica/vue/dist/**/*.js',
  ],
}" />
        </DocSection>

        <div class="h-16" />
      </div>
    </div>
  </div>
</template>
