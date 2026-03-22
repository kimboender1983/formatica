<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // LayoutConfigurator – Right panel for editing a layout container
    // ---------------------------------------------------------------------------

    import type { GroupLayout, LayoutNode, RowLayout } from "@formatica/vue";

    interface Props {
        node: LayoutNode;
    }

    const props = defineProps<Props>();
    const emit = defineEmits<{ "update:node": [node: LayoutNode] }>();

    function updateNode(patch: Record<string, unknown>) {
        emit("update:node", { ...props.node, ...patch } as LayoutNode);
    }

    const inputCls =
        "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors";
    const labelCls = "block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1";
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto scrollbar-thin bg-gray-50 dark:bg-gray-900 p-3 space-y-4">
    <p class="text-xs font-semibold text-gray-900 dark:text-white">
      {{ node.type === 'row' ? 'Row Layout' : node.type === 'group' ? 'Group Layout' : 'Layout Node' }}
    </p>

    <!-- Row settings -->
    <template v-if="node.type === 'row'">
      <div>
        <label :class="labelCls">Column count</label>
        <input
          type="number"
          :class="inputCls"
          :value="(node as RowLayout).columns.length"
          min="1"
          max="6"
          readonly
          class="!bg-gray-50 dark:!bg-gray-750"
        />
        <p class="mt-1 text-[10px] text-gray-400 dark:text-gray-500">Add fields to columns via drag-and-drop</p>
      </div>
      <div>
        <label :class="labelCls">Gap</label>
        <input
          :class="inputCls"
          :value="(node as RowLayout).gap ?? ''"
          @input="updateNode({ gap: ($event.target as HTMLInputElement).value })"
          placeholder="e.g. 1rem"
        />
      </div>
      <div>
        <label :class="labelCls">Alignment</label>
        <select :class="inputCls" :value="(node as RowLayout).align ?? 'stretch'" @change="updateNode({ align: ($event.target as HTMLSelectElement).value })">
          <option value="start">Start</option>
          <option value="center">Center</option>
          <option value="end">End</option>
          <option value="stretch">Stretch</option>
        </select>
      </div>
    </template>

    <!-- Group settings -->
    <template v-if="node.type === 'group'">
      <div>
        <label :class="labelCls">Label</label>
        <input
          :class="inputCls"
          :value="(node as GroupLayout).title ?? ''"
          @input="updateNode({ title: ($event.target as HTMLInputElement).value })"
          placeholder="Group title"
        />
      </div>
      <div>
        <label :class="labelCls">Description</label>
        <input
          :class="inputCls"
          :value="(node as GroupLayout).description ?? ''"
          @input="updateNode({ description: ($event.target as HTMLInputElement).value })"
          placeholder="Group description"
        />
      </div>
      <label class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          :checked="!!(node as GroupLayout).collapsible"
          @change="updateNode({ collapsible: ($event.target as HTMLInputElement).checked })"
          class="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
        />
        Collapsible
      </label>
    </template>

    <!-- Divider settings -->
    <template v-if="node.type === 'divider'">
      <div>
        <label :class="labelCls">Label (optional)</label>
        <input
          :class="inputCls"
          :value="node.label ?? ''"
          @input="updateNode({ label: ($event.target as HTMLInputElement).value })"
          placeholder="Divider label"
        />
      </div>
    </template>

    <!-- CSS class override -->
    <div>
      <label :class="labelCls">CSS class</label>
      <input
        :class="inputCls"
        :value="node.className ?? ''"
        @input="updateNode({ className: ($event.target as HTMLInputElement).value })"
        placeholder="Custom CSS class"
      />
    </div>
  </div>
</template>
