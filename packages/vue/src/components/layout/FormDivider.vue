<script setup lang="ts">
    defineProps<{
        label?: string;
        className?: string;
    }>();
</script>

<template>
  <div
    :class="className ?? ''"
    class="relative my-4"
    role="separator"
  >
    <div class="absolute inset-0 flex items-center" aria-hidden="true">
      <div class="w-full border-t border-gray-200" />
    </div>
    <div v-if="label" class="relative flex justify-center">
      <span class="bg-white px-3 text-xs text-gray-500">
        {{ label }}
      </span>
    </div>
  </div>
</template>
