<script setup lang="ts">
    import { computed } from "vue";
    import { useThemeClasses } from "../../core/useTheme";

    const props = withDefaults(
        defineProps<{
            modelValue: boolean;
            activeLabel?: string;
            inactiveLabel?: string;
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
    <span v-if="inactiveLabel" class="text-sm text-gray-600">{{ inactiveLabel }}</span>
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="sr-only"
      @change="toggle"
      @blur="emit('blur', $event)"
    />
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-disabled="disabled || undefined"
      tabindex="0"
      :class="[
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        !modelValue ? 'bg-gray-300' : '',
        disabled ? 'pointer-events-none' : 'focus:outline-none focus:ring-2 focus:ring-blue-500/20',
      ]"
      :style="modelValue ? { backgroundColor: 'var(--fc-color-primary, #3b82f6)' } : {}"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          modelValue ? 'translate-x-5' : 'translate-x-0',
        ]"
        aria-hidden="true"
      />
    </button>
    <span v-if="activeLabel" class="text-sm text-gray-600">{{ activeLabel }}</span>
  </label>
</template>
