<script setup lang="ts">
    import { computed, inject } from "vue";
    import { getFieldComponent } from "../core/fieldRegistry";
    import { evaluateCondition } from "../core/useConditions";
    import { FormContextKey } from "../core/useForm";
    import type { FormInstance } from "../types/form";
    import type { FieldSchema } from "../types/schema";
    import { extractFields } from "../utils/extractFields";
    import BaseField from "./BaseField.vue";

    const props = defineProps<{
        name: string;
    }>();

    const form = inject<FormInstance>(FormContextKey);
    if (!form) {
        throw new Error(
            "FormField must be used inside a FormBuilder (FormContextKey not provided)",
        );
    }

    const fieldSchema = computed<FieldSchema | undefined>(() =>
        extractFields(form.schema.fields).find((f) => f.name === props.name),
    );

    const inputComponent = computed(() => {
        const schema = fieldSchema.value;
        if (!schema) return undefined;
        return getFieldComponent(schema.type);
    });

    const fieldValue = computed(() => form.values[props.name]);
    const fieldErrors = computed(() => form.errors[props.name] ?? []);
    const fieldTouched = computed(() => form.touched[props.name] ?? false);

    const isVisible = computed(() => {
        const schema = fieldSchema.value;
        if (!schema) return false;

        if (schema.condition) {
            return evaluateCondition(schema.condition, form.values);
        }
        if (typeof schema.visible === "function") {
            return schema.visible({
                values: { ...form.values },
                getFieldValue: (name: string) => form.values[name],
            });
        }
        return schema.visible ?? true;
    });

    const isDisabled = computed(() => {
        const schema = fieldSchema.value;
        if (!schema) return false;

        if (typeof schema.disabled === "function") {
            return schema.disabled({
                values: { ...form.values },
                getFieldValue: (name: string) => form.values[name],
            });
        }
        return schema.disabled ?? false;
    });

    const inputProps = computed(() => {
        const schema = fieldSchema.value;
        if (!schema) return {};

        const {
            name: _,
            label: _l,
            helpText: _h,
            tooltip: _t,
            condition: _c,
            translations: _tr,
            meta: _m,
            rules: _r,
            visible: _v,
            className: _cn,
            style: _s,
            defaultValue: _dv,
            ...rest
        } = schema;

        return {
            ...rest,
            modelValue: fieldValue.value,
            disabled: isDisabled.value,
            readonly: schema.readOnly ?? false,
            placeholder: schema.placeholder ?? "",
        };
    });

    function onUpdateModelValue(value: unknown) {
        form.setFieldValue(props.name, value);
    }

    function onBlur() {
        form.touched[props.name] = true;
        if (form.schema.settings?.validateOnBlur !== false) {
            form.validateField(props.name);
        }
    }
</script>

<template>
  <Transition
    enter-active-class="motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out"
    enter-from-class="opacity-0 max-h-0"
    enter-to-class="opacity-100 max-h-96"
    leave-active-class="motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-in"
    leave-from-class="opacity-100 max-h-96"
    leave-to-class="opacity-0 max-h-0"
  >
    <BaseField
      v-if="isVisible && fieldSchema"
      :field-schema="fieldSchema"
      :field-name="name"
      :errors="fieldErrors"
      :touched="fieldTouched"
    >
      <component
        :is="inputComponent"
        v-if="inputComponent"
        v-bind="inputProps"
        :aria-invalid="fieldTouched && fieldErrors.length > 0 ? true : undefined"
        :aria-describedby="fieldTouched && fieldErrors.length > 0 ? `fc-error-${name}` : undefined"
        @update:model-value="onUpdateModelValue"
        @blur="onBlur"
      />
      <div
        v-else
        class="rounded-md border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-700"
      >
        No component registered for field type "{{ fieldSchema.type }}"
      </div>
    </BaseField>
  </Transition>
</template>
