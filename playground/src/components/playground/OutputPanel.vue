<script setup lang="ts">
    import { computed, ref } from "vue";

    // ---------------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------------

    interface EventLogEntry {
        type: string;
        payload: unknown;
        timestamp: number;
    }

    // ---------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------

    const props = defineProps<{
        values: Record<string, unknown>;
        errors: Record<string, string[]>;
        touched: Record<string, boolean>;
        dirty: Record<string, boolean>;
        isValid: boolean;
        isDirty: boolean;
        isSubmitting: boolean;
        submitCount: number;
        events: EventLogEntry[];
    }>();

    const emit = defineEmits<{
        "clear-events": [];
    }>();

    // ---------------------------------------------------------------------------
    // State
    // ---------------------------------------------------------------------------

    type TabId = "values" | "errors" | "state" | "events";

    const activeTab = ref<TabId>("values");

    const tabs: { id: TabId; label: string }[] = [
        { id: "values", label: "Values" },
        { id: "errors", label: "Errors" },
        { id: "state", label: "State" },
        { id: "events", label: "Events" },
    ];

    // ---------------------------------------------------------------------------
    // JSON syntax highlighting (simple span-based)
    // ---------------------------------------------------------------------------

    function syntaxHighlight(obj: unknown): string {
        const json = JSON.stringify(obj, null, 2);
        if (!json) return "";

        // Escape HTML entities, then tokenise in a single pass
        const escaped = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        return escaped.replace(
            /("(?:[^"\\]|\\.)*"(?:\s*:)?)|(\b(?:true|false|null)\b)|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)/g,
            (match, str?: string, keyword?: string, num?: string) => {
                if (str) {
                    const cls = str.trimEnd().endsWith(":")
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-amber-600 dark:text-amber-400";
                    return `<span class="${cls}">${match}</span>`;
                }
                if (keyword) {
                    if (match === "null") {
                        return `<span class="text-gray-400 dark:text-gray-500">${match}</span>`;
                    }
                    return `<span class="text-blue-600 dark:text-blue-400">${match}</span>`;
                }
                if (num) {
                    return `<span class="text-emerald-600 dark:text-emerald-400">${match}</span>`;
                }
                return match;
            },
        );
    }

    // ---------------------------------------------------------------------------
    // Computed helpers
    // ---------------------------------------------------------------------------

    const errorCount = computed(() => {
        return Object.values(props.errors).reduce((sum, errs) => sum + errs.length, 0);
    });

    function formatTimestamp(ts: number): string {
        const d = new Date(ts);
        return (
            d.toLocaleTimeString("en-US", {
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }) +
            "." +
            String(d.getMilliseconds()).padStart(3, "0")
        );
    }

    function clearEvents() {
        emit("clear-events");
    }
</script>

<template>
  <div class="flex h-full flex-col overflow-hidden">
    <!-- Tab bar -->
    <div
      class="flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
    >
      <div class="flex flex-1 items-center">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'relative px-3 py-2 text-xs font-medium transition-colors',
            activeTab === tab.id
              ? 'text-primary-700 dark:text-primary-300'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
          ]"
        >
          {{ tab.label }}
          <!-- Error badge -->
          <span
            v-if="tab.id === 'errors' && errorCount > 0"
            class="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 px-1 text-[10px] font-semibold text-red-600 dark:text-red-400"
          >
            {{ errorCount }}
          </span>
          <!-- Events badge -->
          <span
            v-if="tab.id === 'events' && events.length > 0"
            class="ml-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 px-1 text-[10px] font-semibold text-gray-600 dark:text-gray-300"
          >
            {{ events.length }}
          </span>
          <!-- Active indicator -->
          <span
            v-if="activeTab === tab.id"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
          />
        </button>
      </div>

      <!-- Clear button for events tab -->
      <button
        v-if="activeTab === 'events'"
        @click="clearEvents"
        class="mr-2 rounded-md px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      >
        Clear
      </button>
    </div>

    <!-- Tab content -->
    <div class="flex-1 overflow-y-auto scrollbar-thin bg-white dark:bg-gray-900">
      <!-- Values tab -->
      <div v-if="activeTab === 'values'" class="p-4">
        <pre
          class="font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-all"
          v-html="syntaxHighlight(values)"
        />
        <p
          v-if="Object.keys(values).length === 0"
          class="text-xs text-gray-400 dark:text-gray-500 italic"
        >
          No form values yet. Start filling in the form.
        </p>
      </div>

      <!-- Errors tab -->
      <div v-if="activeTab === 'errors'" class="p-4">
        <div v-if="errorCount === 0" class="flex items-center gap-2">
          <svg class="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span class="text-xs text-emerald-600 dark:text-emerald-400 font-medium">No validation errors</span>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(fieldErrors, fieldName) in errors"
            :key="fieldName"
          >
            <template v-if="fieldErrors.length > 0">
              <p class="text-xs font-semibold text-red-600 dark:text-red-400 font-mono">
                {{ fieldName }}
              </p>
              <ul class="mt-1 space-y-0.5 pl-3">
                <li
                  v-for="(msg, i) in fieldErrors"
                  :key="i"
                  class="text-xs text-red-500 dark:text-red-300"
                >
                  {{ msg }}
                </li>
              </ul>
            </template>
          </div>
        </div>
      </div>

      <!-- State tab -->
      <div v-if="activeTab === 'state'" class="p-4">
        <div class="space-y-2">
          <div
            v-for="item in [
              { key: 'isValid', value: isValid, color: isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400' },
              { key: 'isDirty', value: isDirty, color: isDirty ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400' },
              { key: 'isSubmitting', value: isSubmitting, color: isSubmitting ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400' },
              { key: 'submitCount', value: submitCount, color: 'text-gray-700 dark:text-gray-300' },
            ]"
            :key="item.key"
            class="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-800 px-3 py-2"
          >
            <span class="text-xs font-mono font-medium text-gray-600 dark:text-gray-400">{{ item.key }}</span>
            <span :class="['text-xs font-semibold', item.color]">{{ item.value }}</span>
          </div>

          <!-- Touched fields -->
          <div class="mt-4">
            <p class="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Touched fields
            </p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(isTouched, fieldName) in touched"
                :key="String(fieldName)"
                v-show="isTouched"
                class="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-200 dark:ring-blue-800"
              >
                {{ fieldName }}
              </span>
              <span
                v-if="Object.values(touched).every(v => !v)"
                class="text-xs text-gray-400 dark:text-gray-500 italic"
              >
                None
              </span>
            </div>
          </div>

          <!-- Dirty fields -->
          <div class="mt-3">
            <p class="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Dirty fields
            </p>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="(isDirtyField, fieldName) in dirty"
                :key="String(fieldName)"
                v-show="isDirtyField"
                class="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300 ring-1 ring-inset ring-amber-200 dark:ring-amber-800"
              >
                {{ fieldName }}
              </span>
              <span
                v-if="Object.values(dirty).every(v => !v)"
                class="text-xs text-gray-400 dark:text-gray-500 italic"
              >
                None
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Events tab -->
      <div v-if="activeTab === 'events'" class="p-4">
        <div v-if="events.length === 0" class="text-xs text-gray-400 dark:text-gray-500 italic">
          No events recorded yet.
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="(event, i) in [...events].reverse()"
            :key="i"
            class="rounded-lg border border-gray-100 dark:border-gray-800 p-2.5"
          >
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center rounded-md bg-primary-50 dark:bg-primary-950/50 px-1.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:text-primary-300 ring-1 ring-inset ring-primary-200 dark:ring-primary-800">
                {{ event.type }}
              </span>
              <span class="ml-auto text-[10px] font-mono text-gray-400 dark:text-gray-500">
                {{ formatTimestamp(event.timestamp) }}
              </span>
            </div>
            <pre
              v-if="event.payload !== undefined"
              class="mt-1.5 font-mono text-[11px] leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all"
            >{{ JSON.stringify(event.payload, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
