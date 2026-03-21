<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // BuilderToolbar – Top toolbar for the form builder
    // ---------------------------------------------------------------------------

    import { ref } from "vue";

    interface Props {
        canUndo: boolean;
        canRedo: boolean;
        isPreviewMode: boolean;
    }

    defineProps<Props>();

    const emit = defineEmits<{
        undo: [];
        redo: [];
        "toggle-preview": [];
        export: [];
        clear: [];
    }>();

    const showClearConfirm = ref(false);

    function confirmClear() {
        showClearConfirm.value = false;
        emit("clear");
    }

    const btnCls =
        "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-colors";
    const btnDisabledCls = "opacity-40 pointer-events-none";
</script>

<template>
  <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2">
    <!-- Undo -->
    <button :class="[btnCls, !canUndo && btnDisabledCls]" :disabled="!canUndo" @click="emit('undo')">
      <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
      Undo
    </button>

    <!-- Redo -->
    <button :class="[btnCls, !canRedo && btnDisabledCls]" :disabled="!canRedo" @click="emit('redo')">
      <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
      </svg>
      Redo
    </button>

    <div class="mx-1 h-5 w-px bg-gray-200 dark:bg-gray-700" />

    <!-- Preview toggle -->
    <button
      :class="[
        'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors',
        isPreviewMode
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750',
      ]"
      @click="emit('toggle-preview')"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
      Preview
    </button>

    <div class="flex-1" />

    <!-- Export -->
    <button :class="btnCls" @click="emit('export')">
      <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      Export
    </button>

    <!-- Clear -->
    <div class="relative">
      <button
        class="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 shadow-sm transition-colors"
        @click="showClearConfirm = true"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        Clear
      </button>

      <!-- Confirmation popover -->
      <div
        v-if="showClearConfirm"
        class="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-xl"
      >
        <p class="text-xs font-medium text-gray-900 dark:text-white">Clear all fields?</p>
        <p class="mt-1 text-[11px] text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
        <div class="mt-3 flex items-center justify-end gap-2">
          <button class="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" @click="showClearConfirm = false">
            Cancel
          </button>
          <button class="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors" @click="confirmClear">
            Clear all
          </button>
        </div>
      </div>
      <div v-if="showClearConfirm" class="fixed inset-0 z-40" @click="showClearConfirm = false" />
    </div>
  </div>
</template>
