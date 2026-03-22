<script setup lang="ts">
    import { extractFields, type FieldSchema, type SchemaNode } from "@formcraft/vue";
    import { computed, provide, ref, watch } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import PreviewField from "../components/builder/PreviewField.vue";
    import SchemaExport from "../components/builder/SchemaExport.vue";
    import {
        createPreviewValidation,
        PreviewValidationKey,
    } from "../composables/usePreviewValidation";
    import type { ExampleEntry } from "../examples";
    import { examples } from "../examples";

    const route = useRoute();
    const router = useRouter();

    const selectedId = ref<string | null>((route.params.id as string) ?? null);
    const showSchema = ref(false);
    const submitted = ref(false);
    const submitValid = ref(false);

    const validationStore = createPreviewValidation();
    provide(PreviewValidationKey, validationStore);

    function handleSubmit() {
        const isValid = validationStore.validateAll();
        submitted.value = true;
        submitValid.value = isValid;
    }

    watch(
        () => route.params.id,
        (id) => {
            selectedId.value = (id as string) ?? null;
        },
    );

    const selectedExample = computed<ExampleEntry | null>(
        () => examples.find((e) => e.id === selectedId.value) ?? null,
    );

    function selectExample(id: string) {
        if (selectedId.value === id) {
            selectedId.value = null;
            router.push("/examples");
        } else {
            selectedId.value = id;
            router.push(`/examples/${id}`);
        }
        // Clear validation state when switching
        submitted.value = false;
        submitValid.value = false;
    }

    function tagColor(tag: string): string {
        const colors: Record<string, string> = {
            "Multi-step":
                "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
            i18n: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
            Conditional: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
            Simple: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
            Branching: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
            Tabs: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300",
            Rows: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300",
            Groups: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
            Validation: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300",
            Phone: "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300",
            "Checkbox groups":
                "bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300",
            "File upload":
                "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300",
        };
        return colors[tag] ?? "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }

    function isFieldNode(node: SchemaNode): node is FieldSchema {
        return "name" in node && typeof (node as FieldSchema).name === "string";
    }

    function getSpan(node: SchemaNode): number {
        if (isFieldNode(node) && node.span && typeof node.span === "number") return node.span;
        return 12;
    }
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Examples</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Browse pre-built form examples to see FormCraft in action.
      </p>
    </div>

    <div :class="selectedExample ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''">
      <!-- Cards -->
      <div :class="selectedExample ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'">
        <div
          v-for="example in examples"
          :key="example.id"
          :class="[
            'group cursor-pointer rounded-xl border p-5 transition-all',
            selectedId === example.id
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
          ]"
          @click="selectExample(example.id)"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {{ example.title }}
              </h3>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {{ example.description }}
              </p>
            </div>
            <svg class="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-primary-500 transition-colors mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <div class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="tag in example.tags" :key="tag" :class="['inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium', tagColor(tag)]">
              {{ tag }}
            </span>
          </div>
          <p class="mt-3 text-[11px] text-gray-400 dark:text-gray-500">
            {{ extractFields(example.schema.fields).length }} fields
          </p>
        </div>
      </div>

      <!-- Detail panel -->
      <div v-if="selectedExample" class="space-y-4">
        <div class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
          <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ selectedExample.title }}
            </h3>
            <button
              class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              @click.stop="showSchema = true"
            >
              View schema
            </button>
          </div>

          <!-- Form preview - scrollable -->
          <div class="p-6 max-h-[70vh] overflow-y-auto">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {{ selectedExample.description }}
            </p>
            <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <div class="space-y-3">
                <!-- Recursive node rendering -->
                <template v-for="(node, idx) in selectedExample.schema.fields" :key="idx">

                  <!-- Field -->
                  <PreviewField v-if="isFieldNode(node)" :field="node" />

                  <!-- Row -->
                  <div v-else-if="node.type === 'row'" class="grid grid-cols-12 gap-3">
                    <template v-for="(child, ci) in node.children" :key="ci">
                      <div :style="{ gridColumn: `span ${getSpan(child)}` }">
                        <PreviewField v-if="isFieldNode(child)" :field="child" />
                      </div>
                    </template>
                  </div>

                  <!-- Group -->
                  <fieldset v-else-if="node.type === 'group'" class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <legend v-if="node.title" class="px-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {{ node.title }}
                    </legend>
                    <template v-for="(gc, gi) in node.children" :key="gi">
                      <PreviewField v-if="isFieldNode(gc)" :field="gc" />
                      <div v-else-if="gc.type === 'row'" class="grid grid-cols-12 gap-3">
                        <template v-for="(rc, ri) in gc.children" :key="ri">
                          <div :style="{ gridColumn: `span ${getSpan(rc)}` }">
                            <PreviewField v-if="isFieldNode(rc)" :field="rc" />
                          </div>
                        </template>
                      </div>
                      <hr v-else-if="gc.type === 'divider'" class="border-gray-200 dark:border-gray-700" />
                    </template>
                  </fieldset>

                  <!-- Divider -->
                  <hr v-else-if="node.type === 'divider'" class="border-gray-200 dark:border-gray-700" />

                  <!-- Steps — show all steps with headers -->
                  <template v-else-if="node.type === 'steps'">
                    <template v-for="(step, si) in node.steps" :key="si">
                      <div class="flex items-center gap-2 pt-2">
                        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40 text-[10px] font-bold text-primary-700 dark:text-primary-300">
                          {{ si + 1 }}
                        </span>
                        <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ step.title }}</span>
                      </div>
                      <template v-for="(sc, sci) in step.children" :key="sci">
                        <PreviewField v-if="isFieldNode(sc)" :field="sc" />
                        <div v-else-if="sc.type === 'row'" class="grid grid-cols-12 gap-3">
                          <template v-for="(rc, ri) in sc.children" :key="ri">
                            <div :style="{ gridColumn: `span ${getSpan(rc)}` }">
                              <PreviewField v-if="isFieldNode(rc)" :field="rc" />
                            </div>
                          </template>
                        </div>
                        <hr v-else-if="sc.type === 'divider'" class="border-gray-200 dark:border-gray-700" />
                        <fieldset v-else-if="sc.type === 'group'" class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                          <legend v-if="sc.title" class="px-2 text-xs font-semibold text-gray-700 dark:text-gray-300">{{ sc.title }}</legend>
                          <template v-for="(gc, gi) in sc.children" :key="gi">
                            <PreviewField v-if="isFieldNode(gc)" :field="gc" />
                            <div v-else-if="gc.type === 'row'" class="grid grid-cols-12 gap-3">
                              <template v-for="(rc, ri) in gc.children" :key="ri">
                                <div :style="{ gridColumn: `span ${getSpan(rc)}` }">
                                  <PreviewField v-if="isFieldNode(rc)" :field="rc" />
                                </div>
                              </template>
                            </div>
                            <hr v-else-if="gc.type === 'divider'" class="border-gray-200 dark:border-gray-700" />
                          </template>
                        </fieldset>
                      </template>
                      <hr v-if="si < node.steps.length - 1" class="border-gray-300 dark:border-gray-600 my-1" />
                    </template>
                  </template>

                  <!-- Tabs — show all tabs with headers -->
                  <template v-else-if="node.type === 'tabs'">
                    <template v-for="(tab, ti) in node.tabs" :key="ti">
                      <div class="flex items-center gap-2 pt-2">
                        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-900/40 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                          {{ ti + 1 }}
                        </span>
                        <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ tab.title }}</span>
                      </div>
                      <template v-for="(tc, tci) in tab.children" :key="tci">
                        <PreviewField v-if="isFieldNode(tc)" :field="tc" />
                        <div v-else-if="tc.type === 'row'" class="grid grid-cols-12 gap-3">
                          <template v-for="(rc, ri) in tc.children" :key="ri">
                            <div :style="{ gridColumn: `span ${getSpan(rc)}` }">
                              <PreviewField v-if="isFieldNode(rc)" :field="rc" />
                            </div>
                          </template>
                        </div>
                        <hr v-else-if="tc.type === 'divider'" class="border-gray-200 dark:border-gray-700" />
                        <fieldset v-else-if="tc.type === 'group'" class="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                          <legend v-if="tc.title" class="px-2 text-xs font-semibold text-gray-700 dark:text-gray-300">{{ tc.title }}</legend>
                          <template v-for="(gc, gi) in tc.children" :key="gi">
                            <PreviewField v-if="isFieldNode(gc)" :field="gc" />
                            <div v-else-if="gc.type === 'row'" class="grid grid-cols-12 gap-3">
                              <template v-for="(rc, ri) in gc.children" :key="ri">
                                <div :style="{ gridColumn: `span ${getSpan(rc)}` }">
                                  <PreviewField v-if="isFieldNode(rc)" :field="rc" />
                                </div>
                              </template>
                            </div>
                            <hr v-else-if="gc.type === 'divider'" class="border-gray-200 dark:border-gray-700" />
                          </template>
                        </fieldset>
                      </template>
                      <hr v-if="ti < node.tabs.length - 1" class="border-gray-300 dark:border-gray-600 my-1" />
                    </template>
                  </template>

                </template>
              </div>

              <!-- Submit button + feedback -->
              <div class="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <button
                  class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                  @click="handleSubmit"
                >
                  {{ selectedExample.schema.translations?.en?.submit ?? 'Submit' }}
                </button>
                <p
                  v-if="submitted && submitValid"
                  class="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400"
                >
                  Form submitted successfully!
                </p>
                <p
                  v-if="submitted && !submitValid"
                  class="text-center text-xs font-medium text-red-500"
                >
                  Please fix the errors above before submitting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schema modal -->
    <SchemaExport
      v-if="showSchema && selectedExample"
      :schema="selectedExample.schema"
      @close="showSchema = false"
      @open-in-playground="showSchema = false"
    />
  </div>
</template>
