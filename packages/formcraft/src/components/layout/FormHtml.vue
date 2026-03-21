<script setup lang="ts">
    import { computed } from "vue";
    import { sanitizeHtml } from "../../utils/sanitize";

    const props = defineProps<{
        content: string;
        className?: string;
    }>();

    const sanitized = computed(() => sanitizeHtml(props.content));
</script>

<template>
  <div
    :class="className ?? ''"
    class="fc-html prose prose-sm max-w-none text-gray-700"
    v-html="sanitized"
  />
</template>
