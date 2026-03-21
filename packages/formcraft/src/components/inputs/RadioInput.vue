<script setup lang="ts">
    import { useThemeClasses } from "../../core/useTheme";
    import type { OptionItem } from "../../types/schema";

    const props = withDefaults(
        defineProps<{
            modelValue: string | number | boolean | null;
            options: OptionItem[];
            inline?: boolean;
            disabled?: boolean;
        }>(),
        {
            inline: false,
            disabled: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: string | number | boolean | null];
        blur: [event: FocusEvent];
    }>();

    useThemeClasses();

    function isSelected(value: string | number | boolean): boolean {
        return props.modelValue === value;
    }

    function isOptionDisabled(option: OptionItem): boolean {
        return props.disabled || !!option.disabled;
    }

    function selectOption(option: OptionItem) {
        if (isOptionDisabled(option)) return;
        emit("update:modelValue", option.value);
    }

    function onKeydown(event: KeyboardEvent, option: OptionItem) {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            selectOption(option);
        }
    }
</script>

<template>
  <div
    role="radiogroup"
    :class="inline ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2'"
  >
    <label
      v-for="option in options"
      :key="String(option.value)"
      :class="[
        'inline-flex items-center gap-2 select-none',
        isOptionDisabled(option) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]"
    >
      <input
        type="radio"
        :checked="isSelected(option.value)"
        :disabled="isOptionDisabled(option)"
        class="sr-only"
        @change="selectOption(option)"
        @blur="emit('blur', $event)"
      />
      <div
        role="radio"
        :aria-checked="isSelected(option.value)"
        :aria-disabled="isOptionDisabled(option) || undefined"
        tabindex="0"
        :class="[
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
          isSelected(option.value)
            ? 'border-blue-500'
            : 'border-gray-300',
        ]"
        @click="selectOption(option)"
        @keydown="onKeydown($event, option)"
      >
        <div
          v-if="isSelected(option.value)"
          class="h-2.5 w-2.5 rounded-full bg-blue-500"
        />
      </div>
      <span class="text-sm text-gray-700">{{ option.label }}</span>
    </label>
  </div>
</template>
