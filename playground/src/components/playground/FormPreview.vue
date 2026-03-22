<script setup lang="ts">
    import type { FormSchema, ThemeConfig } from "@formatica/vue";
    import { extractFields, type FormBuilder } from "@formatica/vue";
    import { computed, ref, watch } from "vue";

    const props = withDefaults(
        defineProps<{
            schema: FormSchema;
            locale?: string;
            theme?: ThemeConfig;
        }>(),
        {
            locale: "en",
        },
    );

    const emit = defineEmits<{
        submit: [values: Record<string, unknown>];
        "locale-change": [locale: string];
        "form-state": [
            state: {
                values: Record<string, unknown>;
                errors: Record<string, string[]>;
                touched: Record<string, boolean>;
                dirty: Record<string, boolean>;
                isValid: boolean;
                isDirty: boolean;
                isSubmitting: boolean;
                submitCount: number;
            },
        ];
    }>();

    const formKey = ref(0);
    const localeDropdownOpen = ref(false);
    const formBuilderRef = ref<InstanceType<typeof FormBuilder> | null>(null);

    const availableLocales = computed(() => {
        const locales = new Set<string>(["en"]);
        const translations = props.schema.translations;
        if (translations) {
            for (const locale of Object.keys(translations)) {
                locales.add(locale);
            }
        }
        for (const field of extractFields(props.schema.fields)) {
            if (field.translations) {
                for (const locale of Object.keys(field.translations)) {
                    locales.add(locale);
                }
            }
        }
        return Array.from(locales).sort();
    });

    function resetForm() {
        formKey.value++;
    }

    function handleSubmit(values: Record<string, unknown>) {
        emit("submit", values);
        emitFormState();
    }

    function selectLocale(locale: string) {
        emit("locale-change", locale);
        localeDropdownOpen.value = false;
    }

    watch(
        () => props.schema.id,
        () => {
            formKey.value++;
        },
    );

    // Emit form state on modelValue changes
    function onModelUpdate(values: Record<string, unknown>) {
        emitFormState();
    }

    function emitFormState() {
        const form = formBuilderRef.value?.form;
        if (!form) return;
        emit("form-state", {
            values: { ...form.values },
            errors: { ...form.errors },
            touched: { ...form.touched },
            dirty: { ...form.dirty },
            isValid: form.isValid.value,
            isDirty: form.isDirty.value,
            isSubmitting: form.isSubmitting.value,
            submitCount: form.submitCount.value,
        });
    }

    // Poll form state periodically to catch blur/validation changes
    // (since we can't easily watch the internal form instance from outside)
    let stateInterval: ReturnType<typeof setInterval> | null = null;

    import { onMounted, onUnmounted } from "vue";

    onMounted(() => {
        stateInterval = setInterval(emitFormState, 200);
    });
    onUnmounted(() => {
        if (stateInterval) clearInterval(stateInterval);
    });
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Header -->
    <div
      class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5"
    >
      <span class="mr-auto text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Preview
      </span>

      <div class="flex items-center gap-1">
        <!-- Locale dropdown -->
        <div v-if="availableLocales.length > 1" class="relative">
          <button
            @click="localeDropdownOpen = !localeDropdownOpen"
            class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {{ locale.toUpperCase() }}
          </button>
          <div
            v-if="localeDropdownOpen"
            class="absolute right-0 top-full z-10 mt-1 min-w-[80px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg"
          >
            <button
              v-for="loc in availableLocales"
              :key="loc"
              @click="selectLocale(loc)"
              :class="[
                'block w-full px-3 py-1.5 text-left text-xs font-medium transition-colors',
                loc === locale
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
              ]"
            >
              {{ loc.toUpperCase() }}
            </button>
          </div>
        </div>

        <!-- Reset form -->
        <button
          @click="resetForm"
          class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Reset form"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Reset
        </button>
      </div>
    </div>

    <!-- Form preview area -->
    <div class="flex-1 overflow-y-auto scrollbar-thin bg-white dark:bg-gray-900 p-6">
      <div class="mx-auto max-w-2xl">
        <FormBuilder
          ref="formBuilderRef"
          :key="formKey"
          :schema="schema"
          :locale="locale"
          :theme="theme"
          @submit="handleSubmit"
          @update:model-value="onModelUpdate"
        />
      </div>
    </div>
  </div>
</template>
