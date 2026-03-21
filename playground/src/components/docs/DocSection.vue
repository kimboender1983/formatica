<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // DocSection – A documentation section with anchor and heading
    // ---------------------------------------------------------------------------

    interface Props {
        id: string;
        title: string;
        description?: string;
    }

    defineProps<Props>();
</script>

<template>
  <section :id="id" class="scroll-mt-8">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
      {{ title }}
    </h2>
    <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
      {{ description }}
    </p>
    <slot />
  </section>
</template>
