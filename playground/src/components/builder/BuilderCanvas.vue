<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // BuilderCanvas – Main drop zone for the form builder
    // ---------------------------------------------------------------------------

    import type { FieldSchema, SchemaNode } from "@formcraft/vue";
    import { extractFields, isFieldNode } from "@formcraft/vue";
    import { computed, ref } from "vue";

    interface Props {
        schemaNodes: SchemaNode[];
        selectedField: string | null;
    }

    const props = defineProps<Props>();

    const emit = defineEmits<{
        "update:schemaNodes": [nodes: SchemaNode[]];
        select: [fieldName: string | null];
        drop: [
            data: {
                type: string;
                label: string;
                category: string;
                targetRowIndex?: number;
                targetGroupIndex?: number;
                insertAt?: number;
            },
        ];
    }>();

    const rootDragOver = ref(false);
    const rowDragOver = ref<number | null>(null);
    const groupDragOver = ref<number | null>(null);
    const editingLabel = ref<string | null>(null);
    const editLabelValue = ref("");

    // ---------------------------------------------------------------------------
    // Fields record computed from tree
    // ---------------------------------------------------------------------------

    const fieldsRecord = computed(() => {
        const fields = extractFields(props.schemaNodes);
        const record: Record<string, FieldSchema> = {};
        for (const f of fields) {
            record[f.name] = f;
        }
        return record;
    });

    // ---------------------------------------------------------------------------
    // Reorder state – top-level nodes
    // ---------------------------------------------------------------------------

    const reorderFrom = ref<number | null>(null);
    const reorderIndicator = ref<{ idx: number; pos: "before" | "after" } | null>(null);

    function isReorderDrag(e: DragEvent): boolean {
        return e.dataTransfer?.types.includes("application/formcraft-reorder") ?? false;
    }

    function onNodeDragStart(e: DragEvent, idx: number) {
        if (!e.dataTransfer) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("application/formcraft-reorder", String(idx));
        // If it's a field node, also mark it as a movable field
        const node = props.schemaNodes[idx];
        if (node && isFieldNode(node)) {
            e.dataTransfer.setData("application/formcraft-move-field", node.name);
        }
        reorderFrom.value = idx;
    }

    function onNodeDragEnd() {
        reorderFrom.value = null;
        reorderIndicator.value = null;
    }

    function onNodeDragOver(e: DragEvent, idx: number) {
        const isReorder = isReorderDrag(e) && reorderFrom.value !== null;
        const isPalette = isPaletteDrag(e);
        if (!isReorder && !isPalette) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = isReorder ? "move" : "copy";

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const pos = e.clientY < midY ? "before" : "after";
        reorderIndicator.value = { idx, pos };
    }

    function onNodeDragLeaveEl() {
        // indicator cleared on drop or dragend
    }

    function onNodeDrop(e: DragEvent, idx: number) {
        const isReorder = isReorderDrag(e) && reorderFrom.value !== null;
        const isPalette = isPaletteDrag(e);
        if (!isReorder && !isPalette) return;
        e.preventDefault();
        e.stopPropagation();

        const indicator = reorderIndicator.value;
        reorderIndicator.value = null;

        if (isReorder) {
            // Reorder existing node
            const from = reorderFrom.value!;
            reorderFrom.value = null;

            if (indicator === null || from === idx) return;

            let insertAt = indicator.pos === "before" ? indicator.idx : indicator.idx + 1;

            const newNodes = [...props.schemaNodes];
            const [moved] = newNodes.splice(from, 1);
            if (!moved) return;

            if (from < insertAt) insertAt--;
            if (insertAt === from) return;

            newNodes.splice(insertAt, 0, moved);
            emit("update:schemaNodes", newNodes);
        } else if (isPalette) {
            // New field from palette — insert at the indicated position
            rootDragOver.value = false;
            if (!e.dataTransfer) return;
            const raw = e.dataTransfer.getData("application/formcraft-field");
            if (!raw) return;
            const data = JSON.parse(raw) as { type: string; label: string; category: string };
            const insertAt = indicator
                ? indicator.pos === "before"
                    ? indicator.idx
                    : indicator.idx + 1
                : props.schemaNodes.length;
            emit("drop", { ...data, insertAt });
        }
    }

    // ---------------------------------------------------------------------------
    // Row-internal reorder
    // ---------------------------------------------------------------------------

    const rowReorderFrom = ref<{ row: number; col: number } | null>(null);
    const rowReorderIndicator = ref<{ row: number; col: number; pos: "before" | "after" } | null>(
        null,
    );

    function isRowReorderDrag(e: DragEvent): boolean {
        return e.dataTransfer?.types.includes("application/formcraft-row-reorder") ?? false;
    }

    function onRowFieldDragStart(e: DragEvent, rowIdx: number, colIdx: number) {
        if (!e.dataTransfer) return;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
            "application/formcraft-row-reorder",
            JSON.stringify({ row: rowIdx, col: colIdx }),
        );
        // Also mark as movable field so it can be dropped on other containers or root
        const row = props.schemaNodes[rowIdx];
        if (row && row.type === "row") {
            const child = row.children[colIdx];
            if (child && isFieldNode(child)) {
                e.dataTransfer.setData("application/formcraft-move-field", child.name);
            }
        }
        rowReorderFrom.value = { row: rowIdx, col: colIdx };
        e.stopPropagation();
    }

    function onRowFieldDragEnd() {
        rowReorderFrom.value = null;
        rowReorderIndicator.value = null;
    }

    function onRowFieldDragOver(e: DragEvent, rowIdx: number, colIdx: number) {
        if (!isRowReorderDrag(e)) return;
        if (!rowReorderFrom.value || rowReorderFrom.value.row !== rowIdx) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const pos = e.clientX < midX ? "before" : "after";
        rowReorderIndicator.value = { row: rowIdx, col: colIdx, pos };
    }

    function onRowFieldDrop(e: DragEvent, rowIdx: number, colIdx: number) {
        if (!isRowReorderDrag(e)) return;
        if (!rowReorderFrom.value || rowReorderFrom.value.row !== rowIdx) return;
        e.preventDefault();
        e.stopPropagation();

        const from = rowReorderFrom.value.col;
        const indicator = rowReorderIndicator.value;
        rowReorderFrom.value = null;
        rowReorderIndicator.value = null;

        if (indicator === null || from === colIdx) return;

        let insertAt = indicator.pos === "before" ? indicator.col : indicator.col + 1;

        const node = props.schemaNodes[rowIdx];
        if (!node || node.type !== "row") return;
        const newChildren = [...node.children];
        const [moved] = newChildren.splice(from, 1);
        if (!moved) return;

        if (from < insertAt) insertAt--;
        if (insertAt === from) return;

        newChildren.splice(insertAt, 0, moved);
        const newNodes = [...props.schemaNodes];
        newNodes[rowIdx] = { ...node, children: newChildren };
        emit("update:schemaNodes", newNodes);
    }

    // ---------------------------------------------------------------------------
    // Palette drag & drop – root level
    // ---------------------------------------------------------------------------

    function isPaletteDrag(e: DragEvent): boolean {
        return e.dataTransfer?.types.includes("application/formcraft-field") ?? false;
    }

    function isMoveFieldDrag(e: DragEvent): boolean {
        return e.dataTransfer?.types.includes("application/formcraft-move-field") ?? false;
    }

    function isAcceptableByContainer(e: DragEvent): boolean {
        return isPaletteDrag(e) || isMoveFieldDrag(e);
    }

    /** Remove a field by name from the tree and return the removed node + updated tree */
    function pluckFieldFromTree(
        nodes: SchemaNode[],
        name: string,
    ): { tree: SchemaNode[]; field: SchemaNode | null } {
        let found: SchemaNode | null = null;
        const tree = nodes
            .filter((n) => {
                if (isFieldNode(n) && n.name === name) {
                    found = n;
                    return false;
                }
                return true;
            })
            .map((n) => {
                if (found) return n; // already found, skip recursion
                if (n.type === "row") {
                    const result = pluckFieldFromTree(n.children, name);
                    if (result.field) found = result.field;
                    return { ...n, children: result.tree };
                }
                if (n.type === "group") {
                    const result = pluckFieldFromTree(n.children, name);
                    if (result.field) found = result.field;
                    return { ...n, children: result.tree };
                }
                return n;
            });
        return { tree, field: found };
    }

    function onRootDragOver(e: DragEvent) {
        if (!isPaletteDrag(e) && !isMoveFieldDrag(e)) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = isPaletteDrag(e) ? "copy" : "move";
        rootDragOver.value = true;
    }

    function onRootDragLeave() {
        rootDragOver.value = false;
    }

    function onRootDrop(e: DragEvent) {
        if (!isPaletteDrag(e) && !isMoveFieldDrag(e)) return;
        e.preventDefault();
        rootDragOver.value = false;
        if (!e.dataTransfer) return;

        // Moving an existing field to root level
        const moveFieldName = e.dataTransfer.getData("application/formcraft-move-field");
        if (moveFieldName && !isPaletteDrag(e)) {
            const { tree, field } = pluckFieldFromTree(props.schemaNodes, moveFieldName);
            if (!field) return;
            // Remove span when moving to root (not in a row anymore)
            const fieldAtRoot = isFieldNode(field) ? { ...field, span: undefined } : field;
            emit("update:schemaNodes", [...tree, fieldAtRoot]);
            reorderFrom.value = null;
            reorderIndicator.value = null;
            rowReorderFrom.value = null;
            rowReorderIndicator.value = null;
            return;
        }

        // New field from palette
        const raw = e.dataTransfer.getData("application/formcraft-field");
        if (!raw) return;
        const data = JSON.parse(raw) as { type: string; label: string; category: string };
        emit("drop", data);
    }

    // ---------------------------------------------------------------------------
    // Palette drag & drop – into row
    // ---------------------------------------------------------------------------

    function onRowDragOver(e: DragEvent, rowIndex: number) {
        if (!isAcceptableByContainer(e)) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = isMoveFieldDrag(e) ? "move" : "copy";
        rowDragOver.value = rowIndex;
    }

    function onRowDragLeave(e: DragEvent, rowIndex: number) {
        const related = e.relatedTarget as HTMLElement | null;
        const current = e.currentTarget as HTMLElement;
        if (related && current.contains(related)) return;
        if (rowDragOver.value === rowIndex) rowDragOver.value = null;
    }

    function onRowDrop(e: DragEvent, rowIndex: number) {
        if (!isAcceptableByContainer(e)) return;
        e.preventDefault();
        e.stopPropagation();
        rowDragOver.value = null;
        rootDragOver.value = false;
        reorderFrom.value = null;
        reorderIndicator.value = null;
        if (!e.dataTransfer) return;

        // Moving an existing field into this row
        const moveFieldName = e.dataTransfer.getData("application/formcraft-move-field");
        if (moveFieldName) {
            const { tree, field } = pluckFieldFromTree(props.schemaNodes, moveFieldName);
            if (!field || !isFieldNode(field)) return;
            const fieldWithSpan = { ...field, span: field.span ?? 6 } as SchemaNode;
            const row = tree[rowIndex];
            if (row && row.type === "row") {
                const newNodes = [...tree];
                newNodes[rowIndex] = { ...row, children: [...row.children, fieldWithSpan] };
                emit("update:schemaNodes", newNodes);
            }
            return;
        }

        // New field from palette
        const raw = e.dataTransfer.getData("application/formcraft-field");
        if (!raw) return;
        const data = JSON.parse(raw) as { type: string; label: string; category: string };
        if (data.category !== "field") return;
        emit("drop", { ...data, targetRowIndex: rowIndex });
    }

    // ---------------------------------------------------------------------------
    // Palette drag & drop – into group
    // ---------------------------------------------------------------------------

    function onGroupDragOver(e: DragEvent, groupIndex: number) {
        if (!isAcceptableByContainer(e)) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = isMoveFieldDrag(e) ? "move" : "copy";
        groupDragOver.value = groupIndex;
    }

    function onGroupDragLeave(e: DragEvent, groupIndex: number) {
        const related = e.relatedTarget as HTMLElement | null;
        const current = e.currentTarget as HTMLElement;
        if (related && current.contains(related)) return;
        if (groupDragOver.value === groupIndex) groupDragOver.value = null;
    }

    function onGroupDrop(e: DragEvent, groupIndex: number) {
        if (!isAcceptableByContainer(e)) return;
        e.preventDefault();
        e.stopPropagation();
        groupDragOver.value = null;
        rootDragOver.value = false;
        reorderFrom.value = null;
        reorderIndicator.value = null;
        if (!e.dataTransfer) return;

        // Moving an existing field into this group
        const moveFieldName = e.dataTransfer.getData("application/formcraft-move-field");
        if (moveFieldName) {
            const { tree, field } = pluckFieldFromTree(props.schemaNodes, moveFieldName);
            if (!field || !isFieldNode(field)) return;
            const group = tree[groupIndex];
            if (group && group.type === "group") {
                const newNodes = [...tree];
                newNodes[groupIndex] = { ...group, children: [...group.children, field] };
                emit("update:schemaNodes", newNodes);
            }
            return;
        }

        // New field from palette
        const raw = e.dataTransfer.getData("application/formcraft-field");
        if (!raw) return;
        const data = JSON.parse(raw) as { type: string; label: string; category: string };
        if (data.category !== "field") return;
        emit("drop", { ...data, targetGroupIndex: groupIndex });
    }

    // ---------------------------------------------------------------------------
    // Field interactions
    // ---------------------------------------------------------------------------

    function selectField(name: string) {
        emit("select", name);
    }

    function selectNode(index: number) {
        emit("select", `__layout_${index}`);
    }

    function deleteField(name: string) {
        const newNodes = removeFieldFromTree(props.schemaNodes, name);
        emit("update:schemaNodes", newNodes);
        if (props.selectedField === name) emit("select", null);
    }

    function removeFieldFromTree(nodes: SchemaNode[], name: string): SchemaNode[] {
        return nodes
            .filter((n) => !(isFieldNode(n) && n.name === name))
            .map((n) => {
                if (n.type === "row") {
                    return {
                        ...n,
                        children: n.children.filter((c) => !(isFieldNode(c) && c.name === name)),
                    };
                }
                if (n.type === "group") {
                    return { ...n, children: removeFieldFromTree(n.children, name) };
                }
                return n;
            });
    }

    function removeFieldFromRow(rowIndex: number, fieldName: string) {
        const node = props.schemaNodes[rowIndex];
        if (!node || node.type !== "row") return;
        const newChildren = node.children.filter((c) => !(isFieldNode(c) && c.name === fieldName));
        const newNodes = [...props.schemaNodes];
        newNodes[rowIndex] = { ...node, children: newChildren };
        emit("update:schemaNodes", newNodes);
        if (props.selectedField === fieldName) emit("select", null);
    }

    function removeFieldFromGroup(groupIndex: number, fieldName: string) {
        const node = props.schemaNodes[groupIndex];
        if (!node || node.type !== "group") return;
        const newChildren = node.children.filter((c) => !(isFieldNode(c) && c.name === fieldName));
        const newNodes = [...props.schemaNodes];
        newNodes[groupIndex] = { ...node, children: newChildren };
        emit("update:schemaNodes", newNodes);
        if (props.selectedField === fieldName) emit("select", null);
    }

    function deleteLayoutNode(idx: number) {
        const newNodes = [...props.schemaNodes];
        newNodes.splice(idx, 1);
        emit("update:schemaNodes", newNodes);
    }

    // ---------------------------------------------------------------------------
    // Span control
    // ---------------------------------------------------------------------------

    function updateFieldSpan(rowIndex: number, colIndex: number, newSpan: number) {
        const node = props.schemaNodes[rowIndex];
        if (!node || node.type !== "row") return;
        const newChildren = [...node.children];
        const child = newChildren[colIndex];
        if (child && isFieldNode(child)) {
            newChildren[colIndex] = { ...child, span: newSpan as FieldSchema["span"] };
        }
        const newNodes = [...props.schemaNodes];
        newNodes[rowIndex] = { ...node, children: newChildren };
        emit("update:schemaNodes", newNodes);
    }

    // ---------------------------------------------------------------------------
    // Label editing
    // ---------------------------------------------------------------------------

    function startEditLabel(name: string) {
        editingLabel.value = name;
        editLabelValue.value = fieldsRecord.value[name]?.label ?? name;
    }

    function finishEditLabel(name: string) {
        if (editingLabel.value !== name) return;
        // Walk tree and update the label
        const updated = fieldsRecord.value[name];
        if (updated) {
            const withNewLabel = { ...updated, label: editLabelValue.value };
            emit("update:schemaNodes", replaceFieldInTree(props.schemaNodes, withNewLabel));
        }
        editingLabel.value = null;
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
            return node;
        });
    }

    // ---------------------------------------------------------------------------
    // Display helpers
    // ---------------------------------------------------------------------------

    // Stable keys for TransitionGroup — fields use name, containers use a generated id
    let containerKeyCounter = 0;
    const containerKeys = new WeakMap<object, string>();

    function getNodeKey(node: SchemaNode): string {
        if (isFieldNode(node)) return `field-${node.name}`;
        let key = containerKeys.get(node);
        if (!key) {
            key = `container-${++containerKeyCounter}`;
            containerKeys.set(node, key);
        }
        return key;
    }

    function getFieldTypeIcon(type: string): string {
        const icons: Record<string, string> = {
            text: "T",
            number: "#",
            textarea: "\u00b6",
            select: "\u25bc",
            checkbox: "\u2611",
            radio: "\u25c9",
            switch: "\u25cb",
            date: "\ud83d\udcc5",
            file: "\ud83d\udcc4",
            slider: "\u2014",
            tags: "\u2606",
            phone: "\ud83d\udcde",
        };
        return icons[type] ?? "?";
    }

    function getNodeSpan(node: SchemaNode): number {
        if (isFieldNode(node) && node.span && typeof node.span === "number") {
            return node.span;
        }
        return 12;
    }

    function getRowUsedCols(node: SchemaNode): number {
        if (node.type !== "row") return 0;
        return node.children.reduce((sum, c) => sum + getNodeSpan(c), 0);
    }

    function showIndicator(idx: number, pos: "before" | "after"): boolean {
        return reorderIndicator.value?.idx === idx && reorderIndicator.value?.pos === pos;
    }

    function showRowIndicator(rowIdx: number, colIdx: number, pos: "before" | "after"): boolean {
        const i = rowReorderIndicator.value;
        return (
            i !== null && i !== undefined && i.row === rowIdx && i.col === colIdx && i.pos === pos
        );
    }

    const spanOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
</script>

<template>
  <div
    class="flex h-full flex-col overflow-y-auto p-4"
    @dragover="onRootDragOver"
    @dragleave="onRootDragLeave"
    @drop="onRootDrop"
  >
    <!-- Empty state -->
    <div
      v-if="schemaNodes.length === 0"
      :class="[
        'flex flex-1 items-center justify-center rounded-xl border-2 border-dashed transition-colors',
        rootDragOver
          ? 'border-primary-400 bg-primary-50 dark:border-primary-500 dark:bg-primary-950/30'
          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50',
      ]"
    >
      <div class="text-center">
        <svg class="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M12 8v8" /><path d="M8 12h8" />
        </svg>
        <p class="mt-3 text-sm font-medium text-gray-400 dark:text-gray-500">
          Drag fields here to start building your form
        </p>
      </div>
    </div>

    <!-- Schema nodes -->
    <TransitionGroup
      v-else
      tag="div"
      class="space-y-1"
      move-class="transition-transform duration-300 ease-out"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in absolute w-full"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <template v-for="(node, idx) in schemaNodes">

        <!-- ROW container -->
        <div
          v-if="node.type === 'row'"
          :key="getNodeKey(node)"
          draggable="true"
          @dragstart="onNodeDragStart($event, idx)"
          @dragend="onNodeDragEnd"
          @dragover="onNodeDragOver($event, idx)"
          @drop="onNodeDrop($event, idx)"
          :class="[
            'rounded-lg border transition-all',
            reorderFrom === idx ? 'opacity-30' : '',
            selectedField === `__layout_${idx}`
              ? 'border-primary-500 ring-2 ring-primary-500/30'
              : 'border-gray-200 dark:border-gray-700',
          ]"
        >
          <div v-if="showIndicator(idx, 'before')" class="h-0.5 -mt-0.5 rounded bg-primary-500" />

          <div
            class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/80 px-3 py-2 rounded-t-lg cursor-pointer"
            @click="selectNode(idx)"
          >
            <span class="shrink-0 text-gray-300 dark:text-gray-600 select-none text-sm cursor-grab">&#x22EE;&#x22EE;</span>
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900/50 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              &#x25A8;
            </span>
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Row
              <span class="font-normal text-gray-400 dark:text-gray-500">
                &mdash; {{ node.children.length }} field{{ node.children.length !== 1 ? 's' : '' }}, {{ getRowUsedCols(node) }}/12 cols used
              </span>
            </span>
            <button
              class="ml-auto flex h-5 w-5 items-center justify-center rounded text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
              @click.stop="deleteLayoutNode(idx)"
            >
              &times;
            </button>
          </div>

          <div
            :class="[
              'p-3 rounded-b-lg transition-colors',
              rowDragOver === idx
                ? 'bg-primary-50 dark:bg-primary-950/20'
                : 'bg-white dark:bg-gray-900/50',
            ]"
            @dragover="onRowDragOver($event, idx)"
            @dragleave="onRowDragLeave($event, idx)"
            @drop="onRowDrop($event, idx)"
          >
            <div v-if="node.children.length > 0" class="grid grid-cols-12 gap-2">
              <template v-for="(col, colIdx) in node.children" :key="colIdx">
                <div
                  draggable="true"
                  @dragstart="onRowFieldDragStart($event, idx, colIdx)"
                  @dragend="onRowFieldDragEnd"
                  @dragover="onRowFieldDragOver($event, idx, colIdx)"
                  @drop="onRowFieldDrop($event, idx, colIdx)"
                  :style="{ gridColumn: `span ${getNodeSpan(col)}` }"
                  :class="[
                    'relative rounded-md border px-3 py-2 cursor-pointer transition-all',
                    rowReorderFrom?.row === idx && rowReorderFrom?.col === colIdx ? 'opacity-30' : '',
                    isFieldNode(col) && selectedField === col.name
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-1 ring-primary-500/30'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600',
                  ]"
                  @click.stop="isFieldNode(col) ? selectField(col.name) : undefined"
                >
                  <div v-if="showRowIndicator(idx, colIdx, 'before')" class="absolute left-0 top-1 bottom-1 w-0.5 rounded bg-primary-500" />
                  <div v-if="showRowIndicator(idx, colIdx, 'after')" class="absolute right-0 top-1 bottom-1 w-0.5 rounded bg-primary-500" />

                  <div class="flex items-center gap-2">
                    <span class="shrink-0 cursor-grab text-gray-300 dark:text-gray-600 text-[10px] select-none">&#x22EE;&#x22EE;</span>
                    <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-700 text-[9px] font-mono text-gray-500 dark:text-gray-400">
                      {{ isFieldNode(col) ? getFieldTypeIcon(col.type) : '?' }}
                    </span>
                    <span class="flex-1 min-w-0 truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                      {{ isFieldNode(col) ? (col.label ?? col.name) : col.type }}
                    </span>
                    <button
                      v-if="isFieldNode(col)"
                      class="shrink-0 flex h-4 w-4 items-center justify-center rounded text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
                      @click.stop="removeFieldFromRow(idx, col.name)"
                    >
                      &times;
                    </button>
                  </div>
                  <div class="mt-1.5 flex items-center gap-1.5" @click.stop>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">Span:</span>
                    <select
                      :value="getNodeSpan(col)"
                      class="h-5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-1 text-[10px] text-gray-700 dark:text-gray-300 outline-none focus:border-primary-500"
                      @change="updateFieldSpan(idx, colIdx, Number(($event.target as HTMLSelectElement).value))"
                    >
                      <option v-for="s in spanOptions" :key="s" :value="s">{{ s }}/12</option>
                    </select>
                    <span class="text-[10px] text-gray-400 dark:text-gray-500">({{ Math.round(getNodeSpan(col) / 12 * 100) }}%)</span>
                  </div>
                </div>
              </template>
            </div>

            <div
              :class="[
                'flex items-center justify-center rounded-md border-2 border-dashed min-h-[48px] transition-colors',
                node.children.length > 0 ? 'mt-2' : '',
                rowDragOver === idx
                  ? 'border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
              ]"
            >
              <span class="text-[10px] font-medium" :class="rowDragOver === idx ? 'text-primary-500' : 'text-gray-400 dark:text-gray-600'">
                {{ node.children.length === 0 ? 'Drop fields here' : '+ Drop more fields' }}
              </span>
            </div>
          </div>

          <div v-if="showIndicator(idx, 'after')" class="h-0.5 -mb-0.5 rounded bg-primary-500" />
        </div>

        <!-- DIVIDER -->
        <div
          v-else-if="node.type === 'divider'"
          :key="getNodeKey(node)"
          draggable="true"
          @dragstart="onNodeDragStart($event, idx)"
          @dragend="onNodeDragEnd"
          @dragover="onNodeDragOver($event, idx)"
          @drop="onNodeDrop($event, idx)"
          :class="['flex items-center gap-3 px-4 py-2', reorderFrom === idx ? 'opacity-30' : '']"
        >
          <div v-if="showIndicator(idx, 'before')" class="absolute left-4 right-4 h-0.5 -top-0.5 rounded bg-primary-500" />
          <span class="shrink-0 text-gray-300 dark:text-gray-600 select-none text-sm cursor-grab">&#x22EE;&#x22EE;</span>
          <div class="flex-1 border-t border-gray-300 dark:border-gray-600" />
          <span class="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">divider</span>
          <button
            class="flex h-5 w-5 items-center justify-center rounded text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
            @click.stop="deleteLayoutNode(idx)"
          >
            &times;
          </button>
        </div>

        <!-- FIELD block (top-level) -->
        <div
          v-else-if="isFieldNode(node)"
          :key="getNodeKey(node)"
          draggable="true"
          @dragstart="onNodeDragStart($event, idx)"
          @dragend="onNodeDragEnd"
          @dragover="onNodeDragOver($event, idx)"
          @drop="onNodeDrop($event, idx)"
          :class="[
            'group relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-all cursor-pointer',
            reorderFrom === idx ? 'opacity-30' : '',
            selectedField === node.name
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-2 ring-primary-500/30'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm',
          ]"
          @click="selectField(node.name)"
        >
          <div v-if="showIndicator(idx, 'before')" class="absolute left-0 right-0 -top-[2px] h-0.5 rounded bg-primary-500" />
          <div v-if="showIndicator(idx, 'after')" class="absolute left-0 right-0 -bottom-[2px] h-0.5 rounded bg-primary-500" />

          <span class="shrink-0 cursor-grab text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-500 select-none text-sm">
            &#x22EE;&#x22EE;
          </span>
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-500 dark:text-gray-400">
            {{ getFieldTypeIcon(node.type) }}
          </span>
          <div class="flex-1 min-w-0">
            <template v-if="editingLabel === node.name">
              <input
                v-model="editLabelValue"
                class="w-full rounded border border-primary-300 dark:border-primary-600 bg-white dark:bg-gray-900 px-2 py-0.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/30"
                @blur="finishEditLabel(node.name)"
                @keydown.enter="finishEditLabel(node.name)"
                @keydown.escape="editingLabel = null"
                @click.stop
              />
            </template>
            <template v-else>
              <p
                class="truncate text-sm font-medium text-gray-700 dark:text-gray-300"
                @dblclick.stop="startEditLabel(node.name)"
              >
                {{ node.label ?? node.name }}
              </p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500">
                {{ node.type }}
              </p>
            </template>
          </div>
          <button
            class="shrink-0 flex h-6 w-6 items-center justify-center rounded-md text-gray-300 dark:text-gray-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500"
            @click.stop="deleteField(node.name)"
          >
            &times;
          </button>
        </div>

        <!-- GROUP container -->
        <div
          v-else-if="node.type === 'group'"
          :key="getNodeKey(node)"
          draggable="true"
          @dragstart="onNodeDragStart($event, idx)"
          @dragend="onNodeDragEnd"
          @dragover="onNodeDragOver($event, idx)"
          @drop="onNodeDrop($event, idx)"
          :class="[
            'rounded-lg border transition-all',
            reorderFrom === idx ? 'opacity-30' : '',
            selectedField === `__layout_${idx}`
              ? 'border-primary-500 ring-2 ring-primary-500/30'
              : 'border-gray-200 dark:border-gray-700',
          ]"
        >
          <div v-if="showIndicator(idx, 'before')" class="h-0.5 -mt-0.5 rounded bg-primary-500" />

          <div
            class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/80 px-3 py-2 rounded-t-lg cursor-pointer"
            @click="selectNode(idx)"
          >
            <span class="shrink-0 text-gray-300 dark:text-gray-600 select-none text-sm cursor-grab">&#x22EE;&#x22EE;</span>
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/50 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              &#x25A1;
            </span>
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {{ node.title || 'Group' }}
              <span class="font-normal text-gray-400 dark:text-gray-500">
                &mdash; {{ node.children.length }} field{{ node.children.length !== 1 ? 's' : '' }}
              </span>
            </span>
            <button
              class="ml-auto flex h-5 w-5 items-center justify-center rounded text-gray-300 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
              @click.stop="deleteLayoutNode(idx)"
            >
              &times;
            </button>
          </div>

          <div
            :class="[
              'p-3 rounded-b-lg transition-colors space-y-2',
              groupDragOver === idx
                ? 'bg-emerald-50 dark:bg-emerald-950/20'
                : 'bg-white dark:bg-gray-900/50',
            ]"
            @dragover="onGroupDragOver($event, idx)"
            @dragleave="onGroupDragLeave($event, idx)"
            @drop="onGroupDrop($event, idx)"
          >
            <div
              v-for="(child, childIdx) in node.children"
              :key="childIdx"
              :class="[
                'flex items-center gap-2 rounded-md border px-3 py-2.5 cursor-pointer transition-all',
                isFieldNode(child) && selectedField === child.name
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-1 ring-primary-500/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600',
              ]"
              @click.stop="isFieldNode(child) ? selectField(child.name) : undefined"
            >
              <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 dark:bg-gray-700 text-[9px] font-mono text-gray-500 dark:text-gray-400">
                {{ isFieldNode(child) ? getFieldTypeIcon(child.type) : '?' }}
              </span>
              <span class="flex-1 min-w-0 truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                {{ isFieldNode(child) ? (child.label ?? child.name) : child.type }}
              </span>
              <button
                v-if="isFieldNode(child)"
                class="shrink-0 flex h-4 w-4 items-center justify-center rounded text-gray-300 dark:text-gray-600 hover:text-red-500 transition-colors"
                @click.stop="removeFieldFromGroup(idx, child.name)"
              >
                &times;
              </button>
            </div>

            <div
              :class="[
                'flex items-center justify-center rounded-md border-2 border-dashed min-h-[48px] transition-colors',
                groupDragOver === idx
                  ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50',
              ]"
            >
              <span class="text-[10px] font-medium" :class="groupDragOver === idx ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-600'">
                {{ node.children.length === 0 ? 'Drop fields here' : '+ Drop more fields' }}
              </span>
            </div>
          </div>

          <div v-if="showIndicator(idx, 'after')" class="h-0.5 -mb-0.5 rounded bg-primary-500" />
        </div>

      </template>

      <!-- Root drop indicator (palette drops only) -->
      <div
        v-if="rootDragOver && reorderFrom === null"
        :key="'drop-indicator'"
        class="flex items-center justify-center rounded-lg border-2 border-dashed border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-950/30 py-4 transition-colors"
      >
        <p class="text-xs font-medium text-primary-500">Drop here</p>
      </div>
    </TransitionGroup>
  </div>
</template>
