<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // SchemaExport – Modal showing generated schema as JSON or TypeScript
    // ---------------------------------------------------------------------------

    import type { FormSchema } from "@formatica/vue";
    import { computed, ref } from "vue";

    interface Props {
        schema: FormSchema;
    }

    const props = defineProps<Props>();
    const emit = defineEmits<{ close: []; "open-in-playground": [] }>();

    const activeTab = ref<"json" | "typescript">("json");
    const copied = ref(false);

    // ---------------------------------------------------------------------------
    // Generated code
    // ---------------------------------------------------------------------------

    const jsonOutput = computed(() => JSON.stringify(props.schema, null, 2));

    const tsOutput = computed(() => {
        const schemaStr = JSON.stringify(props.schema, null, 2);
        return `import type { FormSchema } from '@formatica/vue';

const schema: FormSchema = ${schemaStr};

export { schema };`;
    });

    const currentOutput = computed(() =>
        activeTab.value === "json" ? jsonOutput.value : tsOutput.value,
    );

    // ---------------------------------------------------------------------------
    // Actions
    // ---------------------------------------------------------------------------

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(currentOutput.value);
            copied.value = true;
            setTimeout(() => {
                copied.value = false;
            }, 2000);
        } catch {
            // fallback: ignored
        }
    }

    function downloadJson() {
        const blob = new Blob([jsonOutput.value], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "formatica-schema.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    // ---------------------------------------------------------------------------
    // Simple syntax highlighting
    // ---------------------------------------------------------------------------

    function highlight(code: string): string {
        const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Single-pass tokenizer to avoid regex passes corrupting each other
        return escaped.replace(
            /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"(?:\s*:)?)|('(?:[^'\\]|\\.)*')|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b(?:import|from|export|const|let|type|interface|function)\b)|(\b(?:true|false|null|undefined)\b)/g,
            (
                match,
                comment?: string,
                dblStr?: string,
                sglStr?: string,
                num?: string,
                keyword?: string,
                literal?: string,
            ) => {
                if (comment) {
                    return `<span class="text-gray-400 dark:text-gray-500 italic">${match}</span>`;
                }
                if (dblStr) {
                    const cls = dblStr.trimEnd().endsWith(":")
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-green-600 dark:text-green-400";
                    return `<span class="${cls}">${match}</span>`;
                }
                if (sglStr) {
                    return `<span class="text-green-600 dark:text-green-400">${match}</span>`;
                }
                if (num) {
                    return `<span class="text-amber-600 dark:text-amber-400">${match}</span>`;
                }
                if (keyword) {
                    return `<span class="text-purple-600 dark:text-purple-400">${match}</span>`;
                }
                if (literal) {
                    return `<span class="text-blue-600 dark:text-blue-400">${match}</span>`;
                }
                return match;
            },
        );
    }
</script>

<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="emit('close')">
    <!-- Modal -->
    <div class="mx-4 flex w-full max-w-3xl flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-3">
        <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Export Schema</h2>
        <button
          class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors"
          @click="emit('close')"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 px-5">
        <button
          v-for="tab in (['json', 'typescript'] as const)"
          :key="tab"
          :class="[
            'px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors',
            activeTab === tab
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          ]"
          @click="activeTab = tab"
        >
          {{ tab === 'json' ? 'JSON' : 'TypeScript' }}
        </button>
      </div>

      <!-- Code block -->
      <div class="flex-1 overflow-auto p-5">
        <pre class="rounded-xl bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 text-xs leading-relaxed font-mono overflow-x-auto"><code v-html="highlight(currentOutput)" /></pre>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-5 py-3">
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-colors"
          @click="emit('open-in-playground')"
        >
          Open in Playground
        </button>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-colors"
            @click="downloadJson"
          >
            <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download .json
          </button>
          <button
            :class="[
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-colors',
              copied
                ? 'bg-green-600 text-white'
                : 'bg-primary-600 text-white hover:bg-primary-700',
            ]"
            @click="copyToClipboard"
          >
            {{ copied ? 'Copied!' : 'Copy to clipboard' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
