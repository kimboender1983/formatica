<script setup lang="ts">
    import type { FieldBase } from "@formatica/core";
    import { computed, inject, ref } from "vue";
    import { type FormI18nInstance, FormI18nKey } from "../core/useFormI18n";
    import { FormThemeKey, type ThemeInstance } from "../core/useTheme";

    const props = withDefaults(
        defineProps<{
            fieldSchema: FieldBase;
            fieldName: string;
            errors: string[];
            touched: boolean;
        }>(),
        {
            errors: () => [],
            touched: false,
        },
    );

    const i18n = inject<FormI18nInstance>(FormI18nKey);
    const theme = inject<ThemeInstance>(FormThemeKey);

    const showTooltip = ref(false);

    const label = computed(() => {
        if (i18n) {
            const translated = i18n.t(props.fieldName, "label");
            if (translated) return translated;
        }
        return props.fieldSchema.label ?? props.fieldName;
    });

    const helpText = computed(() => {
        if (i18n) {
            const translated = i18n.t(props.fieldName, "helpText");
            if (translated) return translated;
        }
        return props.fieldSchema.helpText ?? "";
    });

    const tooltip = computed(() => {
        if (i18n) {
            const translated = i18n.t(props.fieldName, "tooltip");
            if (translated) return translated;
        }
        return props.fieldSchema.tooltip ?? "";
    });

    const hasErrors = computed(() => props.touched && props.errors.length > 0);

    const wrapperClasses = computed(() => [
        theme?.classes.value.field ?? "fc-field",
        props.fieldSchema.className ?? "",
        props.fieldSchema.disabled ? "opacity-50 cursor-not-allowed" : "",
        props.fieldSchema.readOnly ? "fc-readonly" : "",
    ]);

    const fieldId = computed(() => `fc-field-${props.fieldName}`);
    const errorId = computed(() => `fc-error-${props.fieldName}`);
</script>

<template>
  <div
    :class="wrapperClasses"
    :style="fieldSchema.style"
    class="relative mb-4"
  >
    <!-- Label row -->
    <div
      v-if="fieldSchema.type !== 'hidden'"
      class="mb-1.5 flex items-center gap-1"
    >
      <label
        :for="fieldId"
        :class="theme?.classes.value.label ?? 'fc-label'"
        class="block text-sm font-medium text-gray-700"
      >
        {{ label }}
        <span
          v-if="fieldSchema.required"
          class="text-red-500 ml-0.5"
          aria-hidden="true"
        >*</span>
      </label>

      <!-- Tooltip icon -->
      <span
        v-if="tooltip"
        class="relative inline-flex"
        @mouseenter="showTooltip = true"
        @mouseleave="showTooltip = false"
        @focusin="showTooltip = true"
        @focusout="showTooltip = false"
      >
        <button
          type="button"
          class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          :aria-label="`Info: ${tooltip}`"
          tabindex="0"
        >
          i
        </button>
        <Transition
          enter-active-class="motion-safe:transition motion-safe:duration-200 motion-safe:ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="motion-safe:transition motion-safe:duration-150 motion-safe:ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="showTooltip"
            role="tooltip"
            class="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg whitespace-nowrap"
          >
            {{ tooltip }}
            <div class="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </Transition>
      </span>
    </div>

    <!-- Input slot -->
    <div :id="fieldId">
      <slot />
    </div>

    <!-- Error messages -->
    <TransitionGroup
      tag="div"
      enter-active-class="motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out"
      enter-from-class="opacity-0 -translate-y-1 max-h-0"
      enter-to-class="opacity-100 translate-y-0 max-h-8"
      leave-active-class="motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-in"
      leave-from-class="opacity-100 translate-y-0 max-h-8"
      leave-to-class="opacity-0 -translate-y-1 max-h-0"
      class=""
    >
      <p
        v-for="(error, idx) in (hasErrors ? errors : [])"
        :key="error + idx"
        :id="idx === 0 ? errorId : undefined"
        :class="theme?.classes.value.error ?? 'fc-error'"
        class="mt-1 text-xs text-red-500"
        role="alert"
      >
        {{ error }}
      </p>
    </TransitionGroup>

    <!-- Help text -->
    <p
      v-if="helpText && !hasErrors"
      :class="theme?.classes.value.helpText ?? 'fc-help-text'"
      class="mt-1 text-xs text-gray-400"
    >
      {{ helpText }}
    </p>
  </div>
</template>
