<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // ExamplesPage – Gallery of example forms with live preview
    // ---------------------------------------------------------------------------

    import { extractFields, type FieldSchema, type SchemaNode } from "@formcraft/vue";
    import { computed, ref, watch } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import PreviewField from "../components/builder/PreviewField.vue";
    import type { ExampleEntry } from "../examples";
    import { examples } from "../examples";

    function getFieldNodes(nodes: SchemaNode[]): FieldSchema[] {
        return extractFields(nodes);
    }

    const route = useRoute();
    const router = useRouter();

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    const selectedId = ref<string | null>((route.params.id as string) ?? null);
    const showSchema = ref(false);

    watch(
        () => route.params.id,
        (id) => {
            selectedId.value = (id as string) ?? null;
        },
    );

    const selectedExample = computed<ExampleEntry | null>(
        () => examples.find((e) => e.id === selectedId.value) ?? null,
    );

    function selectExample(id: string) {
        if (selectedId.value === id) {
            selectedId.value = null;
            router.push("/examples");
        } else {
            selectedId.value = id;
            router.push(`/examples/${id}`);
        }
    }

    function tagColor(tag: string): string {
        const colors: Record<string, string> = {
            "Multi-step":
                "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
            i18n: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
            Conditional: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
            Simple: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
            Branching: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
            Tabs: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
        };
        return colors[tag] ?? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }

    // ---------------------------------------------------------------------------
    // Simple syntax highlighting for schema preview
    // ---------------------------------------------------------------------------

    function highlight(code: string): string {
        // Escape HTML entities first
        const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Tokenise in a single pass to avoid regex passes corrupting each other
        return escaped.replace(
            /("(?:[^"\\]|\\.)*"(?:\s*:)?)|(\b(?:true|false|null)\b)|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g,
            (match, str?: string, keyword?: string, num?: string) => {
                if (str) {
                    // Key (string followed by colon) vs plain string value
                    const cls = str.trimEnd().endsWith(":")
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-green-600 dark:text-green-400";
                    return `<span class="${cls}">${match}</span>`;
                }
                if (keyword) {
                    return `<span class="text-blue-600 dark:text-blue-400">${match}</span>`;
                }
                if (num) {
                    return `<span class="text-amber-600 dark:text-amber-400">${match}</span>`;
                }
                return match;
            },
        );
    }
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Examples</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Browse pre-built form examples to see FormCraft in action.
      </p>
    </div>

    <!-- Grid / Detail layout -->
    <div :class="selectedExample ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''">
      <!-- Cards grid -->
      <div :class="selectedExample ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'">
        <div
          v-for="example in examples"
          :key="example.id"
          :class="[
            'group cursor-pointer rounded-xl border p-5 transition-all',
            selectedId === example.id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
          ]"
          @click="selectExample(example.id)"
        >
          <!-- Title row -->
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ example.title }}
              </h3>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {{ example.description }}
              </p>
            </div>
            <svg
              class="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors mt-0.5"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>

          <!-- Tags -->
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span
              v-for="tag in example.tags"
              :key="tag"
              :class="['inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium', tagColor(tag)]"
            >
              {{ tag }}
            </span>
          </div>

          <!-- Field count -->
          <p class="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
            {{ getFieldNodes(example.schema.fields).length }} fields
          </p>
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedExample" class="space-y-4">
        <!-- Form preview card -->
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ selectedExample.title }}
            </h3>
            <button
              class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              @click="showSchema = !showSchema"
            >
              {{ showSchema ? 'Hide schema' : 'View schema' }}
            </button>
          </div>

          <!-- Live form preview -->
          <div class="p-6">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {{ selectedExample.description }}
            </p>
            <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <div class="space-y-3">
                <PreviewField
                  v-for="field in getFieldNodes(selectedExample.schema.fields).slice(0, 6)"
                  :key="field.name"
                  :field="field"
                />
                <p v-if="getFieldNodes(selectedExample.schema.fields).length > 6" class="text-[11px] text-gray-400 dark:text-gray-500 text-center pt-1">
                  + {{ getFieldNodes(selectedExample.schema.fields).length - 6 }} more fields
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Schema panel -->
        <div v-if="showSchema" class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h4 class="text-xs font-semibold text-gray-700 dark:text-gray-300">Schema</h4>
          </div>
          <div class="max-h-80 overflow-auto p-4">
            <pre class="text-[11px] leading-relaxed font-mono"><code v-html="highlight(JSON.stringify(selectedExample.schema, null, 2))" /></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
