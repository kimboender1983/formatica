<script setup lang="ts">
    import { computed } from "vue";
    import { useThemeClasses } from "../../core/useTheme";

    const props = withDefaults(
        defineProps<{
            modelValue: number | null;
            min?: number;
            max?: number;
            step?: number;
            precision?: number;
            prefix?: string;
            suffix?: string;
            disabled?: boolean;
            readonly?: boolean;
        }>(),
        {
            step: 1,
            disabled: false,
            readonly: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: number | null];
        blur: [event: FocusEvent];
        focus: [event: FocusEvent];
    }>();

    const theme = useThemeClasses();

    const hasAddons = computed(() => !!props.prefix || !!props.suffix);

    const baseClasses = computed(() =>
        [
            "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 fc-number-input",
            "transition-colors duration-200",
            props.disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "",
            props.prefix ? "rounded-l-none" : "",
            props.suffix ? "rounded-r-none" : "",
            theme.classes.value.input,
        ]
            .filter(Boolean)
            .join(" "),
    );

    function onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        const raw = target.value;
        if (raw === "") {
            emit("update:modelValue", null);
            return;
        }
        let num = parseFloat(raw);
        if (Number.isNaN(num)) return;
        if (props.precision !== undefined) {
            num = parseFloat(num.toFixed(props.precision));
        }
        emit("update:modelValue", num);
    }
</script>

<template>
  <div v-if="hasAddons" class="flex items-stretch">
    <span
      v-if="prefix"
      class="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500"
    >
      {{ prefix }}
    </span>
    <input
      type="number"
      :value="modelValue ?? ''"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :readonly="readonly"
      :class="baseClasses"
      :aria-disabled="disabled || undefined"
      :aria-readonly="readonly || undefined"
      @input="onInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    <span
      v-if="suffix"
      class="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500"
    >
      {{ suffix }}
    </span>
  </div>
  <input
    v-else
    type="number"
    :value="modelValue ?? ''"
    :min="min"
    :max="max"
    :step="step"
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
.fc-number-input:focus {
  border-color: var(--fc-color-primary, #3b82f6);
}
</style>
