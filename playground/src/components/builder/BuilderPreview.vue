<script setup lang="ts">
    import type { SchemaNode } from "@formatica/vue";
    import { extractFields, isFieldNode } from "@formatica/vue";
    import { computed } from "vue";
    import PreviewField from "./PreviewField.vue";

    interface Props {
        schemaNodes: SchemaNode[];
    }

    const props = defineProps<Props>();

    const hasFields = computed(() => extractFields(props.schemaNodes).length > 0);

    function getNodeSpan(node: SchemaNode): number {
        if (isFieldNode(node) && node.span && typeof node.span === "number") {
            return node.span;
        }
        return 12;
    }
</script>

<template>
  <div class="flex h-full items-center justify-center overflow-y-auto p-8">
    <div class="w-full max-w-lg rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-lg">
      <p v-if="!hasFields" class="text-center text-sm text-gray-400 dark:text-gray-500">
        Add fields to preview the form.
      </p>
      <div v-else class="space-y-4">
        <template v-for="(node, idx) in schemaNodes" :key="idx">

          <!-- Row -->
          <div
            v-if="node.type === 'row' && node.children.length > 0"
            class="grid grid-cols-12 gap-4"
          >
            <template v-for="(child, childIdx) in node.children" :key="childIdx">
              <div
                v-if="isFieldNode(child)"
                :style="{ gridColumn: `span ${getNodeSpan(child)}` }"
              >
                <PreviewField :field="child" />
              </div>
            </template>
          </div>

          <div
            v-else-if="node.type === 'row' && node.children.length === 0"
            class="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-center"
          >
            <p class="text-xs text-gray-400 dark:text-gray-500">Empty row</p>
          </div>

          <!-- Group -->
          <fieldset
            v-else-if="node.type === 'group'"
            class="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <legend v-if="node.title" class="px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              {{ node.title }}
            </legend>
            <p v-if="node.description" class="mb-3 text-xs text-gray-500 dark:text-gray-400">
              {{ node.description }}
            </p>
            <div class="space-y-3">
              <template v-for="(child, ci) in node.children" :key="ci">
                <PreviewField v-if="isFieldNode(child)" :field="child" />
              </template>
            </div>
          </fieldset>

          <!-- Divider -->
          <hr v-else-if="node.type === 'divider'" class="border-gray-200 dark:border-gray-700" />

          <!-- Field -->
          <PreviewField
            v-else-if="isFieldNode(node)"
            :field="node"
          />

        </template>
      </div>

      <div v-if="hasFields" class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          Submit
        </button>
      </div>
    </div>
  </div>
</template>
