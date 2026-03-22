<script setup lang="ts">
    import type { FormSchema, ThemeConfig } from "@formatica/vue";
    import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
    import FormPreview from "../components/playground/FormPreview.vue";
    import OutputPanel from "../components/playground/OutputPanel.vue";
    import SchemaEditor from "../components/playground/SchemaEditor.vue";
    import ThemeControls from "../components/playground/ThemeControls.vue";
    import type { ExampleEntry } from "../examples";
    import { examples } from "../examples";

    // ---------------------------------------------------------------------------
    // Event log type
    // ---------------------------------------------------------------------------

    interface EventLogEntry {
        type: string;
        payload: unknown;
        timestamp: number;
    }

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    const currentExample = ref<ExampleEntry>(examples[0]);
    const schema = ref<FormSchema>({ ...examples[0].schema });
    const locale = ref("en");
    const theme = ref<ThemeConfig>({
        name: "playground",
        colors: {
            primary: "#4f46e5",
            error: "#dc2626",
            success: "#059669",
        },
        borders: {
            radius: "0.375rem",
        },
        spacing: {
            inputPaddingX: "0.75rem",
            inputPaddingY: "0.5rem",
        },
        typography: {
            fontSize: "0.875rem",
        },
    });

    // Form output state
    const formValues = reactive<Record<string, unknown>>({});
    const formErrors = reactive<Record<string, string[]>>({});
    const formTouched = reactive<Record<string, boolean>>({});
    const formDirty = reactive<Record<string, boolean>>({});
    const isValid = ref(true);
    const isDirty = ref(false);
    const isSubmitting = ref(false);
    const submitCount = ref(0);
    const eventLog = ref<EventLogEntry[]>([]);

    // Example dropdown
    const exampleDropdownOpen = ref(false);

    // ---------------------------------------------------------------------------
    // Panel resizing
    // ---------------------------------------------------------------------------

    const leftPanelWidth = ref(40); // percentage
    const rightPanelWidth = ref(25); // percentage
    const isResizingLeft = ref(false);
    const isResizingRight = ref(false);
    const containerRef = ref<HTMLElement | null>(null);

    function onLeftResizeStart(e: MouseEvent) {
        e.preventDefault();
        isResizingLeft.value = true;
        document.addEventListener("mousemove", onResizeMove);
        document.addEventListener("mouseup", onResizeEnd);
    }

    function onRightResizeStart(e: MouseEvent) {
        e.preventDefault();
        isResizingRight.value = true;
        document.addEventListener("mousemove", onResizeMove);
        document.addEventListener("mouseup", onResizeEnd);
    }

    function onResizeMove(e: MouseEvent) {
        if (!containerRef.value) return;
        const rect = containerRef.value.getBoundingClientRect();
        const totalWidth = rect.width;
        const x = e.clientX - rect.left;
        const pct = (x / totalWidth) * 100;

        if (isResizingLeft.value) {
            const clamped = Math.min(Math.max(pct, 20), 60);
            leftPanelWidth.value = clamped;
        } else if (isResizingRight.value) {
            const rightStart = 100 - pct;
            const clamped = Math.min(Math.max(rightStart, 15), 45);
            rightPanelWidth.value = clamped;
        }
    }

    function onResizeEnd() {
        isResizingLeft.value = false;
        isResizingRight.value = false;
        document.removeEventListener("mousemove", onResizeMove);
        document.removeEventListener("mouseup", onResizeEnd);
    }

    onUnmounted(() => {
        document.removeEventListener("mousemove", onResizeMove);
        document.removeEventListener("mouseup", onResizeEnd);
    });

    // ---------------------------------------------------------------------------
    // Responsive
    // ---------------------------------------------------------------------------

    const isMobile = ref(false);

    function checkMobile() {
        isMobile.value = window.innerWidth < 1024;
    }

    onMounted(() => {
        checkMobile();
        window.addEventListener("resize", checkMobile);
    });

    onUnmounted(() => {
        window.removeEventListener("resize", checkMobile);
    });

    // ---------------------------------------------------------------------------
    // Example loading
    // ---------------------------------------------------------------------------

    function loadExample(example: ExampleEntry) {
        currentExample.value = example;
        schema.value = { ...example.schema };
        locale.value = "en";
        exampleDropdownOpen.value = false;
        clearFormState();
    }

    function clearFormState() {
        for (const k of Object.keys(formValues)) delete formValues[k];
        for (const k of Object.keys(formErrors)) delete formErrors[k];
        for (const k of Object.keys(formTouched)) delete formTouched[k];
        for (const k of Object.keys(formDirty)) delete formDirty[k];
        isValid.value = true;
        isDirty.value = false;
        isSubmitting.value = false;
        submitCount.value = 0;
        eventLog.value = [];
    }

    function resetPlayground() {
        loadExample(examples[0]);
    }

    // ---------------------------------------------------------------------------
    // Schema editor updates
    // ---------------------------------------------------------------------------

    function onSchemaUpdate(newSchema: FormSchema) {
        schema.value = newSchema;
    }

    // ---------------------------------------------------------------------------
    // Form preview events
    // ---------------------------------------------------------------------------

    function onFormSubmit(values: Record<string, unknown>) {
        submitCount.value++;
        eventLog.value.push({
            type: "submit",
            payload: { values },
            timestamp: Date.now(),
        });
    }

    function onLocaleChange(newLocale: string) {
        locale.value = newLocale;
    }

    function onThemeUpdate(newTheme: ThemeConfig) {
        theme.value = newTheme;
    }

    function clearEvents() {
        eventLog.value = [];
    }
</script>

<template>
  <div class="-m-6 lg:-m-8 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
    <!-- Toolbar -->
    <div
      class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2"
    >
      <!-- Examples dropdown -->
      <div class="relative">
        <button
          @click="exampleDropdownOpen = !exampleDropdownOpen"
          class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-colors"
        >
          <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          {{ currentExample.title }}
          <svg class="h-3 w-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="exampleDropdownOpen"
            class="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-xl"
          >
            <button
              v-for="example in examples"
              :key="example.id"
              @click="loadExample(example)"
              :class="[
                'block w-full px-4 py-2.5 text-left transition-colors',
                example.id === currentExample.id
                  ? 'bg-primary-50 dark:bg-primary-950/50'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
              ]"
            >
              <p
                :class="[
                  'text-sm font-medium',
                  example.id === currentExample.id
                    ? 'text-primary-700 dark:text-primary-300'
                    : 'text-gray-900 dark:text-white',
                ]"
              >
                {{ example.title }}
              </p>
              <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {{ example.description }}
              </p>
              <div class="mt-1.5 flex flex-wrap gap-1">
                <span
                  v-for="tag in example.tags"
                  :key="tag"
                  class="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400"
                >
                  {{ tag }}
                </span>
              </div>
            </button>
          </div>
        </Transition>

        <!-- Click-outside -->
        <div
          v-if="exampleDropdownOpen"
          class="fixed inset-0 z-40"
          @click="exampleDropdownOpen = false"
        />
      </div>

      <!-- Theme controls -->
      <ThemeControls :theme="theme" @update:theme="onThemeUpdate" />

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Reset -->
      <button
        @click="resetPlayground"
        class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-colors"
      >
        <svg class="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        Reset
      </button>
    </div>

    <!-- Panels (desktop: horizontal, mobile: vertical stack) -->
    <div
      v-if="!isMobile"
      ref="containerRef"
      class="flex flex-1 overflow-hidden"
      :class="(isResizingLeft || isResizingRight) ? 'select-none cursor-col-resize' : ''"
    >
      <!-- Schema editor -->
      <div
        class="flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-700"
        :style="{ width: `${leftPanelWidth}%` }"
      >
        <SchemaEditor
          :schema="schema"
          @update:schema="onSchemaUpdate"
        />
      </div>

      <!-- Left resize handle -->
      <div
        class="group relative z-10 w-0 cursor-col-resize"
        @mousedown="onLeftResizeStart"
      >
        <div
          class="absolute inset-y-0 -left-0.5 w-1 bg-transparent transition-colors group-hover:bg-primary-400 dark:group-hover:bg-primary-500"
          :class="isResizingLeft ? 'bg-primary-500 dark:bg-primary-400' : ''"
        />
      </div>

      <!-- Form preview -->
      <div
        class="flex flex-col overflow-hidden"
        :style="{ width: `${100 - leftPanelWidth - rightPanelWidth}%` }"
      >
        <FormPreview
          :schema="schema"
          :locale="locale"
          :theme="theme"
          @submit="onFormSubmit"
          @locale-change="onLocaleChange"
        />
      </div>

      <!-- Right resize handle -->
      <div
        class="group relative z-10 w-0 cursor-col-resize"
        @mousedown="onRightResizeStart"
      >
        <div
          class="absolute inset-y-0 -left-0.5 w-1 bg-transparent transition-colors group-hover:bg-primary-400 dark:group-hover:bg-primary-500"
          :class="isResizingRight ? 'bg-primary-500 dark:bg-primary-400' : ''"
        />
      </div>

      <!-- Output panel -->
      <div
        class="flex flex-col overflow-hidden border-l border-gray-200 dark:border-gray-700"
        :style="{ width: `${rightPanelWidth}%` }"
      >
        <OutputPanel
          :values="formValues"
          :errors="formErrors"
          :touched="formTouched"
          :dirty="formDirty"
          :is-valid="isValid"
          :is-dirty="isDirty"
          :is-submitting="isSubmitting"
          :submit-count="submitCount"
          :events="eventLog"
          @clear-events="clearEvents"
        />
      </div>
    </div>

    <!-- Mobile: stacked layout -->
    <div v-else class="flex flex-1 flex-col overflow-y-auto">
      <!-- Schema editor -->
      <div class="h-[50vh] border-b border-gray-200 dark:border-gray-700">
        <SchemaEditor
          :schema="schema"
          @update:schema="onSchemaUpdate"
        />
      </div>

      <!-- Form preview -->
      <div class="h-[50vh] border-b border-gray-200 dark:border-gray-700">
        <FormPreview
          :schema="schema"
          :locale="locale"
          :theme="theme"
          @submit="onFormSubmit"
          @locale-change="onLocaleChange"
        />
      </div>

      <!-- Output panel -->
      <div class="h-[50vh]">
        <OutputPanel
          :values="formValues"
          :errors="formErrors"
          :touched="formTouched"
          :dirty="formDirty"
          :is-valid="isValid"
          :is-dirty="isDirty"
          :is-submitting="isSubmitting"
          :submit-count="submitCount"
          :events="eventLog"
          @clear-events="clearEvents"
        />
      </div>
    </div>
  </div>
</template>
