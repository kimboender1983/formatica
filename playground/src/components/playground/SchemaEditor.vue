<script setup lang="ts">
    import type { FormSchema, SchemaError } from "@formatica/vue";
    import { parseFormSchema, SchemaValidationError } from "@formatica/vue";
    import { onMounted, ref, watch } from "vue";

    // ---------------------------------------------------------------------------
    // Props & emits
    // ---------------------------------------------------------------------------

    const props = defineProps<{
        schema: FormSchema;
    }>();

    const emit = defineEmits<{
        "update:schema": [schema: FormSchema];
    }>();

    // ---------------------------------------------------------------------------
    // Editor state
    // ---------------------------------------------------------------------------

    const editorContent = ref("");
    const parseError = ref<string | null>(null);
    const schemaErrors = ref<SchemaError[]>([]);
    const errorsExpanded = ref(true);
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    function buildEditorJson(): string {
        return JSON.stringify(props.schema, null, 2);
    }

    onMounted(() => {
        editorContent.value = buildEditorJson();
    });

    // Sync from parent when schema changes externally
    watch(
        () => props.schema,
        () => {
            const next = buildEditorJson();
            // Only overwrite if the content wouldn't parse to the same thing
            // (avoids fighting with user edits)
            try {
                const currentParsed = JSON.parse(editorContent.value);
                const nextParsed = JSON.parse(next);
                if (JSON.stringify(currentParsed) === JSON.stringify(nextParsed)) return;
            } catch {
                // current content is invalid, overwrite
            }
            editorContent.value = next;
            parseError.value = null;
            schemaErrors.value = [];
        },
        { deep: true },
    );

    // ---------------------------------------------------------------------------
    // Input handling (debounced)
    // ---------------------------------------------------------------------------

    function onInput() {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            tryParse();
        }, 500);
    }

    function tryParse() {
        parseError.value = null;
        schemaErrors.value = [];

        let parsed: Record<string, unknown>;
        try {
            parsed = JSON.parse(editorContent.value);
        } catch (err) {
            parseError.value = err instanceof Error ? err.message : "Invalid JSON";
            return;
        }

        // Validate schema
        try {
            const validSchema = parseFormSchema(parsed);
            emit("update:schema", validSchema);
        } catch (err) {
            if (err instanceof SchemaValidationError) {
                schemaErrors.value = err.errors;
                return;
            }
            parseError.value = err instanceof Error ? err.message : "Schema validation failed";
            return;
        }
    }

    // ---------------------------------------------------------------------------
    // Toolbar actions
    // ---------------------------------------------------------------------------

    function copyToClipboard() {
        navigator.clipboard.writeText(editorContent.value);
    }

    function formatJson() {
        try {
            const parsed = JSON.parse(editorContent.value);
            editorContent.value = JSON.stringify(parsed, null, 2);
            parseError.value = null;
        } catch {
            // Can't format invalid JSON
        }
    }

    function resetEditor() {
        editorContent.value = buildEditorJson();
        parseError.value = null;
        schemaErrors.value = [];
    }

    function toggleErrors() {
        errorsExpanded.value = !errorsExpanded.value;
    }
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Toolbar -->
    <div
      class="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5"
    >
      <span class="mr-auto text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Schema
      </span>
      <button
        @click="copyToClipboard"
        class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Copy to clipboard"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        Copy
      </button>
      <button
        @click="formatJson"
        class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Format JSON"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
        Format
      </button>
      <button
        @click="resetEditor"
        class="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Reset to current schema"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Reset
      </button>
    </div>

    <!-- Textarea editor -->
    <div class="relative flex-1 overflow-hidden">
      <textarea
        v-model="editorContent"
        @input="onInput"
        spellcheck="false"
        class="h-full w-full resize-none border-0 bg-white dark:bg-gray-900 p-4 font-mono text-[13px] leading-relaxed text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-0 scrollbar-thin"
        :class="[
          parseError || schemaErrors.length
            ? 'ring-2 ring-inset ring-red-300 dark:ring-red-700'
            : '',
        ]"
      />
    </div>

    <!-- Parse error banner -->
    <div
      v-if="parseError"
      class="border-t border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-2.5"
    >
      <div class="flex items-start gap-2">
        <svg class="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p class="text-xs font-medium text-red-700 dark:text-red-300">{{ parseError }}</p>
      </div>
    </div>

    <!-- Schema validation errors -->
    <div
      v-if="schemaErrors.length"
      class="border-t border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50"
    >
      <button
        @click="toggleErrors"
        class="flex w-full items-center gap-2 px-4 py-2 text-left"
      >
        <svg
          class="h-4 w-4 shrink-0 text-amber-500 transition-transform"
          :class="errorsExpanded ? 'rotate-90' : ''"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span class="text-xs font-medium text-amber-700 dark:text-amber-300">
          {{ schemaErrors.length }} validation error{{ schemaErrors.length > 1 ? 's' : '' }}
        </span>
      </button>
      <ul
        v-if="errorsExpanded"
        class="max-h-32 overflow-y-auto scrollbar-thin px-4 pb-3 space-y-1"
      >
        <li
          v-for="(error, i) in schemaErrors"
          :key="i"
          class="text-xs text-amber-800 dark:text-amber-200"
        >
          <span class="font-mono font-medium text-amber-600 dark:text-amber-400">[{{ error.field }}]</span>
          {{ error.message }}
        </li>
      </ul>
    </div>
  </div>
</template>
