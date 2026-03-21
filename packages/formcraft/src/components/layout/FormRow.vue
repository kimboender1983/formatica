<script setup lang="ts">
    import { computed } from "vue";
    import type { SchemaNode } from "../../types/schema";
    import LayoutRenderer from "./LayoutRenderer.vue";

    const props = withDefaults(
        defineProps<{
            children: SchemaNode[];
            gap?: string | number;
            align?: "start" | "center" | "end" | "stretch";
            className?: string;
        }>(),
        {
            align: "stretch",
        },
    );

    const alignClass = computed(() => {
        const map: Record<string, string> = {
            start: "items-start",
            center: "items-center",
            end: "items-end",
            stretch: "items-stretch",
        };
        return map[props.align] ?? "items-stretch";
    });

    const gapStyle = computed(() => {
        if (!props.gap) return "";
        return typeof props.gap === "number" ? `${props.gap}px` : props.gap;
    });
</script>

<template>
  <div
    class="grid grid-cols-12"
    :class="[alignClass, className ?? '']"
    :style="gapStyle ? { gap: gapStyle } : { gap: '1rem' }"
    role="group"
  >
    <LayoutRenderer :nodes="children" />
  </div>
</template>
