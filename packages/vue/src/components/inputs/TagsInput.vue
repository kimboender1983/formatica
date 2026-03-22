<script setup lang="ts">
    import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
    import { useThemeClasses } from "../../core/useTheme";

    const props = withDefaults(
        defineProps<{
            modelValue: string[] | null;
            maxTags?: number;
            suggestions?: string[];
            placeholder?: string;
            disabled?: boolean;
        }>(),
        {
            modelValue: () => [],
            suggestions: () => [],
            placeholder: "Add a tag...",
            disabled: false,
        },
    );

    const tags = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []));

    const emit = defineEmits<{
        "update:modelValue": [value: string[]];
        blur: [event: FocusEvent];
    }>();

    const theme = useThemeClasses();

    const inputValue = ref("");
    const isFocused = ref(false);
    const showSuggestions = ref(false);
    const highlightedIndex = ref(-1);
    const containerRef = ref<HTMLDivElement | null>(null);
    const inputRef = ref<HTMLInputElement | null>(null);

    const canAdd = computed(() => !props.maxTags || tags.value.length < props.maxTags);

    const filteredSuggestions = computed(() => {
        if (!inputValue.value || props.suggestions.length === 0) return [];
        const q = inputValue.value.toLowerCase();
        return props.suggestions.filter(
            (s) => s.toLowerCase().includes(q) && !tags.value.includes(s),
        );
    });

    function addTag(tag: string) {
        const trimmed = tag.trim();
        if (!trimmed || !canAdd.value || tags.value.includes(trimmed)) return;
        emit("update:modelValue", [...tags.value, trimmed]);
        inputValue.value = "";
        showSuggestions.value = false;
        highlightedIndex.value = -1;
    }

    function removeTag(index: number) {
        if (props.disabled) return;
        const updated = tags.value.filter((_, i) => i !== index);
        emit("update:modelValue", updated);
    }

    function onKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            const suggestion =
                highlightedIndex.value >= 0
                    ? filteredSuggestions.value[highlightedIndex.value]
                    : undefined;
            if (suggestion) {
                addTag(suggestion);
            } else {
                addTag(inputValue.value);
            }
            return;
        }
        if (event.key === "Backspace" && inputValue.value === "" && tags.value.length > 0) {
            removeTag(tags.value.length - 1);
            return;
        }
        if (event.key === "ArrowDown" && showSuggestions.value) {
            event.preventDefault();
            highlightedIndex.value = Math.min(
                highlightedIndex.value + 1,
                filteredSuggestions.value.length - 1,
            );
            return;
        }
        if (event.key === "ArrowUp" && showSuggestions.value) {
            event.preventDefault();
            highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
            return;
        }
        if (event.key === "Escape") {
            showSuggestions.value = false;
            highlightedIndex.value = -1;
        }
    }

    function onInput() {
        showSuggestions.value = inputValue.value.length > 0 && filteredSuggestions.value.length > 0;
        highlightedIndex.value = -1;
    }

    function onClickOutside(event: MouseEvent) {
        if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
            showSuggestions.value = false;
        }
    }

    onMounted(() => document.addEventListener("mousedown", onClickOutside));
    onBeforeUnmount(() => document.removeEventListener("mousedown", onClickOutside));

    watch(inputValue, () => {
        nextTick(onInput);
    });
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'relative w-full',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
  >
    <div
      :class="[
        'flex flex-wrap items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 text-sm transition-colors duration-200',
        !isFocused ? 'border-gray-300' : 'ring-2 ring-blue-500/20',
        theme.classes.value.input,
      ]"
      :style="isFocused ? { borderColor: 'var(--fc-color-primary, #3b82f6)' } : {}"
      @click="inputRef?.focus()"
    >
      <!-- Tags -->
      <span
        v-for="(tag, idx) in tags"
        :key="tag"
        class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs"
        :style="{ backgroundColor: 'color-mix(in srgb, var(--fc-color-primary, #3b82f6) 15%, white)', color: 'var(--fc-color-primary, #3b82f6)' }"
      >
        {{ tag }}
        <button
          v-if="!disabled"
          type="button"
          class="ml-0.5 transition-colors duration-200"
          :style="{ color: 'var(--fc-color-primary, #3b82f6)' }"
          aria-label="Remove tag"
          @click.stop="removeTag(idx)"
        >
          &times;
        </button>
      </span>
      <!-- Input -->
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="tags.length === 0 ? placeholder : ''"
        :disabled="disabled"
        class="min-w-[80px] flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-gray-400"
        @keydown="onKeydown"
        @focus="isFocused = true"
        @blur="isFocused = false; emit('blur', $event)"
      />
    </div>

    <!-- Suggestions dropdown -->
    <ul
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg"
      role="listbox"
    >
      <li
        v-for="(suggestion, idx) in filteredSuggestions"
        :key="suggestion"
        role="option"
        :aria-selected="highlightedIndex === idx"
        :class="[
          'cursor-pointer px-3 py-2 text-sm transition-colors duration-200',
          highlightedIndex !== idx ? 'text-gray-900 hover:bg-gray-50' : '',
        ]"
        :style="highlightedIndex === idx ? { backgroundColor: 'color-mix(in srgb, var(--fc-color-primary, #3b82f6) 8%, white)', color: 'var(--fc-color-primary, #3b82f6)' } : {}"
        @mousedown.prevent="addTag(suggestion)"
        @mouseenter="highlightedIndex = idx"
      >
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>
