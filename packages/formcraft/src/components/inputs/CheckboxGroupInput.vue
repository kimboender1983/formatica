<script setup lang="ts">
    import { computed } from "vue";
    import { useThemeClasses } from "../../core/useTheme";
    import type { OptionItem } from "../../types/schema";

    const props = withDefaults(
        defineProps<{
            modelValue: Array<string | number | boolean>;
            options: OptionItem[];
            inline?: boolean;
            disabled?: boolean;
            minSelect?: number;
            maxSelect?: number;
        }>(),
        {
            inline: false,
            disabled: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: Array<string | number | boolean>];
        blur: [event: FocusEvent];
    }>();

    useThemeClasses();

    function isChecked(value: string | number | boolean): boolean {
        return props.modelValue.includes(value);
    }

    function isOptionDisabled(option: OptionItem): boolean {
        if (props.disabled || option.disabled) return true;
        // Enforce maxSelect: disable unchecked options when at max
        if (
            props.maxSelect &&
            !isChecked(option.value) &&
            props.modelValue.length >= props.maxSelect
        ) {
            return true;
        }
        return false;
    }

    function toggleOption(option: OptionItem) {
        if (isOptionDisabled(option)) return;
        const arr = [...props.modelValue];
        const idx = arr.indexOf(option.value);
        if (idx >= 0) {
            // Enforce minSelect: do not remove if at minimum
            if (props.minSelect && arr.length <= props.minSelect) return;
            arr.splice(idx, 1);
        } else {
            arr.push(option.value);
        }
        emit("update:modelValue", arr);
    }

    function onKeydown(event: KeyboardEvent, option: OptionItem) {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            toggleOption(option);
        }
    }
</script>

<template>
  <div
    role="group"
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
        type="checkbox"
        :checked="isChecked(option.value)"
        :disabled="isOptionDisabled(option)"
        class="sr-only"
        @change="toggleOption(option)"
        @blur="emit('blur', $event)"
      />
      <div
        role="checkbox"
        :aria-checked="isChecked(option.value)"
        :aria-disabled="isOptionDisabled(option) || undefined"
        tabindex="0"
        :class="[
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-200',
          isChecked(option.value)
            ? 'text-white'
            : 'border-gray-300 bg-white',
        ]"
        :style="isChecked(option.value) ? { borderColor: 'var(--fc-color-primary, #3b82f6)', backgroundColor: 'var(--fc-color-primary, #3b82f6)' } : {}"
        @click="toggleOption(option)"
        @keydown="onKeydown($event, option)"
      >
        <svg
          v-if="isChecked(option.value)"
          class="h-3 w-3"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M2 6l3 3 5-5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <span class="text-sm text-gray-700">{{ option.label }}</span>
    </label>
  </div>
</template>
