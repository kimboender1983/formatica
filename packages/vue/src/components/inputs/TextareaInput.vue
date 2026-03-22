<script setup lang="ts">
    import { computed, nextTick, onMounted, ref, watch } from "vue";
    import { useThemeClasses } from "../../core/useTheme";

    const props = withDefaults(
        defineProps<{
            modelValue: string;
            rows?: number;
            autoResize?: boolean;
            maxLength?: number;
            placeholder?: string;
            disabled?: boolean;
            readonly?: boolean;
        }>(),
        {
            rows: 3,
            autoResize: false,
            placeholder: "",
            disabled: false,
            readonly: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: string];
        blur: [event: FocusEvent];
        focus: [event: FocusEvent];
    }>();

    const theme = useThemeClasses();
    const textareaRef = ref<HTMLTextAreaElement | null>(null);

    const baseClasses = computed(() =>
        [
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400 resize-y",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 fc-textarea-input",
            "transition-colors duration-200",
            props.disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "",
            props.autoResize ? "resize-none overflow-hidden" : "",
            theme.classes.value.input,
        ]
            .filter(Boolean)
            .join(" "),
    );

    function adjustHeight() {
        if (!props.autoResize || !textareaRef.value) return;
        const el = textareaRef.value;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }

    function onInput(event: Event) {
        const target = event.target as HTMLTextAreaElement;
        emit("update:modelValue", target.value);
        if (props.autoResize) nextTick(adjustHeight);
    }

    watch(
        () => props.modelValue,
        () => {
            if (props.autoResize) nextTick(adjustHeight);
        },
    );

    onMounted(() => {
        if (props.autoResize) adjustHeight();
    });
</script>

<template>
  <textarea
    ref="textareaRef"
    :value="modelValue"
    :rows="rows"
    :maxlength="maxLength"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :class="baseClasses"
    :aria-disabled="disabled || undefined"
    :aria-readonly="readonly || undefined"
    @input="onInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>

<style scoped>
.fc-textarea-input:focus {
  border-color: var(--fc-color-primary, #3b82f6);
}
</style>
