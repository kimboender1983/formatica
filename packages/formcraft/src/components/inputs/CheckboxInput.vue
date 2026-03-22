<script setup lang="ts">
    import { computed } from "vue";
    import { useThemeClasses } from "../../core/useTheme";

    const props = withDefaults(
        defineProps<{
            modelValue: boolean;
            checkboxLabel?: string;
            disabled?: boolean;
        }>(),
        {
            disabled: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: boolean];
        blur: [event: FocusEvent];
    }>();

    useThemeClasses();

    const wrapperClasses = computed(() => [
        "inline-flex items-center gap-2 select-none",
        props.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    ]);

    function toggle() {
        if (props.disabled) return;
        emit("update:modelValue", !props.modelValue);
    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            toggle();
        }
    }
</script>

<template>
  <label :class="wrapperClasses">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="sr-only"
      @change="toggle"
      @blur="emit('blur', $event)"
    />
    <div
      role="checkbox"
      :aria-checked="modelValue"
      :aria-disabled="disabled || undefined"
      tabindex="0"
      :class="[
        'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-200',
        modelValue
          ? 'text-white'
          : 'border-gray-300 bg-white',
      ]"
      :style="modelValue ? { borderColor: 'var(--fc-color-primary, #3b82f6)', backgroundColor: 'var(--fc-color-primary, #3b82f6)' } : {}"
      @click="toggle"
      @keydown="onKeydown"
    >
      <svg
        v-if="modelValue"
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
    <span v-if="checkboxLabel" class="text-sm text-gray-700">{{ checkboxLabel }}</span>
  </label>
</template>
