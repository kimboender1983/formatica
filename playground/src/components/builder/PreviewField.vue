<script setup lang="ts">
    import type { FieldSchema } from "@formatica/vue";
    import { isValidPhoneNumber } from "libphonenumber-js";
    import { computed, inject, onMounted, reactive, ref } from "vue";
    import {
        type PreviewValidationStore,
        PreviewValidationKey,
    } from "../../composables/usePreviewValidation";

    const props = defineProps<{
        field: FieldSchema;
    }>();

    // Shared validation store (provided by parent) or local fallback
    const store = inject<PreviewValidationStore | null>(PreviewValidationKey, null);

    const switchStates = ref<Record<string, boolean>>({});
    const phoneDropdowns = ref<Record<string, boolean>>({});
    const phoneCountries = ref<Record<string, { code: string; flag: string; dial: string }>>({});
    const tagsValues = ref<Record<string, string[]>>({});
    const tagsInputValues = ref<Record<string, string>>({});
    const tagsFocused = ref<Record<string, boolean>>({});

    // Use shared store when available, local reactive objects otherwise
    const _localValues = reactive<Record<string, string>>({});
    const _localErrors = reactive<Record<string, string | null>>({});
    const _localTouched = reactive<Record<string, boolean>>({});

    const fieldValues = computed(() => store?.values ?? _localValues);
    const fieldErrors = computed(() => store?.errors ?? _localErrors);
    const fieldTouched = computed(() => store?.touched ?? _localTouched);

    const fieldId = computed(() => `preview-${props.field.name}`);

    function isEmpty(value: unknown): boolean {
        if (value === null || value === undefined) return true;
        if (typeof value === "string") return value.trim() === "";
        if (typeof value === "boolean") return !value;
        if (Array.isArray(value)) return value.length === 0;
        return false;
    }

    function getFieldValue(name: string): unknown {
        // Check typed stores first, then fall back to string values
        if (name in switchStates.value) return switchStates.value[name];
        if (name in checkboxStates.value) return checkboxStates.value[name];
        if (name in radioValues.value) return radioValues.value[name];
        return fieldValues.value[name] ?? "";
    }

    function validateField(name: string) {
        const field = props.field;
        if (!field.rules) {
            fieldErrors.value[name] = null;
            return;
        }
        const rules = Array.isArray(field.rules)
            ? field.rules
            : typeof field.rules === "string"
              ? field.rules.split("|")
              : [];
        const value = getFieldValue(name);
        const strValue = typeof value === "string" ? value : "";
        for (const rule of rules) {
            const ruleName = typeof rule === "string" ? rule.split(":")[0] : "";
            if (ruleName === "required" && isEmpty(value)) {
                fieldErrors.value[name] = "This field is required";
                return;
            }
            if (ruleName === "phone" && strValue.trim()) {
                const country = getPhoneCountry(name);
                const fullNumber = `${country.dial}${strValue}`;
                if (!isValidPhoneNumber(fullNumber)) {
                    fieldErrors.value[name] = "Please enter a valid phone number";
                    return;
                }
            }
            if (ruleName === "email" && strValue.trim()) {
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strValue)) {
                    fieldErrors.value[name] = "Please enter a valid email address";
                    return;
                }
            }
            if (ruleName === "minLength" && strValue.trim()) {
                const min = Number.parseInt(
                    typeof rule === "string" ? (rule.split(":")[1] ?? "0") : "0",
                );
                if (strValue.length < min) {
                    fieldErrors.value[name] = `Must be at least ${min} characters`;
                    return;
                }
            }
        }
        fieldErrors.value[name] = null;
    }

    // Register this field's validator with the shared store
    onMounted(() => {
        if (store) {
            store.registerValidator(props.field.name, () => {
                validateField(props.field.name);
            });
        }
    });

    function onFieldBlur(name: string) {
        fieldTouched.value[name] = true;
        validateField(name);
    }

    function onFieldInput(name: string, value: string) {
        fieldValues.value[name] = value;
        if (fieldTouched.value[name]) {
            validateField(name);
        }
    }

    // Checkbox / radio state
    const checkboxStates = ref<Record<string, boolean>>({});
    const radioValues = ref<Record<string, string>>({});

    function onCheckboxChange(name: string, checked: boolean) {
        checkboxStates.value[name] = checked;
        fieldTouched.value[name] = true;
        validateField(name);
    }

    function onRadioChange(name: string, value: string) {
        radioValues.value[name] = value;
        fieldTouched.value[name] = true;
        validateField(name);
    }

    function addPreviewTag(fieldName: string, tag: string) {
        const trimmed = tag.trim();
        if (!trimmed) return;
        const current = tagsValues.value[fieldName] ?? [];
        if (current.includes(trimmed)) return;
        tagsValues.value[fieldName] = [...current, trimmed];
        tagsInputValues.value[fieldName] = "";
    }

    function removePreviewTag(fieldName: string, index: number) {
        const current = tagsValues.value[fieldName] ?? [];
        tagsValues.value[fieldName] = current.filter((_, i) => i !== index);
    }

    function onTagsKeydown(e: KeyboardEvent, fieldName: string) {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addPreviewTag(fieldName, tagsInputValues.value[fieldName] ?? "");
            return;
        }
        if (e.key === "Backspace" && (tagsInputValues.value[fieldName] ?? "") === "") {
            const current = tagsValues.value[fieldName] ?? [];
            if (current.length > 0) {
                removePreviewTag(fieldName, current.length - 1);
            }
        }
    }

    const defaultCountries = [
        { code: "US", flag: "\ud83c\uddfa\ud83c\uddf8", dial: "+1", name: "United States" },
        { code: "GB", flag: "\ud83c\uddec\ud83c\udde7", dial: "+44", name: "United Kingdom" },
        { code: "NL", flag: "\ud83c\uddf3\ud83c\uddf1", dial: "+31", name: "Netherlands" },
        { code: "DE", flag: "\ud83c\udde9\ud83c\uddea", dial: "+49", name: "Germany" },
        { code: "FR", flag: "\ud83c\uddeb\ud83c\uddf7", dial: "+33", name: "France" },
        { code: "BE", flag: "\ud83c\udde7\ud83c\uddea", dial: "+32", name: "Belgium" },
        { code: "ES", flag: "\ud83c\uddea\ud83c\uddf8", dial: "+34", name: "Spain" },
        { code: "IT", flag: "\ud83c\uddee\ud83c\uddf9", dial: "+39", name: "Italy" },
        { code: "AU", flag: "\ud83c\udde6\ud83c\uddfa", dial: "+61", name: "Australia" },
        { code: "CA", flag: "\ud83c\udde8\ud83c\udde6", dial: "+1", name: "Canada" },
        { code: "BR", flag: "\ud83c\udde7\ud83c\uddf7", dial: "+55", name: "Brazil" },
        { code: "IN", flag: "\ud83c\uddee\ud83c\uddf3", dial: "+91", name: "India" },
        { code: "JP", flag: "\ud83c\uddef\ud83c\uddf5", dial: "+81", name: "Japan" },
        { code: "CN", flag: "\ud83c\udde8\ud83c\uddf3", dial: "+86", name: "China" },
    ];

    function getPhoneCountry(fieldName: string) {
        return phoneCountries.value[fieldName] ?? defaultCountries[0];
    }

    function togglePhoneDropdown(fieldName: string) {
        phoneDropdowns.value[fieldName] = !phoneDropdowns.value[fieldName];
    }

    function selectPhoneCountry(fieldName: string, country: (typeof defaultCountries)[0]) {
        phoneCountries.value[fieldName] = {
            code: country.code,
            flag: country.flag,
            dial: country.dial,
        };
        phoneDropdowns.value[fieldName] = false;
    }

    function getInputType(field: FieldSchema): string {
        if (field.type === "number") return "number";
        if (field.type === "date") return "date";
        if (field.type === "text" && "inputType" in field && field.inputType)
            return field.inputType;
        return "text";
    }
</script>

<template>
  <div>
    <label
      v-if="!['checkbox', 'switch', 'radio'].includes(field.type)"
      :for="fieldId"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ field.label || field.name }}
      <span v-if="field.required" class="text-red-500">*</span>
    </label>

    <!-- Text / Number / Date -->
    <input
      v-if="['text', 'number', 'date'].includes(field.type)"
      :id="fieldId"
      :type="getInputType(field)"
      :placeholder="field.placeholder"
      :value="fieldValues[field.name] ?? ''"
      :class="[
        'w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-colors',
        fieldTouched[field.name] && fieldErrors[field.name]
          ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
          : 'border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
      ]"
      @input="onFieldInput(field.name, ($event.target as HTMLInputElement).value)"
      @blur="onFieldBlur(field.name)"
    />

    <!-- Textarea -->
    <textarea
      v-else-if="field.type === 'textarea'"
      :id="fieldId"
      :placeholder="field.placeholder"
      rows="3"
      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
    />

    <!-- Select -->
    <select
      v-else-if="field.type === 'select'"
      :id="fieldId"
      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
    >
      <option disabled selected>{{ field.placeholder || 'Select...' }}</option>
      <option v-if="Array.isArray(field.options)" v-for="opt in field.options" :key="String(opt.value)" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <!-- Checkbox -->
    <div v-else-if="field.type === 'checkbox'">
      <div class="flex items-center gap-2">
        <input
          :id="fieldId"
          type="checkbox"
          :checked="!!checkboxStates[field.name]"
          :class="[
            'h-4 w-4 rounded focus:ring-primary-500',
            fieldTouched[field.name] && fieldErrors[field.name]
              ? 'border-red-500 text-red-600'
              : 'border-gray-300 dark:border-gray-600 text-primary-600',
          ]"
          @change="onCheckboxChange(field.name, ($event.target as HTMLInputElement).checked)"
        />
        <label :for="fieldId" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{{ field.label || field.name }}</label>
      </div>
    </div>

    <!-- Switch -->
    <div v-else-if="field.type === 'switch'" class="flex items-center gap-3">
      <button
        :id="fieldId"
        type="button"
        role="switch"
        :aria-checked="!!switchStates[field.name]"
        :class="[
          'relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30',
          switchStates[field.name] ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600',
        ]"
        @click="switchStates[field.name] = !switchStates[field.name]; fieldTouched[field.name] = true; validateField(field.name)"
      >
        <span
          :class="[
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
            switchStates[field.name] ? 'left-[22px]' : 'left-0.5',
          ]"
        />
      </button>
      <label :for="fieldId" class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">{{ field.label || field.name }}</label>
    </div>

    <!-- Radio -->
    <fieldset v-else-if="field.type === 'radio'">
      <legend
        :class="[
          'block text-sm font-medium mb-1',
          fieldTouched[field.name] && fieldErrors[field.name]
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300',
        ]"
      >
        {{ field.label || field.name }}
        <span v-if="field.required" class="text-red-500">*</span>
      </legend>
      <div
        :class="[
          'flex gap-4 rounded-lg p-2 -m-2 transition-colors',
          fieldTouched[field.name] && fieldErrors[field.name] ? 'bg-red-50 dark:bg-red-950/20' : '',
          'inline' in field && field.inline ? '' : 'flex-col gap-2',
        ]"
      >
        <label
          v-if="Array.isArray(field.options)"
          v-for="(opt, oi) in field.options"
          :key="String(opt.value)"
          :for="`${fieldId}-${oi}`"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            :id="`${fieldId}-${oi}`"
            type="radio"
            :name="field.name"
            :value="opt.value"
            :checked="radioValues[field.name] === String(opt.value)"
            class="h-4 w-4 border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
            @change="onRadioChange(field.name, String(opt.value))"
          />
          <span class="text-sm text-gray-700 dark:text-gray-300">{{ opt.label }}</span>
        </label>
      </div>
    </fieldset>

    <!-- Slider -->
    <div v-else-if="field.type === 'slider'" class="pt-1">
      <input
        :id="fieldId"
        type="range"
        :min="field.min ?? 0"
        :max="field.max ?? 100"
        :step="field.step ?? 1"
        :value="field.defaultValue ?? field.min ?? 0"
        class="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 dark:bg-gray-700 accent-primary-500"
      />
      <div class="mt-1 flex justify-between text-[11px] text-gray-400 dark:text-gray-500">
        <span>{{ field.min ?? 0 }}</span>
        <span>{{ field.max ?? 100 }}</span>
      </div>
    </div>

    <!-- Tags -->
    <div v-else-if="field.type === 'tags'">
      <div
        :class="[
          'flex flex-wrap items-center gap-1.5 rounded-lg border bg-white dark:bg-gray-800 px-2.5 py-1.5 min-h-[38px] cursor-text transition-colors',
          fieldTouched[field.name] && fieldErrors[field.name]
            ? 'border-red-500 ring-2 ring-red-500/20'
            : tagsFocused[field.name]
              ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-500/20'
              : 'border-gray-300 dark:border-gray-600',
        ]"
        @click="($refs[`tagsInput-${field.name}`] as HTMLInputElement)?.focus()"
      >
        <span
          v-for="(tag, ti) in (tagsValues[field.name] ?? [])"
          :key="tag"
          class="inline-flex items-center gap-1 rounded-md bg-primary-100 dark:bg-primary-900/40 px-2 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300"
        >
          {{ tag }}
          <button
            type="button"
            class="text-primary-400 hover:text-primary-600 dark:hover:text-primary-200 transition-colors"
            @click.stop="removePreviewTag(field.name, ti)"
          >&times;</button>
        </span>
        <input
          :ref="`tagsInput-${field.name}`"
          :id="fieldId"
          type="text"
          :value="tagsInputValues[field.name] ?? ''"
          :placeholder="(tagsValues[field.name] ?? []).length === 0 ? (field.placeholder || 'Type and press enter...') : ''"
          class="min-w-[80px] flex-1 border-0 bg-transparent p-0 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          @input="tagsInputValues[field.name] = ($event.target as HTMLInputElement).value"
          @keydown="onTagsKeydown($event, field.name)"
          @focus="tagsFocused[field.name] = true"
          @blur="tagsFocused[field.name] = false; onFieldBlur(field.name)"
        />
      </div>
    </div>

    <!-- Phone -->
    <div v-else-if="field.type === 'phone'" class="relative">
      <div
        :class="[
          'flex items-stretch rounded-lg border transition-colors',
          fieldTouched[field.name] && fieldErrors[field.name]
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-gray-300 dark:border-gray-600',
        ]"
      >
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 border-r border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0 cursor-pointer"
          @mousedown.prevent="togglePhoneDropdown(field.name)"
        >
          <span class="text-base leading-none">{{ getPhoneCountry(field.name).flag }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ getPhoneCountry(field.name).dial }}</span>
          <svg
            :class="['h-3 w-3 text-gray-400 transition-transform', phoneDropdowns[field.name] ? 'rotate-180' : '']"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          ><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        <input
          :id="fieldId"
          type="tel"
          :placeholder="field.placeholder || 'Phone number'"
          :value="fieldValues[field.name] ?? ''"
          class="flex-1 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none rounded-r-lg"
          @input="onFieldInput(field.name, ($event.target as HTMLInputElement).value)"
          @blur="onFieldBlur(field.name)"
        />
      </div>
      <!-- Backdrop -->
      <div v-if="phoneDropdowns[field.name]" class="fixed inset-0 z-40" @mousedown="phoneDropdowns[field.name] = false" />
      <!-- Dropdown -->
      <div
        v-if="phoneDropdowns[field.name]"
        class="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden"
      >
        <div class="max-h-48 overflow-y-auto">
          <button
            v-for="c in defaultCountries"
            :key="c.code"
            type="button"
            :class="[
              'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
              getPhoneCountry(field.name).code === c.code
                ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300',
            ]"
            @mousedown.prevent="selectPhoneCountry(field.name, c)"
          >
            <span class="text-lg leading-none">{{ c.flag }}</span>
            <span class="flex-1 truncate text-xs">{{ c.name }}</span>
            <span class="text-[11px] text-gray-400 dark:text-gray-500 font-mono">{{ c.dial }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- File -->
    <div v-else-if="field.type === 'file'" class="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-4">
      <div class="text-center">
        <svg class="mx-auto h-6 w-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ field.accept || 'Upload file' }}</p>
      </div>
    </div>

    <!-- Fallback -->
    <input
      v-else
      :id="fieldId"
      type="text"
      :placeholder="field.placeholder || field.type"
      class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
    />

    <!-- Error message -->
    <p
      v-if="fieldTouched[field.name] && fieldErrors[field.name]"
      class="mt-1 text-xs text-red-500 font-medium"
    >
      {{ fieldErrors[field.name] }}
    </p>

    <!-- Help text -->
    <p v-if="field.helpText && !(fieldTouched[field.name] && fieldErrors[field.name])" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      {{ field.helpText }}
    </p>
  </div>
</template>
