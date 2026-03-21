<script setup lang="ts">
    import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
    import { useThemeClasses } from "../../core/useTheme";
    import type { OptionItem } from "../../types/schema";

    type SelectValue = string | number | boolean | Array<string | number | boolean> | null;

    const props = withDefaults(
        defineProps<{
            modelValue: SelectValue;
            options: OptionItem[];
            multiple?: boolean;
            searchable?: boolean;
            clearable?: boolean;
            placeholder?: string;
            disabled?: boolean;
        }>(),
        {
            multiple: false,
            searchable: false,
            clearable: false,
            placeholder: "Select...",
            disabled: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: SelectValue];
        blur: [event: FocusEvent];
    }>();

    const theme = useThemeClasses();

    const isOpen = ref(false);
    const search = ref("");
    const highlightedIndex = ref(-1);
    const containerRef = ref<HTMLDivElement | null>(null);
    const searchInputRef = ref<HTMLInputElement | null>(null);

    const selectedValues = computed<Array<string | number | boolean>>(() => {
        if (props.modelValue === null || props.modelValue === undefined) return [];
        if (Array.isArray(props.modelValue)) return props.modelValue;
        return [props.modelValue];
    });

    const displayLabel = computed(() => {
        if (selectedValues.value.length === 0) return "";
        if (props.multiple) return "";
        const opt = props.options.find((o) => o.value === selectedValues.value[0]);
        return opt?.label ?? String(selectedValues.value[0]);
    });

    const filteredOptions = computed(() => {
        if (!search.value) return props.options;
        const q = search.value.toLowerCase();
        return props.options.filter((o) => o.label.toLowerCase().includes(q));
    });

    function isSelected(value: string | number | boolean): boolean {
        return selectedValues.value.includes(value);
    }

    function toggle() {
        if (props.disabled) return;
        isOpen.value ? close() : open();
    }

    function open() {
        isOpen.value = true;
        highlightedIndex.value = -1;
        search.value = "";
        nextTick(() => searchInputRef.value?.focus());
    }

    function close() {
        isOpen.value = false;
        search.value = "";
    }

    function selectOption(option: OptionItem) {
        if (option.disabled) return;
        if (props.multiple) {
            const arr = [...selectedValues.value];
            const idx = arr.indexOf(option.value);
            if (idx >= 0) arr.splice(idx, 1);
            else arr.push(option.value);
            emit("update:modelValue", arr);
        } else {
            emit("update:modelValue", option.value);
            close();
        }
    }

    function removeTag(value: string | number | boolean) {
        if (props.disabled) return;
        const arr = selectedValues.value.filter((v) => v !== value);
        emit("update:modelValue", arr.length ? arr : props.multiple ? [] : null);
    }

    function clear(event: MouseEvent) {
        event.stopPropagation();
        emit("update:modelValue", props.multiple ? [] : null);
    }

    function onKeydown(event: KeyboardEvent) {
        if (!isOpen.value) {
            if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
                event.preventDefault();
                open();
            }
            return;
        }
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                highlightedIndex.value = Math.min(
                    highlightedIndex.value + 1,
                    filteredOptions.value.length - 1,
                );
                break;
            case "ArrowUp":
                event.preventDefault();
                highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
                break;
            case "Enter":
                event.preventDefault();
                if (highlightedIndex.value >= 0 && filteredOptions.value[highlightedIndex.value]) {
                    selectOption(filteredOptions.value[highlightedIndex.value]);
                }
                break;
            case "Escape":
                event.preventDefault();
                close();
                break;
        }
    }

    function onClickOutside(event: MouseEvent) {
        if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
            close();
        }
    }

    function tagLabel(value: string | number | boolean): string {
        const opt = props.options.find((o) => o.value === value);
        return opt?.label ?? String(value);
    }

    onMounted(() => document.addEventListener("mousedown", onClickOutside));
    onBeforeUnmount(() => document.removeEventListener("mousedown", onClickOutside));

    watch(isOpen, (val) => {
        if (!val) emit("blur", new FocusEvent("blur"));
    });
</script>

<template>
  <div
    ref="containerRef"
    :class="[
      'relative w-full',
      theme.classes.value.input,
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
  >
    <!-- Trigger -->
    <div
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      tabindex="0"
      :class="[
        'flex min-h-[38px] w-full cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm',
        'transition-colors duration-200',
        isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : '',
        disabled ? 'pointer-events-none bg-gray-100' : '',
      ]"
      @click="toggle"
      @keydown="onKeydown"
    >
      <div class="flex flex-1 flex-wrap items-center gap-1">
        <!-- Multiple tags -->
        <template v-if="multiple">
          <span
            v-for="val in selectedValues"
            :key="String(val)"
            class="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
          >
            {{ tagLabel(val) }}
            <button
              type="button"
              class="ml-0.5 text-blue-600 hover:text-blue-800"
              aria-label="Remove"
              @click.stop="removeTag(val)"
            >
              &times;
            </button>
          </span>
        </template>
        <!-- Single display -->
        <span v-else-if="displayLabel" class="truncate">{{ displayLabel }}</span>
        <!-- Placeholder -->
        <span v-else class="text-gray-400">{{ placeholder }}</span>
      </div>
      <!-- Clear button -->
      <button
        v-if="clearable && selectedValues.length > 0 && !disabled"
        type="button"
        class="ml-1 shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        aria-label="Clear selection"
        @click="clear"
      >
        &times;
      </button>
      <!-- Chevron -->
      <svg
        class="ml-1 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
    >
      <!-- Search -->
      <div v-if="searchable" class="border-b border-gray-200 p-2">
        <input
          ref="searchInputRef"
          v-model="search"
          type="text"
          class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Search..."
          @keydown="onKeydown"
        />
      </div>
      <!-- Options list -->
      <ul role="listbox" class="max-h-60 overflow-auto py-1">
        <li
          v-for="(option, idx) in filteredOptions"
          :key="String(option.value)"
          role="option"
          :aria-selected="isSelected(option.value)"
          :class="[
            'cursor-pointer px-3 py-2 text-sm transition-colors duration-200',
            isSelected(option.value) ? 'bg-blue-50 text-blue-700' : 'text-gray-900',
            highlightedIndex === idx ? 'bg-gray-100' : '',
            option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50',
          ]"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = idx"
        >
          {{ option.label }}
        </li>
        <li v-if="filteredOptions.length === 0" class="px-3 py-2 text-sm text-gray-400">
          No options found
        </li>
      </ul>
    </div>
  </div>
</template>
