// ---------------------------------------------------------------------------
// FormCraft – Barrel export
// ---------------------------------------------------------------------------

// Components
export { default as FormBuilder } from "./components/FormBuilder.vue";
// Field registry
export {
    FormComponentsKey,
    getFieldComponent,
    getRegisteredFieldTypes,
    hasFieldType,
    registerFieldType,
    unregisterFieldType,
} from "./core/fieldRegistry";
// Rule registry
export {
    getRule,
    hasRule,
    registerRule,
    unregisterRule,
} from "./core/ruleRegistry";
// Schema parser
export { parseFormSchema, SchemaValidationError } from "./core/schemaParser";
export type { UseFormOptions } from "./core/useForm";
// Composables
export { FormContextKey, useForm } from "./core/useForm";
export type { FormI18nInstance, UseFormI18nOptions } from "./core/useFormI18n";
export { FormI18nKey, useFormI18n, useFormI18nContext } from "./core/useFormI18n";
// Types
export type {
    // Validation
    BuiltInRuleName,
    CheckboxFieldSchema,
    CheckboxGroupFieldSchema,
    // Layout
    ColumnSpan,
    Condition,
    ConditionalLayout,
    ConditionGroup,
    ConditionOperator,
    DateFieldSchema,
    DividerLayout,
    DividerNode,
    FieldBase,
    FieldInstance,
    FieldRef,
    FieldSchema,
    FieldTranslations,
    FileFieldSchema,
    // Form
    FormContext,
    FormEvent,
    FormEventName,
    FormEventPayloadMap,
    FormInstance,
    FormSchema,
    FormSettings,
    FormTranslations,
    GroupLayout,
    GroupNode,
    HiddenFieldSchema,
    HtmlLayout,
    HtmlNode,
    // I18n
    I18nContext,
    LayoutNode,
    LayoutSchema,
    NumberFieldSchema,
    // Schema
    OptionItem,
    RadioFieldSchema,
    RichTextFieldSchema,
    RowLayout,
    RowNode,
    RuleFn,
    SchemaError,
    SchemaNode,
    SelectFieldSchema,
    SliderFieldSchema,
    StepItem,
    StepNodeItem,
    StepsLayout,
    StepsNode,
    SubmitHandler,
    SwitchFieldSchema,
    TabItem,
    TabNodeItem,
    TabsLayout,
    TabsNode,
    TagsFieldSchema,
    TextareaFieldSchema,
    TextFieldSchema,
    // Theme
    ThemeConfig,
    ValidationRule,
} from "./types";
// Utilities
export { extractFields, isFieldNode } from "./utils/extractFields";
