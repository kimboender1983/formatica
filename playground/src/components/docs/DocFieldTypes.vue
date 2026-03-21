<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // DocFieldTypes – Field types reference list
    // ---------------------------------------------------------------------------

    const fieldTypes = [
        {
            type: "text",
            desc: "Single-line text input with optional mask, prefix/suffix",
            extra: "inputType, minLength, maxLength, pattern, mask, prefix, suffix",
        },
        {
            type: "number",
            desc: "Numeric input with min/max/step",
            extra: "min, max, step, precision, prefix, suffix",
        },
        {
            type: "textarea",
            desc: "Multi-line text input",
            extra: "rows, minLength, maxLength, autoResize",
        },
        {
            type: "select",
            desc: "Dropdown select (single or multiple)",
            extra: "options, multiple, searchable, clearable, maxSelections",
        },
        { type: "checkbox", desc: "Single checkbox toggle", extra: "checkedValue, uncheckedValue" },
        { type: "radio", desc: "Radio button group", extra: "options, inline" },
        {
            type: "switch",
            desc: "Toggle switch",
            extra: "checkedValue, uncheckedValue, checkedLabel, uncheckedLabel",
        },
        { type: "date", desc: "Date/time picker", extra: "mode, format, minDate, maxDate" },
        {
            type: "file",
            desc: "File upload with drag-and-drop",
            extra: "accept, multiple, maxSize, maxFiles, dragDrop",
        },
        {
            type: "slider",
            desc: "Range slider",
            extra: "min, max, step, range, showTooltip, marks",
        },
        {
            type: "tags",
            desc: "Tag input with suggestions",
            extra: "maxTags, allowCustom, suggestions, separator",
        },
    ];
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="ft in fieldTypes"
      :key="ft.type"
      class="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3"
    >
      <div class="flex items-baseline gap-2">
        <code class="text-xs font-semibold text-primary-600 dark:text-primary-400">{{ ft.type }}</code>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ ft.desc }}</span>
      </div>
      <p class="mt-1 text-[11px] text-gray-400 dark:text-gray-500 font-mono">{{ ft.extra }}</p>
    </div>
  </div>
</template>
