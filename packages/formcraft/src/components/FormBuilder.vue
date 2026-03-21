<script setup lang="ts">
    import { computed, onMounted, watch } from "vue";
    import { hasFieldType, registerFieldType } from "../core/fieldRegistry";
    import { useForm } from "../core/useForm";
    import { useFormI18nContext } from "../core/useFormI18n";
    import { useTheme, useThemeClasses } from "../core/useTheme";
    import type { LayoutSchema } from "../types/layout";
    import type { FormSchema, SchemaNode } from "../types/schema";
    import type { ThemeConfig } from "../types/theme";
    import CheckboxGroupInput from "./inputs/CheckboxGroupInput.vue";
    import CheckboxInput from "./inputs/CheckboxInput.vue";
    import DateInput from "./inputs/DateInput.vue";
    import FileInput from "./inputs/FileInput.vue";
    import NumberInput from "./inputs/NumberInput.vue";
    import PhoneInput from "./inputs/PhoneInput.vue";
    import RadioInput from "./inputs/RadioInput.vue";
    import SelectInput from "./inputs/SelectInput.vue";
    import SliderInput from "./inputs/SliderInput.vue";
    import SwitchInput from "./inputs/SwitchInput.vue";
    import TagsInput from "./inputs/TagsInput.vue";
    import TextareaInput from "./inputs/TextareaInput.vue";
    // Built-in input components
    import TextInput from "./inputs/TextInput.vue";
    import LayoutRenderer from "./layout/LayoutRenderer.vue";

    const props = withDefaults(
        defineProps<{
            schema: FormSchema;
            layout?: LayoutSchema;
            locale?: string;
            fallbackLocale?: string;
            modelValue?: Record<string, unknown>;
            theme?: ThemeConfig;
        }>(),
        {
            locale: "en",
            fallbackLocale: "en",
        },
    );

    const emit = defineEmits<{
        submit: [values: Record<string, unknown>];
        error: [error: unknown];
        "update:modelValue": [values: Record<string, unknown>];
    }>();

    // Register built-in field types (idempotent)
    const builtInTypes: [string, typeof TextInput][] = [
        ["text", TextInput],
        ["number", NumberInput],
        ["textarea", TextareaInput],
        ["select", SelectInput],
        ["checkbox", CheckboxInput],
        ["checkbox-group", CheckboxGroupInput],
        ["radio", RadioInput],
        ["switch", SwitchInput],
        ["date", DateInput],
        ["file", FileInput],
        ["slider", SliderInput],
        ["tags", TagsInput],
        ["phone", PhoneInput],
    ];

    for (const [type, component] of builtInTypes) {
        if (!hasFieldType(type)) {
            registerFieldType(type, component);
        }
    }

    // Initialize theme (provides FormThemeKey)
    useTheme(props.theme);
    const themeInstance = useThemeClasses();

    // Initialize form (provides FormContextKey and FormI18nKey)
    const form = useForm(props.schema, {
        locale: props.locale,
        fallbackLocale: props.fallbackLocale,
    });

    // Sync external modelValue into form
    if (props.modelValue) {
        for (const [key, value] of Object.entries(props.modelValue)) {
            form.setFieldValue(key, value);
        }
    }

    // Watch modelValue for external changes
    watch(
        () => props.modelValue,
        (newValues) => {
            if (!newValues) return;
            for (const [key, value] of Object.entries(newValues)) {
                if (form.values[key] !== value) {
                    form.setFieldValue(key, value);
                }
            }
        },
        { deep: true },
    );

    // Emit modelValue updates when form values change
    watch(
        () => ({ ...form.values }),
        (newValues) => {
            emit("update:modelValue", newValues);
        },
        { deep: true },
    );

    // Watch locale changes
    watch(
        () => props.locale,
        (newLocale) => {
            if (newLocale) form.setLocale(newLocale);
        },
    );

    // I18n for form-level translations
    const i18n = useFormI18nContext();

    const formTitle = computed(() => {
        const translations = props.schema.translations;
        if (!translations) return "";
        const loc = translations[props.locale];
        if (loc?.messages?.title) return loc.messages.title;
        const fb = translations[props.fallbackLocale];
        return fb?.messages?.title ?? "";
    });

    const formDescription = computed(() => {
        const translations = props.schema.translations;
        if (!translations) return "";
        const loc = translations[props.locale];
        if (loc?.messages?.description) return loc.messages.description;
        const fb = translations[props.fallbackLocale];
        return fb?.messages?.description ?? "";
    });

    const submitLabel = computed(() => {
        const translations = props.schema.translations;
        if (!translations) return "Submit";
        const loc = translations[props.locale];
        if (loc?.submit) return loc.submit;
        const fb = translations[props.fallbackLocale];
        return fb?.submit ?? "Submit";
    });

    const resetLabel = computed(() => {
        const translations = props.schema.translations;
        if (!translations) return "Reset";
        const loc = translations[props.locale];
        if (loc?.reset) return loc.reset;
        const fb = translations[props.fallbackLocale];
        return fb?.reset ?? "Reset";
    });

    // Resolve layout: schema.fields is the unified tree (fields + containers).
    // Fall back to layout prop for backwards compat.
    const layoutNodes = computed<SchemaNode[]>(() => {
        if (props.layout?.nodes?.length) {
            return props.layout.nodes as unknown as SchemaNode[];
        }
        return props.schema.fields;
    });

    async function onSubmit() {
        try {
            await form.submit(async (values) => {
                emit("submit", values);
            });
        } catch (error: unknown) {
            emit("error", error);
        }
    }

    function onReset() {
        form.reset();
    }
</script>

<template>
  <form
    :class="[themeInstance.classes.value.form, 'fc-form-builder']"
    :style="themeInstance.cssVars.value"
    novalidate
    @submit.prevent="onSubmit"
    @reset.prevent="onReset"
  >
    <!-- Form title / description -->
    <div v-if="formTitle || formDescription" class="mb-6">
      <h2
        v-if="formTitle"
        class="text-lg font-semibold text-gray-900"
      >
        {{ formTitle }}
      </h2>
      <p
        v-if="formDescription"
        class="mt-1 text-sm text-gray-500"
      >
        {{ formDescription }}
      </p>
    </div>

    <!-- Layout -->
    <LayoutRenderer :nodes="layoutNodes" />

    <!-- Actions -->
    <div class="mt-6 flex items-center gap-3">
      <button
        type="submit"
        :disabled="form.isSubmitting.value"
        :class="themeInstance.classes.value.button"
        class="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white motion-safe:transition-colors motion-safe:duration-150 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          v-if="form.isSubmitting.value"
          class="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
          aria-hidden="true"
        />
        {{ submitLabel }}
      </button>
      <button
        type="reset"
        :disabled="form.isSubmitting.value"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 motion-safe:transition-colors motion-safe:duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ resetLabel }}
      </button>
    </div>
  </form>
</template>
