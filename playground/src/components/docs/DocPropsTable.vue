<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // DocPropsTable – Reusable props/rules reference table
    // ---------------------------------------------------------------------------

    interface TableRow {
        name: string;
        type?: string;
        def?: string;
        desc: string;
    }

    interface Props {
        columns: string[];
        rows: TableRow[];
    }

    defineProps<Props>();
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
    <table class="min-w-full text-xs">
      <thead class="bg-gray-50 dark:bg-gray-900">
        <tr>
          <th
            v-for="col in columns"
            :key="col"
            class="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
          >
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
        <tr v-for="row in rows" :key="row.name" class="bg-white dark:bg-gray-950">
          <td class="px-4 py-2 font-mono text-primary-600 dark:text-primary-400">{{ row.name }}</td>
          <td v-if="row.type !== undefined" class="px-4 py-2 font-mono text-gray-600 dark:text-gray-400">{{ row.type }}</td>
          <td v-if="row.def !== undefined" class="px-4 py-2 text-gray-500 dark:text-gray-500">{{ row.def }}</td>
          <td class="px-4 py-2 text-gray-600 dark:text-gray-400">{{ row.desc }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
