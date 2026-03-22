<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // FormBuilderPage – Visual drag-and-drop form builder
    // ---------------------------------------------------------------------------

    import type { FieldSchema, FormSchema, SchemaNode } from "@formatica/vue";
    import { extractFields, isFieldNode } from "@formatica/vue";
    import { computed, ref } from "vue";
    import BuilderCanvas from "../components/builder/BuilderCanvas.vue";
    import BuilderPreview from "../components/builder/BuilderPreview.vue";
    import BuilderToolbar from "../components/builder/BuilderToolbar.vue";
    import FieldConfigurator from "../components/builder/FieldConfigurator.vue";
    import FieldPalette from "../components/builder/FieldPalette.vue";
    import SchemaExport from "../components/builder/SchemaExport.vue";

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    const schemaNodes = ref<SchemaNode[]>([]);
    const selectedField = ref<string | null>(null);
    const isPreviewMode = ref(false);
    const showExport = ref(false);
    let fieldCounter = 0;

    // ---------------------------------------------------------------------------
    // Undo / redo
    // ---------------------------------------------------------------------------

    interface Snapshot {
        nodes: SchemaNode[];
    }

    const undoStack = ref<Snapshot[]>([]);
    const redoStack = ref<Snapshot[]>([]);
    const MAX_SNAPSHOTS = 50;

    function pushSnapshot() {
        undoStack.value.push({
            nodes: JSON.parse(JSON.stringify(schemaNodes.value)),
        });
        if (undoStack.value.length > MAX_SNAPSHOTS) undoStack.value.shift();
        redoStack.value = [];
    }

    function undo() {
        const snap = undoStack.value.pop();
        if (!snap) return;
        redoStack.value.push({
            nodes: JSON.parse(JSON.stringify(schemaNodes.value)),
        });
        schemaNodes.value = snap.nodes;
        selectedField.value = null;
    }

    function redo() {
        const snap = redoStack.value.pop();
        if (!snap) return;
        undoStack.value.push({
            nodes: JSON.parse(JSON.stringify(schemaNodes.value)),
        });
        schemaNodes.value = snap.nodes;
        selectedField.value = null;
    }

    const canUndo = computed(() => undoStack.value.length > 0);
    const canRedo = computed(() => redoStack.value.length > 0);

    // ---------------------------------------------------------------------------
    // Selection helpers
    // ---------------------------------------------------------------------------

    const fieldsRecord = computed(() => {
        const fields = extractFields(schemaNodes.value);
        const record: Record<string, FieldSchema> = {};
        for (const f of fields) {
            record[f.name] = f;
        }
        return record;
    });

    const selectedFieldSchema = computed(() =>
        selectedField.value ? (fieldsRecord.value[selectedField.value] ?? null) : null,
    );

    const allFieldNames = computed(() => Object.keys(fieldsRecord.value));

    // ---------------------------------------------------------------------------
    // Drop handler – create new fields/layout
    // ---------------------------------------------------------------------------

    function createFieldNode(type: string, label: string): FieldSchema {
        fieldCounter++;
        const name = `field_${fieldCounter}`;
        const base = { name, label: `${label} ${fieldCounter}`, placeholder: "" };

        switch (type) {
            case "select":
                return {
                    ...base,
                    type: "select",
                    options: [{ label: "Option 1", value: "opt1" }],
                };
            case "radio":
                return {
                    ...base,
                    type: "radio",
                    options: [{ label: "Option 1", value: "opt1" }],
                };
            case "checkbox":
                return { ...base, type: "checkbox" };
            case "number":
                return { ...base, type: "number" };
            case "textarea":
                return { ...base, type: "textarea" };
            case "switch":
                return { ...base, type: "switch" };
            case "date":
                return { ...base, type: "date" };
            case "file":
                return { ...base, type: "file" };
            case "slider":
                return { ...base, type: "slider", min: 0, max: 100 };
            case "tags":
                return { ...base, type: "tags" };
            case "phone":
                return { ...base, type: "phone", defaultCountry: "US", rules: ["phone"] };
            default:
                return { ...base, type: "text" };
        }
    }

    function onDrop(data: {
        type: string;
        label: string;
        category: string;
        targetRowIndex?: number;
        targetGroupIndex?: number;
    }) {
        pushSnapshot();

        if (data.category === "field") {
            const field = createFieldNode(data.type, data.label);

            if (data.targetRowIndex !== undefined) {
                // Drop into a row container
                const newNodes = [...schemaNodes.value];
                const row = newNodes[data.targetRowIndex];
                if (row && row.type === "row") {
                    newNodes[data.targetRowIndex] = {
                        ...row,
                        children: [...row.children, { ...field, span: 6 }],
                    };
                    schemaNodes.value = newNodes;
                }
            } else if (data.targetGroupIndex !== undefined) {
                // Drop into a group container
                const newNodes = [...schemaNodes.value];
                const group = newNodes[data.targetGroupIndex];
                if (group && group.type === "group") {
                    newNodes[data.targetGroupIndex] = {
                        ...group,
                        children: [...group.children, field],
                    };
                    schemaNodes.value = newNodes;
                }
            } else {
                // Drop at root level at specific position
                const newNodes = [...schemaNodes.value];
                const pos = data.insertAt ?? newNodes.length;
                newNodes.splice(pos, 0, field);
                schemaNodes.value = newNodes;
            }
            selectedField.value = field.name;
        } else {
            // Layout items
            let node: SchemaNode;
            switch (data.type) {
                case "row":
                    node = { type: "row", children: [] };
                    break;
                case "group":
                    node = { type: "group", title: "Group", children: [] };
                    break;
                default:
                    node = { type: "divider" };
            }
            const newNodes = [...schemaNodes.value];
            const pos = data.insertAt ?? newNodes.length;
            newNodes.splice(pos, 0, node);
            schemaNodes.value = newNodes;
        }
    }

    // ---------------------------------------------------------------------------
    // Node updates
    // ---------------------------------------------------------------------------

    function onNodesUpdate(newNodes: SchemaNode[]) {
        pushSnapshot();
        schemaNodes.value = newNodes;
    }

    function onFieldUpdate(updated: FieldSchema) {
        // Walk the tree and replace the field node with the matching name
        schemaNodes.value = replaceFieldInTree(schemaNodes.value, updated);
    }

    function replaceFieldInTree(nodes: SchemaNode[], updated: FieldSchema): SchemaNode[] {
        return nodes.map((node) => {
            if (isFieldNode(node) && node.name === updated.name) {
                return updated;
            }
            if (node.type === "row") {
                return { ...node, children: replaceFieldInTree(node.children, updated) };
            }
            if (node.type === "group") {
                return { ...node, children: replaceFieldInTree(node.children, updated) };
            }
            if (node.type === "steps") {
                return {
                    ...node,
                    steps: node.steps.map((s) => ({
                        ...s,
                        children: replaceFieldInTree(s.children, updated),
                    })),
                };
            }
            if (node.type === "tabs") {
                return {
                    ...node,
                    tabs: node.tabs.map((t) => ({
                        ...t,
                        children: replaceFieldInTree(t.children, updated),
                    })),
                };
            }
            return node;
        });
    }

    function onSelect(name: string | null) {
        selectedField.value = name;
    }

    function clearAll() {
        pushSnapshot();
        schemaNodes.value = [];
        selectedField.value = null;
        fieldCounter = 0;
    }

    // ---------------------------------------------------------------------------
    // Export helpers
    // ---------------------------------------------------------------------------

    const exportSchema = computed<FormSchema>(() => ({
        fields: schemaNodes.value,
    }));
</script>

<template>
  <div class="-m-6 lg:-m-8 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
    <!-- Toolbar -->
    <BuilderToolbar
      :can-undo="canUndo"
      :can-redo="canRedo"
      :is-preview-mode="isPreviewMode"
      @undo="undo"
      @redo="redo"
      @toggle-preview="isPreviewMode = !isPreviewMode"
      @export="showExport = true"
      @clear="clearAll"
    />

    <!-- Main panels -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left: Field Palette -->
      <div class="w-52 shrink-0 border-r border-gray-200 dark:border-gray-700">
        <FieldPalette />
      </div>

      <!-- Center: Canvas or Preview -->
      <div class="flex-1 overflow-hidden bg-white dark:bg-gray-950">
        <BuilderCanvas
          v-if="!isPreviewMode"
          :schema-nodes="schemaNodes"
          :selected-field="selectedField"
          @update:schema-nodes="onNodesUpdate"
          @select="onSelect"
          @drop="onDrop"
        />
        <BuilderPreview v-else :schema-nodes="schemaNodes" />
      </div>

      <!-- Right: Configurator -->
      <div
        v-if="selectedFieldSchema"
        class="w-80 shrink-0 border-l border-gray-200 dark:border-gray-700"
      >
        <FieldConfigurator
          :field="selectedFieldSchema"
          :all-field-names="allFieldNames"
          @update:field="onFieldUpdate"
        />
      </div>
    </div>

    <!-- Export modal -->
    <SchemaExport
      v-if="showExport"
      :schema="exportSchema"
      @close="showExport = false"
      @open-in-playground="showExport = false"
    />
  </div>
</template>
