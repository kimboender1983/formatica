<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // FieldPalette – Draggable field type cards for the form builder
    // ---------------------------------------------------------------------------

    interface PaletteItem {
        type: string;
        label: string;
        icon: string;
        category: "field" | "layout";
    }

    const fieldItems: PaletteItem[] = [
        { type: "text", label: "Text", icon: "text", category: "field" },
        { type: "number", label: "Number", icon: "number", category: "field" },
        { type: "textarea", label: "Textarea", icon: "textarea", category: "field" },
        { type: "select", label: "Select", icon: "select", category: "field" },
        { type: "checkbox", label: "Checkbox", icon: "checkbox", category: "field" },
        { type: "radio", label: "Radio", icon: "radio", category: "field" },
        { type: "switch", label: "Switch", icon: "switch", category: "field" },
        { type: "date", label: "Date", icon: "date", category: "field" },
        { type: "file", label: "File", icon: "file", category: "field" },
        { type: "slider", label: "Slider", icon: "slider", category: "field" },
        { type: "tags", label: "Tags", icon: "tags", category: "field" },
        { type: "phone", label: "Phone", icon: "phone", category: "field" },
    ];

    const layoutItems: PaletteItem[] = [
        { type: "row", label: "Row", icon: "row2", category: "layout" },
        { type: "group", label: "Group", icon: "group", category: "layout" },
        { type: "divider", label: "Divider", icon: "divider", category: "layout" },
    ];

    function onDragStart(e: DragEvent, item: PaletteItem) {
        if (!e.dataTransfer) return;
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("application/formcraft-field", JSON.stringify(item));
    }
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto scrollbar-thin bg-gray-50 dark:bg-gray-900 p-3">
    <!-- Fields section -->
    <p class="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
      Fields
    </p>
    <div class="mb-4 space-y-1">
      <div
        v-for="item in fieldItems"
        :key="item.type"
        draggable="true"
        @dragstart="onDragStart($event, item)"
        class="flex cursor-grab items-center gap-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
      >
        <!-- Field type icons -->
        <svg class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <!-- text -->
          <template v-if="item.icon === 'text'">
            <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
          </template>
          <!-- number -->
          <template v-else-if="item.icon === 'number'">
            <path d="M4 17l6-10" /><path d="M14 17l6-10" /><path d="M3 12h8" /><path d="M13 12h8" />
          </template>
          <!-- textarea -->
          <template v-else-if="item.icon === 'textarea'">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h10" /><path d="M7 11h10" /><path d="M7 15h6" />
          </template>
          <!-- select -->
          <template v-else-if="item.icon === 'select'">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M8 10l4 4 4-4" />
          </template>
          <!-- checkbox -->
          <template v-else-if="item.icon === 'checkbox'">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" />
          </template>
          <!-- radio -->
          <template v-else-if="item.icon === 'radio'">
            <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
          </template>
          <!-- switch -->
          <template v-else-if="item.icon === 'switch'">
            <rect x="1" y="6" width="22" height="12" rx="6" /><circle cx="16" cy="12" r="3" />
          </template>
          <!-- date -->
          <template v-else-if="item.icon === 'date'">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
          </template>
          <!-- file -->
          <template v-else-if="item.icon === 'file'">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" />
          </template>
          <!-- slider -->
          <template v-else-if="item.icon === 'slider'">
            <path d="M4 12h16" /><circle cx="14" cy="12" r="3" />
          </template>
          <!-- tags -->
          <template v-else-if="item.icon === 'tags'">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </template>
          <!-- phone -->
          <template v-else-if="item.icon === 'phone'">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </template>
        </svg>
        {{ item.label }}
      </div>
    </div>

    <!-- Layout section -->
    <p class="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
      Layout
    </p>
    <div class="space-y-1">
      <div
        v-for="item in layoutItems"
        :key="item.type"
        draggable="true"
        @dragstart="onDragStart($event, item)"
        class="flex cursor-grab items-center gap-2.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 transition-all hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
      >
        <svg class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <!-- row2 -->
          <template v-if="item.icon === 'row2'">
            <rect x="2" y="4" width="9" height="16" rx="1" /><rect x="13" y="4" width="9" height="16" rx="1" />
          </template>
          <!-- row3 -->
          <template v-else-if="item.icon === 'row3'">
            <rect x="1" y="4" width="6" height="16" rx="1" /><rect x="9" y="4" width="6" height="16" rx="1" /><rect x="17" y="4" width="6" height="16" rx="1" />
          </template>
          <!-- group -->
          <template v-else-if="item.icon === 'group'">
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" />
          </template>
          <!-- divider -->
          <template v-else-if="item.icon === 'divider'">
            <path d="M3 12h18" />
          </template>
        </svg>
        {{ item.label }}
      </div>
    </div>
  </div>
</template>
