<script setup lang="ts">
    import { computed } from "vue";
    import { useThemeClasses } from "../../core/useTheme";

    const props = withDefaults(
        defineProps<{
            modelValue: string;
            format?: string;
            minDate?: string;
            maxDate?: string;
            placeholder?: string;
            disabled?: boolean;
        }>(),
        {
            placeholder: "",
            disabled: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: string];
        blur: [event: FocusEvent];
        focus: [event: FocusEvent];
    }>();

    const theme = useThemeClasses();

    const baseClasses = computed(() =>
        [
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 fc-date-input",
            "transition-colors duration-200",
            props.disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "",
            theme.classes.value.input,
        ]
            .filter(Boolean)
            .join(" "),
    );

    function onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        emit("update:modelValue", target.value);
    }
</script>

<template>
  <input
    type="date"
    :value="modelValue"
    :min="minDate"
    :max="maxDate"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="baseClasses"
    :aria-disabled="disabled || undefined"
    @input="onInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>

<style scoped>
.fc-date-input:focus {
  border-color: var(--fc-color-primary, #3b82f6);
}
</style>
