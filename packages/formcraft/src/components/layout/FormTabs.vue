<script setup lang="ts">
    import { computed, ref } from "vue";
    import type { TabNodeItem } from "../../types/schema";
    import LayoutRenderer from "./LayoutRenderer.vue";

    const props = defineProps<{
        tabs: TabNodeItem[];
        className?: string;
    }>();

    const activeIndex = ref(0);

    const visibleTabs = computed(() => props.tabs);

    function selectTab(index: number) {
        const tab = visibleTabs.value[index];
        if (tab?.disabled) return;
        activeIndex.value = index;
    }

    function onKeydown(event: KeyboardEvent, index: number) {
        const count = visibleTabs.value.length;
        let nextIndex = index;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
            event.preventDefault();
            nextIndex = (index + 1) % count;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
            event.preventDefault();
            nextIndex = (index - 1 + count) % count;
        } else if (event.key === "Home") {
            event.preventDefault();
            nextIndex = 0;
        } else if (event.key === "End") {
            event.preventDefault();
            nextIndex = count - 1;
        } else {
            return;
        }

        // Skip disabled tabs
        while (visibleTabs.value[nextIndex]?.disabled && nextIndex !== index) {
            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                nextIndex = (nextIndex - 1 + count) % count;
            } else {
                nextIndex = (nextIndex + 1) % count;
            }
        }

        selectTab(nextIndex);
        const tabEl = document.getElementById(`fc-tab-${nextIndex}`);
        tabEl?.focus();
    }

    const tabPanelId = computed(() => `fc-tabpanel-${activeIndex.value}`);
</script>

<template>
  <div :class="className ?? ''">
    <!-- Tab bar -->
    <div
      class="relative flex border-b border-gray-200"
      role="tablist"
      aria-orientation="horizontal"
    >
      <button
        v-for="(tab, idx) in visibleTabs"
        :key="idx"
        :id="`fc-tab-${idx}`"
        type="button"
        role="tab"
        :aria-selected="idx === activeIndex"
        :aria-controls="tabPanelId"
        :aria-disabled="tab.disabled || undefined"
        :tabindex="idx === activeIndex ? 0 : -1"
        class="relative px-4 py-2.5 text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/40"
        :class="[
          idx === activeIndex
            ? 'text-blue-600'
            : tab.disabled
              ? 'cursor-not-allowed text-gray-300'
              : 'text-gray-500 hover:text-gray-700',
        ]"
        @click="selectTab(idx)"
        @keydown="onKeydown($event, idx)"
      >
        {{ tab.title }}
        <!-- Active underline indicator -->
        <span
          v-if="idx === activeIndex"
          class="absolute inset-x-0 -bottom-px h-0.5 bg-blue-500 motion-safe:transition-all motion-safe:duration-200"
        />
      </button>
    </div>

    <!-- Tab panel -->
    <Transition
      mode="out-in"
      enter-active-class="motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div
        v-if="visibleTabs[activeIndex]"
        :key="activeIndex"
        :id="tabPanelId"
        role="tabpanel"
        :aria-labelledby="`fc-tab-${activeIndex}`"
        tabindex="0"
        class="pt-4"
      >
        <LayoutRenderer :nodes="visibleTabs[activeIndex].children" />
      </div>
    </Transition>
  </div>
</template>
