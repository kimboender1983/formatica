<script setup lang="ts">
    import { computed, inject, ref } from "vue";
    import { FormContextKey } from "../../core/useForm";
    import type { FormInstance } from "../../types/form";
    import type { SchemaNode, StepNodeItem } from "../../types/schema";
    import { isFieldNode } from "../../utils/extractFields";
    import LayoutRenderer from "./LayoutRenderer.vue";

    const props = withDefaults(
        defineProps<{
            steps: StepNodeItem[];
            linear?: boolean;
            className?: string;
        }>(),
        {
            linear: false,
        },
    );

    const form = inject<FormInstance>(FormContextKey);

    const currentStep = ref(0);
    const completedSteps = ref<Set<number>>(new Set());

    const visibleSteps = computed(() => props.steps);

    const totalSteps = computed(() => visibleSteps.value.length);
    const isFirstStep = computed(() => currentStep.value === 0);
    const isLastStep = computed(() => currentStep.value === totalSteps.value - 1);

    function getStepFieldNames(step: StepNodeItem): string[] {
        const names: string[] = [];
        function collect(nodes: SchemaNode[]) {
            for (const node of nodes) {
                if (isFieldNode(node)) {
                    names.push(node.name);
                } else if (node.type === "row" || node.type === "group") {
                    collect(node.children);
                } else if (node.type === "steps") {
                    for (const s of node.steps) collect(s.children);
                } else if (node.type === "tabs") {
                    for (const t of node.tabs) collect(t.children);
                }
            }
        }
        collect(step.children);
        return names;
    }

    async function validateCurrentStep(): Promise<boolean> {
        if (!form || !props.linear) return true;
        const step = visibleSteps.value[currentStep.value];
        if (!step) return true;
        const fieldNames = getStepFieldNames(step);
        let allValid = true;
        for (const name of fieldNames) {
            const fieldErrors = await form.validateField(name);
            form.touched[name] = true;
            if (fieldErrors.length > 0) allValid = false;
        }
        return allValid;
    }

    async function goNext() {
        if (isLastStep.value) return;
        if (props.linear) {
            const valid = await validateCurrentStep();
            if (!valid) return;
        }
        completedSteps.value.add(currentStep.value);
        currentStep.value++;
    }

    function goPrevious() {
        if (isFirstStep.value) return;
        currentStep.value--;
    }

    function goToStep(index: number) {
        if (props.linear && index > currentStep.value) return;
        currentStep.value = index;
    }
</script>

<template>
  <div :class="className ?? ''" class="space-y-6">
    <!-- Progress indicator -->
    <nav aria-label="Form steps" class="flex items-center justify-center">
      <ol class="flex items-center gap-0">
        <li
          v-for="(step, idx) in visibleSteps"
          :key="idx"
          class="flex items-center"
        >
          <!-- Step circle -->
          <button
            type="button"
            :disabled="linear && idx > currentStep"
            :aria-current="idx === currentStep ? 'step' : undefined"
            :aria-label="`Step ${idx + 1}: ${step.title}`"
            class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold motion-safe:transition-all motion-safe:duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            :class="[
              completedSteps.has(idx) && idx !== currentStep
                ? 'border-green-500 bg-green-500 text-white'
                : idx !== currentStep
                  ? 'border-gray-300 bg-white text-gray-500'
                  : 'text-white',
              linear && idx > currentStep ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md',
            ]"
            :style="idx === currentStep ? { borderColor: 'var(--fc-color-primary, #3b82f6)', backgroundColor: 'var(--fc-color-primary, #3b82f6)' } : {}"
            @click="goToStep(idx)"
          >
            <!-- Checkmark for completed -->
            <svg
              v-if="completedSteps.has(idx) && idx !== currentStep"
              class="h-4 w-4 motion-safe:transition-transform motion-safe:duration-200"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clip-rule="evenodd"
              />
            </svg>
            <span v-else>{{ idx + 1 }}</span>
          </button>

          <!-- Connector line -->
          <div
            v-if="idx < visibleSteps.length - 1"
            class="mx-1 h-0.5 w-8 motion-safe:transition-colors motion-safe:duration-300 sm:w-12"
            :class="completedSteps.has(idx) ? 'bg-green-500' : 'bg-gray-200'"
          />
        </li>
      </ol>
    </nav>

    <!-- Step title -->
    <div
      v-if="visibleSteps[currentStep]"
      class="text-center"
    >
      <h3 class="text-base font-semibold text-gray-800">
        {{ visibleSteps[currentStep]!.title }}
      </h3>
      <p
        v-if="visibleSteps[currentStep]!.description"
        class="mt-1 text-sm text-gray-500"
      >
        {{ visibleSteps[currentStep]!.description }}
      </p>
    </div>

    <!-- Step content with transition -->
    <Transition
      mode="out-in"
      enter-active-class="motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out"
      enter-from-class="opacity-0 translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="motion-safe:transition-all motion-safe:duration-150 motion-safe:ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-2"
    >
      <div
        v-if="visibleSteps[currentStep]"
        :key="currentStep"
      >
        <LayoutRenderer :nodes="visibleSteps[currentStep]!.children" />
      </div>
    </Transition>

    <!-- Navigation buttons -->
    <div class="flex items-center justify-between border-t border-gray-100 pt-4">
      <button
        type="button"
        :disabled="isFirstStep"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 motion-safe:transition-colors motion-safe:duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 fc-steps-prev-btn"
        @click="goPrevious"
      >
        Previous
      </button>
      <span class="text-xs text-gray-400">
        {{ currentStep + 1 }} / {{ totalSteps }}
      </span>
      <button
        v-if="!isLastStep"
        type="button"
        class="rounded-md px-4 py-2 text-sm font-medium text-white motion-safe:transition-colors motion-safe:duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40 fc-steps-next-btn"
        :style="{ backgroundColor: 'var(--fc-color-primary, #3b82f6)' }"
        @click="goNext"
      >
        Next
      </button>
      <div v-else class="w-[72px]" />
    </div>
  </div>
</template>
