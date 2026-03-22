// ---------------------------------------------------------------------------
// Formatica Core – Types barrel export
// ---------------------------------------------------------------------------

// I18n
export type { I18nContext } from "./i18n";

// Layout
export type {
    ColumnSpan,
    ConditionalLayout,
    DividerLayout,
    DividerNode,
    FieldRef,
    GroupLayout,
    GroupNode,
    HtmlLayout,
    HtmlNode,
    LayoutNode,
    LayoutSchema,
    RowLayout,
    RowNode,
    SchemaNode,
    StepItem,
    StepNodeItem,
    StepsLayout,
    StepsNode,
    TabItem,
    TabNodeItem,
    TabsLayout,
    TabsNode,
} from "./layout";

// Schema
export type {
    CheckboxFieldSchema,
    CheckboxGroupFieldSchema,
    Condition,
    ConditionGroup,
    ConditionOperator,
    DateFieldSchema,
    FieldBase,
    FieldSchema,
    FieldTranslations,
    FileFieldSchema,
    FormContext,
    FormSchema,
    FormSettings,
    FormTranslations,
    HiddenFieldSchema,
    NumberFieldSchema,
    OptionItem,
    PhoneFieldSchema,
    RadioFieldSchema,
    RichTextFieldSchema,
    SelectFieldSchema,
    SliderFieldSchema,
    SwitchFieldSchema,
    TagsFieldSchema,
    TextareaFieldSchema,
    TextFieldSchema,
} from "./schema";

// Theme
export type { ThemeConfig } from "./theme";

// Validation
export type {
    BuiltInRuleName,
    RuleFn,
    SchemaError,
    ValidationRule,
} from "./validation";
