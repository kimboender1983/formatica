<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // DocsPage – Single-page API reference with sidebar navigation
    // ---------------------------------------------------------------------------

    import { onMounted, onUnmounted, ref } from "vue";
    import DocCodeBlock from "../components/docs/DocCodeBlock.vue";
    import DocFieldTypes from "../components/docs/DocFieldTypes.vue";
    import DocPropsTable from "../components/docs/DocPropsTable.vue";
    import DocSection from "../components/docs/DocSection.vue";

    // ---------------------------------------------------------------------------
    // Sidebar sections
    // ---------------------------------------------------------------------------

    const sections = [
        { id: "installation", label: "Installation" },
        { id: "quick-start", label: "Quick Start" },
        { id: "use-form", label: "useForm()" },
        { id: "form-builder-props", label: "FormBuilder Props" },
        { id: "schema-types", label: "Schema Types" },
        { id: "field-types", label: "Field Types" },
        { id: "validation", label: "Validation Rules" },
        { id: "layout-types", label: "Layout Types" },
        { id: "i18n", label: "i18n" },
        { id: "theming", label: "Theming" },
        { id: "custom-fields", label: "Custom Field Types" },
        { id: "custom-rules", label: "Custom Rules" },
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
        sections.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer?.observe(el);
        });
    });

    onUnmounted(() => {
        observer?.disconnect();
    });

    // ---------------------------------------------------------------------------
    // Static data for tables
    // ---------------------------------------------------------------------------

    const formBuilderProps = [
        { name: "schema", type: "FormSchema", def: "-", desc: "Form schema definition (required)" },
        {
            name: "layout",
            type: "LayoutSchema",
            def: "undefined",
            desc: "Optional layout configuration",
        },
        {
            name: "initialValues",
            type: "Record<string, unknown>",
            def: "{}",
            desc: "Initial form values",
        },
        { name: "locale", type: "string", def: '"en"', desc: "Active locale for i18n" },
        { name: "theme", type: "ThemeConfig", def: "undefined", desc: "Theme configuration" },
        { name: "disabled", type: "boolean", def: "false", desc: "Disable entire form" },
        { name: "readOnly", type: "boolean", def: "false", desc: "Make entire form read-only" },
    ];

    const validationRules = [
        { name: "required", desc: "Field must not be empty" },
        { name: "email", desc: "Must be a valid email address" },
        { name: "url", desc: "Must be a valid URL" },
        { name: "numeric", desc: "Must be a number" },
        { name: "min:n", desc: "Minimum numeric value" },
        { name: "max:n", desc: "Maximum numeric value" },
        { name: "minLength:n", desc: "Minimum string length" },
        { name: "maxLength:n", desc: "Maximum string length" },
        { name: "pattern:regex", desc: "Must match regular expression" },
    ];
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
      <div class="mx-auto max-w-3xl space-y-12">
        <div>
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Documentation</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Complete API reference for FormCraft.</p>
        </div>

        <DocSection id="installation" title="Installation" description="Install FormCraft via your preferred package manager.">
          <DocCodeBlock language="bash" code="npm install @formcraft/vue
# or: pnpm add @formcraft/vue" />
        </DocSection>

        <DocSection id="quick-start" title="Quick Start" description="Get a form up and running in under a minute.">
          <DocCodeBlock language="vue" :code="`<script setup lang='ts'>
import { FormBuilder } from '@formcraft/vue'
import type { FormSchema } from '@formcraft/vue'

const schema: FormSchema = {
  fields: [
    { type: 'text', name: 'email', label: 'Email', rules: 'required|email' },
    { type: 'text', name: 'name', label: 'Name', rules: 'required' },
  ],
}

function onSubmit(values: Record<string, unknown>) {
  console.log('Submitted:', values)
}
<\/script>

<template>
  <FormBuilder :schema='schema' @submit='onSubmit' />
</template>`" />
        </DocSection>

        <DocSection id="use-form" title="useForm()" description="The core composable for managing form state, validation, and submission.">
          <DocCodeBlock language="typescript" code="const {
  values,        // Reactive form values
  errors,        // Record<string, string[]>
  touched,       // Record<string, boolean>
  dirty,         // Record<string, boolean>
  isValid,       // Computed<boolean>
  isDirty,       // Computed<boolean>
  isSubmitting,  // Ref<boolean>
  submitCount,   // Ref<number>
  setFieldValue, // (name: string, value: unknown) => void
  validate,      // () => Promise<boolean>
  handleSubmit,  // (handler: SubmitHandler) => Promise<void>
  reset,         // () => void
} = useForm(options)" />
        </DocSection>

        <DocSection id="form-builder-props" title="FormBuilder Props" description="The FormBuilder component accepts the following props.">
          <DocPropsTable :columns="['Prop', 'Type', 'Default', 'Description']" :rows="formBuilderProps" />
        </DocSection>

        <DocSection id="schema-types" title="Schema Types" description="The core types that define a form schema.">
          <DocCodeBlock language="typescript" code="interface FormSchema {
  id?: string
  version?: string
  fields: FieldSchema[]
  settings?: FormSettings
  translations?: FormTranslations
}

interface FormSettings {
  layout?: 'vertical' | 'horizontal' | 'inline'
  labelPosition?: 'top' | 'left' | 'right'
  size?: 'small' | 'medium' | 'large'
  validateOnChange?: boolean
  validateOnBlur?: boolean
  scrollToError?: boolean
}" />
        </DocSection>

        <DocSection id="field-types" title="Field Types" description="All supported field types and their specific properties.">
          <DocFieldTypes />
        </DocSection>

        <DocSection id="validation" title="Validation Rules" description="Built-in validation rules via shorthand strings or rule objects.">
          <DocCodeBlock language="typescript" code="// Shorthand: 'required|email|minLength:3'
// Array:     ['required', 'email', 'minLength:3']
// Object:    { required: true, minLength: 3 }" />
          <div class="mt-4">
            <DocPropsTable :columns="['Rule', 'Description']" :rows="validationRules" />
          </div>
        </DocSection>

        <DocSection id="layout-types" title="Layout Types" description="Layout nodes control how fields are arranged.">
          <DocCodeBlock language="typescript" code="type LayoutNode =
  | FieldRef      // { type: 'field', name: string, span?: ColumnSpan }
  | RowLayout     // { type: 'row', columns: LayoutNode[], gap?: string }
  | GroupLayout   // { type: 'group', title?: string, children: LayoutNode[] }
  | StepsLayout   // { type: 'steps', steps: StepItem[], linear?: boolean }
  | TabsLayout    // { type: 'tabs', tabs: TabItem[] }
  | DividerLayout // { type: 'divider', label?: string }
  | HtmlLayout    // { type: 'html', content: string }" />
        </DocSection>

        <DocSection id="i18n" title="i18n" description="Per-field and form-level translations.">
          <DocCodeBlock language="typescript" code="const field = {
  type: 'text', name: 'email', label: 'Email',
  translations: {
    nl: { label: 'E-mail', placeholder: 'Voer e-mail in' },
    de: { label: 'E-Mail', placeholder: 'E-Mail eingeben' },
  },
}" />
        </DocSection>

        <DocSection id="theming" title="Theming" description="Customize the look and feel with theme tokens.">
          <DocCodeBlock language="typescript" code="const theme: ThemeConfig = {
  name: 'custom',
  colors: { primary: '#4f46e5', error: '#dc2626' },
  borders: { radius: '0.5rem' },
  spacing: { inputPaddingX: '0.75rem', inputPaddingY: '0.5rem' },
  components: { input: 'custom-input-class' },
  cssVars: { '--fc-accent': '#6366f1' },
}" />
        </DocSection>

        <DocSection id="custom-fields" title="Custom Field Types" description="Register custom Vue components as field types.">
          <DocCodeBlock language="typescript" code="import { registerFieldType } from '@formcraft/vue'
import MyRatingField from './MyRatingField.vue'

registerFieldType('rating', MyRatingField)

// Use in schema:
{ type: 'rating' as any, name: 'score', label: 'Rating' }" />
        </DocSection>

        <DocSection id="custom-rules" title="Custom Rules" description="Register custom validation rules.">
          <DocCodeBlock language="typescript" code="import { registerRule } from '@formcraft/vue'

registerRule('phone', {
  validate: (value: unknown) => {
    if (typeof value !== 'string') return false
    return /^\+?[\d\s-]{7,15}$/.test(value)
  },
  message: 'Please enter a valid phone number',
})

// Use: { rules: 'required|phone' }" />
        </DocSection>

        <div class="h-16" />
      </div>
    </div>
  </div>
</template>
