<script setup lang="ts">
    // ---------------------------------------------------------------------------
    // FieldConfigurator – Right panel for editing a selected field
    // ---------------------------------------------------------------------------

    import type { ConditionOperator, FieldSchema } from "@formatica/vue";
    import { computed, ref, watch } from "vue";

    interface Props {
        field: FieldSchema;
        allFieldNames: string[];
    }

    const props = defineProps<Props>();
    const emit = defineEmits<{ "update:field": [field: FieldSchema] }>();

    // ---------------------------------------------------------------------------
    // Section collapse state
    // ---------------------------------------------------------------------------

    const sections = ref({
        general: true,
        validation: false,
        options: false,
        conditions: false,
        layout: false,
        advanced: false,
    });

    function toggleSection(key: keyof typeof sections.value) {
        sections.value[key] = !sections.value[key];
    }

    // ---------------------------------------------------------------------------
    // Field update helper
    // ---------------------------------------------------------------------------

    function updateField(patch: Record<string, unknown>) {
        emit("update:field", { ...props.field, ...patch } as FieldSchema);
    }

    // ---------------------------------------------------------------------------
    // Options (for select/radio/checkbox-group)
    // ---------------------------------------------------------------------------

    const hasOptions = computed(() =>
        ["select", "radio", "checkbox-group"].includes(props.field.type),
    );

    interface SimpleOption {
        label: string;
        value: string;
    }

    const localOptions = ref<SimpleOption[]>([]);

    watch(
        () => props.field,
        (f) => {
            if (hasOptions.value && "options" in f && Array.isArray(f.options)) {
                localOptions.value = f.options.map((o) => ({
                    label: String(o.label),
                    value: String(o.value),
                }));
            }
        },
        { immediate: true },
    );

    function syncOptions() {
        updateField({
            options: localOptions.value.map((o) => ({ label: o.label, value: o.value })),
        });
    }

    function addOption() {
        localOptions.value.push({
            label: `Option ${localOptions.value.length + 1}`,
            value: `opt_${localOptions.value.length + 1}`,
        });
        syncOptions();
    }

    function removeOption(idx: number) {
        localOptions.value.splice(idx, 1);
        syncOptions();
    }

    // ---------------------------------------------------------------------------
    // Validation rules
    // ---------------------------------------------------------------------------

    // Rules that are locked per field type — always present, can't be removed
    const lockedRulesForType: Record<string, string[]> = {
        phone: ["phone"],
    };

    const lockedRules = computed(() => lockedRulesForType[props.field.type] ?? []);

    // Rules available in the "Add rule" dropdown, filtered by field type
    const availableRules = computed(() => {
        const common = ["required", "min", "max", "minLength", "maxLength", "pattern", "numeric"];
        const typeSpecific: Record<string, string[]> = {
            text: ["email", "url", "alpha", "alphaNumeric"],
            number: ["min", "max", "between"],
            textarea: ["minLength", "maxLength"],
            phone: ["required"],
            select: ["required"],
            checkbox: ["required"],
            radio: ["required"],
            date: ["required"],
            file: ["required", "fileSize", "mimeType"],
            slider: ["required", "min", "max"],
            tags: ["required", "minLength", "maxLength"],
        };
        const specific = typeSpecific[props.field.type] ?? common;
        // Merge, deduplicate, and exclude locked rules
        const all = [...new Set([...specific, ...common])];
        return all.filter((r) => !lockedRules.value.includes(r));
    });

    const localRules = ref<string[]>([]);

    watch(
        () => props.field.rules,
        (r) => {
            if (Array.isArray(r)) localRules.value = [...r];
            else if (typeof r === "string") localRules.value = r ? [r] : [];
            else localRules.value = [];
        },
        { immediate: true },
    );

    // Ensure locked rules are always in the list
    watch(
        lockedRules,
        (locked) => {
            let changed = false;
            for (const rule of locked) {
                if (!localRules.value.includes(rule)) {
                    localRules.value.push(rule);
                    changed = true;
                }
            }
            if (changed) updateField({ rules: [...localRules.value] });
        },
        { immediate: true },
    );

    function addRule(rule: string) {
        if (!localRules.value.includes(rule)) {
            localRules.value.push(rule);
            updateField({ rules: [...localRules.value] });
        }
    }

    function removeRule(idx: number) {
        const rule = localRules.value[idx];
        // Don't allow removing locked rules
        if (rule && lockedRules.value.includes(rule)) return;
        localRules.value.splice(idx, 1);
        updateField({ rules: [...localRules.value] });
    }

    function isRuleLocked(rule: string): boolean {
        return lockedRules.value.includes(rule);
    }

    // ---------------------------------------------------------------------------
    // Conditions
    // ---------------------------------------------------------------------------

    interface SimpleCondition {
        field: string;
        operator: ConditionOperator;
        value: string;
    }

    const localConditions = ref<SimpleCondition[]>([]);
    const conditionOperators: ConditionOperator[] = [
        "eq",
        "neq",
        "gt",
        "gte",
        "lt",
        "lte",
        "contains",
        "empty",
        "notEmpty",
    ];

    function addCondition() {
        localConditions.value.push({ field: "", operator: "eq", value: "" });
    }

    function removeCondition(idx: number) {
        localConditions.value.splice(idx, 1);
        syncConditions();
    }

    function syncConditions() {
        if (localConditions.value.length === 0) {
            updateField({ condition: undefined });
        } else if (localConditions.value.length === 1) {
            const c = localConditions.value[0];
            updateField({ condition: { field: c.field, operator: c.operator, value: c.value } });
        } else {
            updateField({
                condition: {
                    and: localConditions.value.map((c) => ({
                        field: c.field,
                        operator: c.operator,
                        value: c.value,
                    })),
                },
            });
        }
    }

    // ---------------------------------------------------------------------------
    // Input classes
    // ---------------------------------------------------------------------------

    const inputCls =
        "w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors";
    const labelCls = "block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1";
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto scrollbar-thin bg-gray-50 dark:bg-gray-900 p-3 space-y-1">
    <p class="mb-2 text-xs font-semibold text-gray-900 dark:text-white truncate">
      {{ field.label || field.name }}
    </p>

    <!-- General -->
    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button class="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750" @click="toggleSection('general')">
        General
        <span class="text-gray-400">{{ sections.general ? '\u25B2' : '\u25BC' }}</span>
      </button>
      <div v-if="sections.general" class="space-y-3 px-3 pb-3">
        <div>
          <label :class="labelCls">Label</label>
          <input :class="inputCls" :value="field.label" @input="updateField({ label: ($event.target as HTMLInputElement).value })" placeholder="Field label" />
        </div>
        <div>
          <label :class="labelCls">Placeholder</label>
          <input :class="inputCls" :value="field.placeholder" @input="updateField({ placeholder: ($event.target as HTMLInputElement).value })" placeholder="Placeholder text" />
        </div>
        <div>
          <label :class="labelCls">Help text</label>
          <input :class="inputCls" :value="field.helpText" @input="updateField({ helpText: ($event.target as HTMLInputElement).value })" placeholder="Help text" />
        </div>
      </div>
    </div>

    <!-- Validation -->
    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button class="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750" @click="toggleSection('validation')">
        Validation
        <span class="text-gray-400">{{ sections.validation ? '\u25B2' : '\u25BC' }}</span>
      </button>
      <div v-if="sections.validation" class="space-y-2 px-3 pb-3">
        <div v-for="(rule, idx) in localRules" :key="idx" class="flex items-center gap-2">
          <span
            :class="[
              'flex-1 rounded px-2 py-1 text-xs font-mono',
              isRuleLocked(rule)
                ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
            ]"
          >
            {{ rule }}
            <span v-if="isRuleLocked(rule)" class="ml-1 text-[9px] text-primary-400 dark:text-primary-500 uppercase">locked</span>
          </span>
          <button
            v-if="!isRuleLocked(rule)"
            class="text-red-400 hover:text-red-600 text-xs"
            @click="removeRule(idx)"
          >&times;</button>
        </div>
        <select :class="inputCls" @change="addRule(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
          <option value="" disabled selected>Add rule...</option>
          <option v-for="r in availableRules" :key="r" :value="r" :disabled="localRules.includes(r)">{{ r }}</option>
        </select>
      </div>
    </div>

    <!-- Options -->
    <div v-if="hasOptions" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button class="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750" @click="toggleSection('options')">
        Options
        <span class="text-gray-400">{{ sections.options ? '\u25B2' : '\u25BC' }}</span>
      </button>
      <div v-if="sections.options" class="space-y-2 px-3 pb-3">
        <div v-for="(opt, idx) in localOptions" :key="idx" class="flex items-center gap-1.5">
          <input :class="inputCls" v-model="opt.label" placeholder="Label" @change="syncOptions()" class="!py-1" />
          <input :class="inputCls" v-model="opt.value" placeholder="Value" @change="syncOptions()" class="!py-1" />
          <button class="shrink-0 text-red-400 hover:text-red-600 text-xs" @click="removeOption(idx)">&times;</button>
        </div>
        <button class="w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors" @click="addOption">
          + Add option
        </button>
      </div>
    </div>

    <!-- Conditions -->
    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button class="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750" @click="toggleSection('conditions')">
        Conditions
        <span class="text-gray-400">{{ sections.conditions ? '\u25B2' : '\u25BC' }}</span>
      </button>
      <div v-if="sections.conditions" class="space-y-2 px-3 pb-3">
        <div v-for="(cond, idx) in localConditions" :key="idx" class="space-y-1.5 rounded-lg bg-gray-50 dark:bg-gray-750 p-2">
          <div class="flex items-center gap-1.5">
            <select :class="inputCls" v-model="cond.field" @change="syncConditions()" class="!py-1">
              <option value="" disabled>Field...</option>
              <option v-for="fn in allFieldNames" :key="fn" :value="fn">{{ fn }}</option>
            </select>
            <button class="shrink-0 text-red-400 hover:text-red-600 text-xs" @click="removeCondition(idx)">&times;</button>
          </div>
          <div class="flex items-center gap-1.5">
            <select :class="inputCls" v-model="cond.operator" @change="syncConditions()" class="!py-1">
              <option v-for="op in conditionOperators" :key="op" :value="op">{{ op }}</option>
            </select>
            <input :class="inputCls" v-model="cond.value" placeholder="Value" @input="syncConditions()" class="!py-1" />
          </div>
        </div>
        <button class="w-full rounded-lg border border-dashed border-gray-300 dark:border-gray-600 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors" @click="addCondition">
          + Add condition
        </button>
      </div>
    </div>

    <!-- Advanced -->
    <div class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <button class="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750" @click="toggleSection('advanced')">
        Advanced
        <span class="text-gray-400">{{ sections.advanced ? '\u25B2' : '\u25BC' }}</span>
      </button>
      <div v-if="sections.advanced" class="space-y-3 px-3 pb-3">
        <label class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
          <input type="checkbox" :checked="!!field.disabled" @change="updateField({ disabled: ($event.target as HTMLInputElement).checked })" class="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
          Disabled
        </label>
        <div>
          <label :class="labelCls">Default value</label>
          <input :class="inputCls" :value="field.defaultValue != null ? String(field.defaultValue) : ''" @input="updateField({ defaultValue: ($event.target as HTMLInputElement).value })" placeholder="Default value" />
        </div>
      </div>
    </div>
  </div>
</template>
