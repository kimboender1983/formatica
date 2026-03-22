<script setup lang="ts">
    import { computed, ref } from "vue";
    import type { SchemaNode } from "../../types/schema";
    import LayoutRenderer from "./LayoutRenderer.vue";

    const props = withDefaults(
        defineProps<{
            title?: string;
            description?: string;
            collapsible?: boolean;
            collapsed?: boolean;
            children: SchemaNode[];
            className?: string;
        }>(),
        {
            collapsible: false,
            collapsed: false,
        },
    );

    const isCollapsed = ref(props.collapsed);

    function toggle() {
        if (props.collapsible) {
            isCollapsed.value = !isCollapsed.value;
        }
    }

    const headerId = computed(() =>
        props.title ? `fc-group-${props.title.toLowerCase().replace(/\s+/g, "-")}` : undefined,
    );
</script>

<template>
  <fieldset
    :class="[className ?? '']"
    class="rounded-lg border border-gray-200 bg-white"
    :aria-labelledby="headerId"
  >
    <!-- Header -->
    <div
      v-if="title || description"
      class="border-b border-gray-100 px-4 py-3"
    >
      <component
        :is="collapsible ? 'button' : 'div'"
        :type="collapsible ? 'button' : undefined"
        class="flex w-full items-center justify-between text-left"
        :class="collapsible ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded' : ''"
        :aria-expanded="collapsible ? !isCollapsed : undefined"
        :aria-controls="collapsible ? `fc-group-body-${headerId}` : undefined"
        @click="toggle"
      >
        <div>
          <legend
            v-if="title"
            :id="headerId"
            class="text-sm font-semibold text-gray-800"
          >
            {{ title }}
          </legend>
          <p v-if="description" class="mt-0.5 text-xs text-gray-500">
            {{ description }}
          </p>
        </div>
        <svg
          v-if="collapsible"
          class="h-4 w-4 shrink-0 text-gray-400 motion-safe:transition-transform motion-safe:duration-200"
          :class="isCollapsed ? '' : 'rotate-180'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </component>
    </div>

    <!-- Body with accordion animation -->
    <Transition
      enter-active-class="motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out"
      enter-from-class="max-h-0 opacity-0 overflow-hidden"
      enter-to-class="max-h-[2000px] opacity-100 overflow-hidden"
      leave-active-class="motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-in"
      leave-from-class="max-h-[2000px] opacity-100 overflow-hidden"
      leave-to-class="max-h-0 opacity-0 overflow-hidden"
    >
      <div
        v-show="!isCollapsed"
        :id="collapsible ? `fc-group-body-${headerId}` : undefined"
        class="p-4"
      >
        <LayoutRenderer :nodes="children" />
      </div>
    </Transition>
  </fieldset>
</template>
