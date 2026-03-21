<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // DocCodeBlock – Syntax-highlighted code block for documentation
    // ---------------------------------------------------------------------------

    import { computed, ref } from "vue";

    interface Props {
        code: string;
        language?: string;
    }

    const props = withDefaults(defineProps<Props>(), { language: "typescript" });

    const copied = ref(false);

    const KEYWORDS = new Set([
        "import",
        "export",
        "from",
        "const",
        "let",
        "type",
        "interface",
        "function",
        "return",
        "async",
        "await",
        "new",
        "default",
        "extends",
        "implements",
        "typeof",
        "keyof",
        "as",
        "in",
    ]);

    const TYPES = new Set([
        "string",
        "number",
        "boolean",
        "void",
        "null",
        "undefined",
        "true",
        "false",
        "Record",
        "Partial",
        "Promise",
    ]);

    const highlighted = computed(() => {
        const escaped = props.code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        // Single-pass tokenizer: strings, comments, numbers, and words
        return escaped.replace(
            /(\/\/[^\n]*)|(&#39;(?:[^&#]|&#(?!39;))*&#39;|&quot;(?:[^&]|&(?!quot;))*&quot;|`[^`]*`)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`)|(-?\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*\b)/g,
            (
                match,
                comment?: string,
                _htmlStr?: string,
                rawStr?: string,
                num?: string,
                word?: string,
            ) => {
                if (comment) {
                    return `<span class="text-gray-400 dark:text-gray-500 italic">${comment}</span>`;
                }
                if (_htmlStr || rawStr) {
                    return `<span class="text-green-600 dark:text-green-400">${match}</span>`;
                }
                if (num) {
                    return `<span class="text-amber-600 dark:text-amber-400">${match}</span>`;
                }
                if (word) {
                    if (KEYWORDS.has(word)) {
                        return `<span class="text-purple-600 dark:text-purple-400">${match}</span>`;
                    }
                    if (TYPES.has(word)) {
                        return `<span class="text-blue-600 dark:text-blue-400">${match}</span>`;
                    }
                }
                return match;
            },
        );
    });

    async function copy() {
        try {
            await navigator.clipboard.writeText(props.code);
            copied.value = true;
            setTimeout(() => {
                copied.value = false;
            }, 2000);
        } catch {
            // ignored
        }
    }
</script>

<template>
  <div class="group relative rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 overflow-hidden">
    <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-2">
      <span class="text-[10px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ language }}</span>
      <button
        class="text-[10px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        @click="copy"
      >
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre class="overflow-x-auto p-4 text-xs leading-relaxed font-mono"><code v-html="highlighted" /></pre>
  </div>
</template>
