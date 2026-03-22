// ---------------------------------------------------------------------------
// Formatica – Schema types
// ---------------------------------------------------------------------------

import type { FormContext } from "./form";
import type { ColumnSpan } from "./layout";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export interface OptionItem {
    label: string;
    value: string | number | boolean;
    disabled?: boolean;
    icon?: string;
    group?: string;
}

// ---------------------------------------------------------------------------
// Conditions
// ---------------------------------------------------------------------------

export type ConditionOperator =
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "in"
    | "notIn"
    | "contains"
    | "empty"
    | "notEmpty"
    | "matches";

export interface Condition {
    field: string;
    operator: ConditionOperator;
    value?: unknown;
}

export interface ConditionGroup {
    and?: (Condition | ConditionGroup)[];
    or?: (Condition | ConditionGroup)[];
}

// ---------------------------------------------------------------------------
// I18n helpers (canonical definition lives in i18n.ts – re-exported here)
// ---------------------------------------------------------------------------

export interface FieldTranslations {
    [locale: string]: {
        label?: string;
        placeholder?: string;
        helpText?: string;
        tooltip?: string;
        errors?: Record<string, string>;
        options?: Record<string, string>;
    };
}

export interface FormTranslations {
    [locale: string]: {
        submit?: string;
        reset?: string;
        cancel?: string;
        next?: string;
        previous?: string;
        messages?: Record<string, string>;
    };
}

// ---------------------------------------------------------------------------
// Field base
// ---------------------------------------------------------------------------

export interface FieldBase {
    /** Unique field identifier used as the key in form values. */
    name: string;
    label?: string;
    placeholder?: string;
    helpText?: string;
    tooltip?: string;
    defaultValue?: unknown;
    disabled?: boolean | ((ctx: FormContext) => boolean);
    visible?: boolean | ((ctx: FormContext) => boolean);
    readOnly?: boolean;
    required?: boolean;
    /** CSS class(es) applied to the field wrapper. */
    className?: string;
    /** Inline styles applied to the field wrapper. */
    style?: Record<string, string>;
    /** Validation rules expressed as shorthand strings or rule objects. */
    rules?: string | string[] | Record<string, unknown>;
    /** Conditional visibility / requirement. */
    condition?: Condition | ConditionGroup;
    /** Per-field translations. */
    translations?: FieldTranslations;
    /** Arbitrary metadata attached by consumers. */
    meta?: Record<string, unknown>;
    /** Column span when this field is inside a RowNode. */
    span?: ColumnSpan;
}

// ---------------------------------------------------------------------------
// Concrete field schemas
// ---------------------------------------------------------------------------

export interface TextFieldSchema extends FieldBase {
    type: "text";
    inputType?: "text" | "email" | "password" | "url" | "tel" | "search";
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    mask?: string;
    prefix?: string;
    suffix?: string;
    autocomplete?: string;
}

export interface NumberFieldSchema extends FieldBase {
    type: "number";
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    prefix?: string;
    suffix?: string;
}

export interface TextareaFieldSchema extends FieldBase {
    type: "textarea";
    rows?: number;
    minLength?: number;
    maxLength?: number;
    autoResize?: boolean;
}

export interface SelectFieldSchema extends FieldBase {
    type: "select";
    options: OptionItem[] | ((ctx: FormContext) => OptionItem[] | Promise<OptionItem[]>);
    multiple?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    maxSelections?: number;
    groupBy?: string;
}

export interface CheckboxFieldSchema extends FieldBase {
    type: "checkbox";
    checkedValue?: unknown;
    uncheckedValue?: unknown;
}

export interface CheckboxGroupFieldSchema extends FieldBase {
    type: "checkbox-group";
    options: OptionItem[] | ((ctx: FormContext) => OptionItem[] | Promise<OptionItem[]>);
    minSelections?: number;
    maxSelections?: number;
    inline?: boolean;
}

export interface RadioFieldSchema extends FieldBase {
    type: "radio";
    options: OptionItem[] | ((ctx: FormContext) => OptionItem[] | Promise<OptionItem[]>);
    inline?: boolean;
}

export interface SwitchFieldSchema extends FieldBase {
    type: "switch";
    checkedValue?: unknown;
    uncheckedValue?: unknown;
    checkedLabel?: string;
    uncheckedLabel?: string;
}

export interface DateFieldSchema extends FieldBase {
    type: "date";
    mode?: "date" | "datetime" | "time" | "month" | "year" | "range";
    format?: string;
    minDate?: string;
    maxDate?: string;
    disabledDates?: string[] | ((date: Date) => boolean);
}

export interface FileFieldSchema extends FieldBase {
    type: "file";
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    dragDrop?: boolean;
}

export interface SliderFieldSchema extends FieldBase {
    type: "slider";
    min?: number;
    max?: number;
    step?: number;
    range?: boolean;
    showTooltip?: boolean;
    marks?: Record<number, string>;
}

export interface TagsFieldSchema extends FieldBase {
    type: "tags";
    maxTags?: number;
    allowCustom?: boolean;
    suggestions?: string[] | ((query: string, ctx: FormContext) => string[] | Promise<string[]>);
    separator?: string;
}

export interface RichTextFieldSchema extends FieldBase {
    type: "richtext";
    toolbar?: string[];
    minLength?: number;
    maxLength?: number;
    outputFormat?: "html" | "markdown" | "text";
}

export interface HiddenFieldSchema extends FieldBase {
    type: "hidden";
}

export interface PhoneFieldSchema extends FieldBase {
    type: "phone";
    /** Default country ISO code (e.g. "NL", "US"). Defaults to "US". */
    defaultCountry?: string;
    /** Restrict to specific country codes. If empty, all countries are shown. */
    countries?: string[];
    /** Whether to show the country flag/selector. Defaults to true. */
    showDialCode?: boolean;
}

// ---------------------------------------------------------------------------
// Discriminated union
// ---------------------------------------------------------------------------

export type FieldSchema =
    | TextFieldSchema
    | NumberFieldSchema
    | TextareaFieldSchema
    | SelectFieldSchema
    | CheckboxFieldSchema
    | CheckboxGroupFieldSchema
    | RadioFieldSchema
    | SwitchFieldSchema
    | DateFieldSchema
    | FileFieldSchema
    | SliderFieldSchema
    | TagsFieldSchema
    | RichTextFieldSchema
    | HiddenFieldSchema
    | PhoneFieldSchema;

// ---------------------------------------------------------------------------
// Form-level settings
// ---------------------------------------------------------------------------

export interface FormSettings {
    layout?: "vertical" | "horizontal" | "inline";
    labelWidth?: string | number;
    labelPosition?: "top" | "left" | "right";
    size?: "small" | "medium" | "large";
    disabled?: boolean;
    readOnly?: boolean;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    validateOnSubmit?: boolean;
    scrollToError?: boolean;
    debounce?: number;
}

// ---------------------------------------------------------------------------
// Top-level form schema
// ---------------------------------------------------------------------------

export interface FormSchema {
    /** Unique schema identifier. */
    id?: string;
    /** Human-readable schema version. */
    version?: string;
    fields: SchemaNode[];
    settings?: FormSettings;
    translations?: FormTranslations;
}

// ---------------------------------------------------------------------------
// Layout container nodes (inline in the schema tree)
// ---------------------------------------------------------------------------

export interface RowNode {
    type: "row";
    children: SchemaNode[];
    gap?: string | number;
    align?: "start" | "center" | "end" | "stretch";
    className?: string;
}

export interface GroupNode {
    type: "group";
    title?: string;
    description?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    children: SchemaNode[];
    className?: string;
    condition?: Condition | ConditionGroup;
}

export interface StepsNode {
    type: "steps";
    steps: StepNodeItem[];
    linear?: boolean;
    className?: string;
}

export interface StepNodeItem {
    title: string;
    description?: string;
    icon?: string;
    children: SchemaNode[];
}

export interface TabsNode {
    type: "tabs";
    tabs: TabNodeItem[];
    className?: string;
}

export interface TabNodeItem {
    title: string;
    icon?: string;
    children: SchemaNode[];
}

export interface DividerNode {
    type: "divider";
    label?: string;
    className?: string;
}

export interface HtmlNode {
    type: "html";
    content: string;
    className?: string;
}

// ---------------------------------------------------------------------------
// Unified schema node – fields AND layout containers
// ---------------------------------------------------------------------------

export type SchemaNode =
    | FieldSchema
    | RowNode
    | GroupNode
    | StepsNode
    | TabsNode
    | DividerNode
    | HtmlNode;
