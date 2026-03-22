<script setup lang="ts">
    import { computed, ref } from "vue";
    import { useThemeClasses } from "../../core/useTheme";

    const props = withDefaults(
        defineProps<{
            modelValue: number;
            min?: number;
            max?: number;
            step?: number;
            showTooltip?: boolean;
            disabled?: boolean;
        }>(),
        {
            min: 0,
            max: 100,
            step: 1,
            showTooltip: true,
            disabled: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: number];
        blur: [event: FocusEvent];
    }>();

    useThemeClasses();

    const isActive = ref(false);

    const percentage = computed(() => {
        const range = props.max - props.min;
        if (range === 0) return 0;
        return ((props.modelValue - props.min) / range) * 100;
    });

    function onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        emit("update:modelValue", parseFloat(target.value));
    }
</script>

<template>
  <div
    :class="[
      'relative w-full py-2',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
  >
    <!-- Tooltip -->
    <div
      v-if="showTooltip && isActive"
      class="absolute -top-8 rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-sm transition-opacity duration-200"
      :style="{ left: `calc(${percentage}% - 16px)` }"
    >
      {{ modelValue }}
    </div>
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      :aria-valuenow="modelValue"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-disabled="disabled || undefined"
      class="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:pointer-events-none"
      :style="{ accentColor: 'var(--fc-color-primary, #3b82f6)' }"
      @input="onInput"
      @mousedown="isActive = true"
      @mouseup="isActive = false"
      @touchstart="isActive = true"
      @touchend="isActive = false"
      @focus="isActive = true"
      @blur="isActive = false; emit('blur', $event)"
    />
    <!-- Min/Max labels -->
    <div class="mt-1 flex justify-between text-xs text-gray-400">
      <span>{{ min }}</span>
      <span>{{ max }}</span>
    </div>
  </div>
</template>
