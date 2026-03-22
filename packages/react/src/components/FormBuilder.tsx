// ---------------------------------------------------------------------------
// Formatica React – FormBuilder component (matches Vue FormBuilder styling)
// ---------------------------------------------------------------------------

import type { ComponentType, FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useFormaticaConfig } from "./FormaticaProvider";
import type {
    DividerNode,
    FieldSchema,
    FormSchema,
    GroupNode,
    OptionItem,
    RowNode,
    SchemaNode,
    StepNodeItem,
    StepsNode,
    TabNodeItem,
    TabsNode,
    ThemeConfig,
} from "@formatica/core";
import { isFieldNode } from "@formatica/core";
import { useForm } from "../hooks/useForm";
import type { FormInstance } from "../hooks/useForm";
import { FormContext } from "../hooks/useFormContext";
import { BaseField } from "./BaseField";
import { TextField } from "./fields/TextField";
import { NumberField } from "./fields/NumberField";
import { TextareaField } from "./fields/TextareaField";
import { SelectField } from "./fields/SelectField";
import { CheckboxField } from "./fields/CheckboxField";
import { RadioField } from "./fields/RadioField";
import { SwitchField } from "./fields/SwitchField";
import { SliderField } from "./fields/SliderField";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FieldComponentProps {
    field: FieldSchema;
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur: () => void;
    errors: string[];
    disabled: boolean;
}

export interface FormBuilderProps {
    schema: FormSchema;
    onSubmit?: (values: Record<string, unknown>) => void | Promise<void>;
    onError?: (errors: Record<string, string[]>) => void;
    locale?: string;
    fallbackLocale?: string;
    theme?: ThemeConfig;
    components?: Record<string, ComponentType<FieldComponentProps>>;
    className?: string;
}

// ---------------------------------------------------------------------------
// Theme helpers
// ---------------------------------------------------------------------------

function camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function buildCssVars(theme?: ThemeConfig): React.CSSProperties {
    if (!theme) return {};
    const vars: Record<string, string> = {};

    if (theme.colors) {
        for (const [key, value] of Object.entries(theme.colors)) {
            if (value) vars[`--fc-color-${camelToKebab(key)}`] = value;
        }
    }
    if (theme.typography) {
        for (const [key, value] of Object.entries(theme.typography)) {
            if (value) vars[`--fc-${camelToKebab(key)}`] = value;
        }
    }
    if (theme.spacing) {
        for (const [key, value] of Object.entries(theme.spacing)) {
            if (value) vars[`--fc-${camelToKebab(key)}`] = value;
        }
    }
    if (theme.borders) {
        for (const [key, value] of Object.entries(theme.borders)) {
            if (value) vars[`--fc-border-${camelToKebab(key)}`] = value;
        }
    }
    if (theme.shadows) {
        for (const [key, value] of Object.entries(theme.shadows)) {
            if (value) vars[`--fc-shadow-${camelToKebab(key)}`] = value;
        }
    }
    if (theme.transitions) {
        for (const [key, value] of Object.entries(theme.transitions)) {
            if (value) vars[`--fc-transition-${camelToKebab(key)}`] = value;
        }
    }
    if (theme.cssVars) {
        Object.assign(vars, theme.cssVars);
    }

    return vars as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Translation helpers
// ---------------------------------------------------------------------------

function getTranslation(
    schema: FormSchema,
    key: string,
    locale: string,
    fallbackLocale: string,
    fallback: string,
): string {
    const translations = schema.translations;
    if (!translations) return fallback;
    const loc = translations[locale];
    if (loc?.messages?.[key]) return loc.messages[key];
    const fb = translations[fallbackLocale];
    return fb?.messages?.[key] ?? fallback;
}

function getActionLabel(
    schema: FormSchema,
    key: "submit" | "reset",
    locale: string,
    fallbackLocale: string,
    fallback: string,
): string {
    const translations = schema.translations;
    if (!translations) return fallback;
    const loc = translations[locale];
    if (loc?.[key]) return loc[key];
    const fb = translations[fallbackLocale];
    return fb?.[key] ?? fallback;
}

// ---------------------------------------------------------------------------
// Default field registry
// ---------------------------------------------------------------------------

function resolveOptions(
    options:
        | OptionItem[]
        | ((...args: unknown[]) => OptionItem[] | Promise<OptionItem[]>)
        | undefined,
): OptionItem[] {
    if (Array.isArray(options)) return options;
    return [];
}

function DefaultFieldRenderer({ field, value, onChange, onBlur, disabled }: FieldComponentProps) {
    switch (field.type) {
        case "text":
            return (
                <TextField
                    value={String(value ?? "")}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    inputType={field.inputType}
                    readOnly={field.readOnly}
                />
            );
        case "number":
            return (
                <NumberField
                    value={value as number | null}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    readOnly={field.readOnly}
                />
            );
        case "textarea":
            return (
                <TextareaField
                    value={String(value ?? "")}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    rows={field.rows}
                    readOnly={field.readOnly}
                />
            );
        case "select":
            return (
                <SelectField
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    placeholder={field.placeholder}
                    options={resolveOptions(field.options)}
                />
            );
        case "checkbox":
            return (
                <CheckboxField
                    value={Boolean(value)}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                />
            );
        case "radio":
            return (
                <RadioField
                    name={field.name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    options={resolveOptions(field.options)}
                />
            );
        case "switch":
            return (
                <SwitchField
                    value={Boolean(value)}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                />
            );
        case "slider":
            return (
                <SliderField
                    value={value as number | null}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                />
            );
        default:
            return (
                <TextField
                    value={String(value ?? "")}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    placeholder={field.placeholder}
                />
            );
    }
}

// ---------------------------------------------------------------------------
// Node renderers
// ---------------------------------------------------------------------------

function getSpanStyle(span: number | string | undefined): React.CSSProperties {
    if (span === "full") return { gridColumn: "1 / -1" };
    if (span === "auto") return { gridColumn: "auto" };
    if (typeof span === "number") return { gridColumn: `span ${span} / span ${span}` };
    return { gridColumn: "span 12 / span 12" };
}

function renderField(
    field: FieldSchema,
    form: FormInstance,
    components?: Record<string, ComponentType<FieldComponentProps>>,
): ReactNode {
    const fieldErrors = form.errors[field.name] ?? [];
    const disabled = field.disabled === true || false;

    const props: FieldComponentProps = {
        field,
        value: form.values[field.name],
        onChange: (v: unknown) => form.setFieldValue(field.name, v),
        onBlur: () => form.validateField(field.name),
        errors: fieldErrors,
        disabled,
    };

    const CustomComponent = components?.[field.type];
    const FieldComponent = CustomComponent ?? DefaultFieldRenderer;

    return (
        <BaseField
            key={field.name}
            label={field.label}
            required={field.required}
            errors={fieldErrors}
            touched={form.touched[field.name]}
            helpText={field.helpText}
            tooltip={field.tooltip}
            disabled={field.disabled}
            readOnly={field.readOnly}
            fieldName={field.name}
            className={field.className}
            style={field.style as React.CSSProperties}
        >
            <FieldComponent {...props} />
        </BaseField>
    );
}

function renderRow(
    node: RowNode,
    form: FormInstance,
    components?: Record<string, ComponentType<FieldComponentProps>>,
): ReactNode {
    const alignMap: Record<string, string> = {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
    };
    const alignClass = alignMap[node.align ?? "stretch"] ?? "items-stretch";
    const gapStyle =
        node.gap !== undefined
            ? typeof node.gap === "number"
                ? `${node.gap}px`
                : node.gap
            : "1rem";

    return (
        <div
            className={`grid grid-cols-12 ${alignClass} ${node.className ?? ""}`}
            style={{ gap: gapStyle }}
            role="group"
        >
            {node.children.map((child, i) => (
                <div
                    key={isFieldNode(child) ? child.name : `row-child-${i}`}
                    style={getSpanStyle(isFieldNode(child) ? child.span : undefined)}
                >
                    {renderNode(child, form, components)}
                </div>
            ))}
        </div>
    );
}

function RenderGroup({
    node,
    form,
    components,
}: {
    node: GroupNode;
    form: FormInstance;
    components?: Record<string, ComponentType<FieldComponentProps>>;
}): React.ReactElement {
    const [isCollapsed, setIsCollapsed] = useState(node.collapsed ?? false);
    const headerId = node.title
        ? `fc-group-${node.title.toLowerCase().replace(/\s+/g, "-")}`
        : undefined;

    function toggle() {
        if (node.collapsible) setIsCollapsed(!isCollapsed);
    }

    const HeaderTag = node.collapsible ? "button" : "div";

    return (
        <fieldset
            className={`rounded-lg border border-gray-200 bg-white ${node.className ?? ""}`}
            aria-labelledby={headerId}
        >
            {/* Header */}
            {(node.title || node.description) && (
                <div className="border-b border-gray-100 px-4 py-3">
                    <HeaderTag
                        type={node.collapsible ? "button" : undefined}
                        className={`flex w-full items-center justify-between text-left ${node.collapsible ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded" : ""}`}
                        aria-expanded={node.collapsible ? !isCollapsed : undefined}
                        aria-controls={node.collapsible ? `fc-group-body-${headerId}` : undefined}
                        onClick={toggle}
                    >
                        <div>
                            {node.title && (
                                <legend
                                    id={headerId}
                                    className="text-sm font-semibold text-gray-800"
                                >
                                    {node.title}
                                </legend>
                            )}
                            {node.description && (
                                <p className="mt-0.5 text-xs text-gray-500">{node.description}</p>
                            )}
                        </div>
                        {node.collapsible && (
                            <svg
                                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isCollapsed ? "" : "rotate-180"}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                    </HeaderTag>
                </div>
            )}

            {/* Body */}
            {!isCollapsed && (
                <div
                    id={node.collapsible ? `fc-group-body-${headerId}` : undefined}
                    className="p-4"
                >
                    {node.children.map((child, i) => (
                        <div key={isFieldNode(child) ? child.name : `group-child-${i}`}>
                            {renderNode(child, form, components)}
                        </div>
                    ))}
                </div>
            )}
        </fieldset>
    );
}

function RenderSteps({
    node,
    form,
    components,
}: {
    node: StepsNode;
    form: FormInstance;
    components?: Record<string, ComponentType<FieldComponentProps>>;
}): React.ReactElement {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

    const steps = node.steps;
    const totalSteps = steps.length;
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    function goNext() {
        if (isLastStep) return;
        setCompletedSteps((prev) => {
            const next = new Set(prev);
            next.add(currentStep);
            return next;
        });
        setCurrentStep((prev) => prev + 1);
    }

    function goPrevious() {
        if (isFirstStep) return;
        setCurrentStep((prev) => prev - 1);
    }

    function goToStep(index: number) {
        if (node.linear && index > currentStep) return;
        setCurrentStep(index);
    }

    const currentStepData: StepNodeItem | undefined = steps[currentStep];

    return (
        <div className={`space-y-6 ${node.className ?? ""}`}>
            {/* Progress indicator */}
            <nav aria-label="Form steps" className="flex items-center justify-center">
                <ol className="flex items-center gap-0">
                    {steps.map((step, idx) => (
                        <li key={step.title} className="flex items-center">
                            {/* Step circle */}
                            <button
                                type="button"
                                disabled={node.linear === true && idx > currentStep}
                                aria-current={idx === currentStep ? "step" : undefined}
                                aria-label={`Step ${idx + 1}: ${step.title}`}
                                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                                    completedSteps.has(idx) && idx !== currentStep
                                        ? "border-green-500 bg-green-500 text-white"
                                        : idx !== currentStep
                                          ? "border-gray-300 bg-white text-gray-500"
                                          : "text-white"
                                } ${node.linear === true && idx > currentStep ? "cursor-not-allowed" : "cursor-pointer hover:shadow-md"}`}
                                style={
                                    idx === currentStep
                                        ? {
                                              borderColor: "var(--fc-color-primary, #3b82f6)",
                                              backgroundColor: "var(--fc-color-primary, #3b82f6)",
                                          }
                                        : {}
                                }
                                onClick={() => goToStep(idx)}
                            >
                                {completedSteps.has(idx) && idx !== currentStep ? (
                                    <svg
                                        className="h-4 w-4 transition-transform duration-200"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <span>{idx + 1}</span>
                                )}
                            </button>

                            {/* Connector line */}
                            {idx < steps.length - 1 && (
                                <div
                                    className={`mx-1 h-0.5 w-8 transition-colors duration-300 sm:w-12 ${completedSteps.has(idx) ? "bg-green-500" : "bg-gray-200"}`}
                                />
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            {/* Step title */}
            {currentStepData && (
                <div className="text-center">
                    <h3 className="text-base font-semibold text-gray-800">
                        {currentStepData.title}
                    </h3>
                    {currentStepData.description && (
                        <p className="mt-1 text-sm text-gray-500">{currentStepData.description}</p>
                    )}
                </div>
            )}

            {/* Step content */}
            {currentStepData && (
                <div>
                    {currentStepData.children.map((child, i) => (
                        <div key={isFieldNode(child) ? child.name : `step-child-${i}`}>
                            {renderNode(child, form, components)}
                        </div>
                    ))}
                </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <button
                    type="button"
                    disabled={isFirstStep}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={goPrevious}
                >
                    Previous
                </button>
                <span className="text-xs text-gray-400">
                    {currentStep + 1} / {totalSteps}
                </span>
                {!isLastStep ? (
                    <button
                        type="button"
                        className="rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        style={{
                            backgroundColor: "var(--fc-color-primary, #3b82f6)",
                        }}
                        onClick={goNext}
                    >
                        Next
                    </button>
                ) : (
                    <div className="w-[72px]" />
                )}
            </div>
        </div>
    );
}

function RenderTabs({
    node,
    form,
    components,
}: {
    node: TabsNode;
    form: FormInstance;
    components?: Record<string, ComponentType<FieldComponentProps>>;
}): React.ReactElement {
    const [activeIndex, setActiveIndex] = useState(0);

    const tabs = node.tabs;
    const activeTab: TabNodeItem | undefined = tabs[activeIndex];
    const tabPanelId = `fc-tabpanel-${activeIndex}`;

    function selectTab(index: number) {
        setActiveIndex(index);
    }

    return (
        <div className={node.className ?? ""}>
            {/* Tab bar */}
            <div
                className="relative flex border-b border-gray-200"
                role="tablist"
                aria-orientation="horizontal"
            >
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.title}
                        id={`fc-tab-${idx}`}
                        type="button"
                        role="tab"
                        aria-selected={idx === activeIndex}
                        aria-controls={tabPanelId}
                        tabIndex={idx === activeIndex ? 0 : -1}
                        className={`relative px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/40 ${
                            idx !== activeIndex ? "text-gray-500 hover:text-gray-700" : ""
                        }`}
                        style={
                            idx === activeIndex ? { color: "var(--fc-color-primary, #3b82f6)" } : {}
                        }
                        onClick={() => selectTab(idx)}
                    >
                        {tab.title}
                        {/* Active underline indicator */}
                        {idx === activeIndex && (
                            <span
                                className="absolute inset-x-0 -bottom-px h-0.5 transition-all duration-200"
                                style={{
                                    backgroundColor: "var(--fc-color-primary, #3b82f6)",
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab panel */}
            {activeTab && (
                <div
                    id={tabPanelId}
                    role="tabpanel"
                    aria-labelledby={`fc-tab-${activeIndex}`}
                    tabIndex={0}
                    className="pt-4"
                >
                    {activeTab.children.map((child, i) => (
                        <div key={isFieldNode(child) ? child.name : `tab-child-${i}`}>
                            {renderNode(child, form, components)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function renderDivider(node: DividerNode): ReactNode {
    if (node.label) {
        return (
            <div className={`relative my-4 ${node.className ?? ""}`}>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-3 text-sm text-gray-500">{node.label}</span>
                </div>
            </div>
        );
    }
    return <hr className={`my-4 border-gray-200 ${node.className ?? ""}`} />;
}

function renderNode(
    node: SchemaNode,
    form: FormInstance,
    components?: Record<string, ComponentType<FieldComponentProps>>,
): ReactNode {
    if (isFieldNode(node)) {
        return renderField(node, form, components);
    }

    switch (node.type) {
        case "row":
            return renderRow(node, form, components);
        case "group":
            return <RenderGroup node={node} form={form} components={components} />;
        case "steps":
            return <RenderSteps node={node} form={form} components={components} />;
        case "tabs":
            return <RenderTabs node={node} form={form} components={components} />;
        case "divider":
            return renderDivider(node);
        case "html":
            return (
                <div
                    className={node.className ?? ""}
                    dangerouslySetInnerHTML={{ __html: node.content }}
                />
            );
        default:
            return null;
    }
}

// ---------------------------------------------------------------------------
// FormBuilder
// ---------------------------------------------------------------------------

export function FormBuilder({
    schema,
    onSubmit,
    onError,
    locale: localeProp,
    fallbackLocale: fallbackLocaleProp,
    theme: themeProp,
    components: componentsProp,
    className,
}: FormBuilderProps) {
    const globalConfig = useFormaticaConfig();

    // Props override globals
    const locale = localeProp ?? globalConfig.locale ?? "en";
    const fallbackLocale = fallbackLocaleProp ?? globalConfig.fallbackLocale ?? "en";
    const theme = themeProp ?? globalConfig.theme;
    const components = componentsProp ?? globalConfig.components;

    const form = useForm(schema, { locale });
    const cssVars = buildCssVars(theme);

    const formTitle = getTranslation(schema, "title", locale, fallbackLocale, "");
    const formDescription = getTranslation(schema, "description", locale, fallbackLocale, "");
    const submitLabel = getActionLabel(schema, "submit", locale, fallbackLocale, "Submit");
    const resetLabel = getActionLabel(schema, "reset", locale, fallbackLocale, "Reset");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            await form.submit(async (values) => {
                await onSubmit(values);
            });
        } else {
            await form.validate();
        }
        if (!form.isValid && onError) {
            onError(form.errors);
        }
    };

    const handleReset = (e: FormEvent) => {
        e.preventDefault();
        form.reset();
    };

    return (
        <FormContext.Provider value={form}>
            <form
                className={`fc-form-builder ${theme?.components?.form ?? ""} ${className ?? ""}`.trim()}
                style={cssVars}
                onSubmit={handleSubmit}
                onReset={handleReset}
                noValidate
            >
                {/* Form title / description */}
                {(formTitle || formDescription) && (
                    <div className="mb-6">
                        {formTitle && (
                            <h2 className="text-lg font-semibold text-gray-900">{formTitle}</h2>
                        )}
                        {formDescription && (
                            <p className="mt-1 text-sm text-gray-500">{formDescription}</p>
                        )}
                    </div>
                )}

                {/* Layout */}
                {schema.fields.map((node, i) => (
                    <div
                        key={isFieldNode(node) ? node.name : `node-${i}`}
                        style={isFieldNode(node) ? getSpanStyle(node.span) : undefined}
                    >
                        {renderNode(node, form, components)}
                    </div>
                ))}

                {/* Actions */}
                <div className="mt-6 flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={form.isSubmitting}
                        className={`fc-submit-btn rounded-md px-4 py-2 text-sm font-medium text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 ${theme?.components?.button ?? ""}`}
                        style={{
                            backgroundColor: "var(--fc-color-primary, #3b82f6)",
                        }}
                    >
                        {form.isSubmitting && (
                            <span
                                className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"
                                aria-hidden="true"
                            />
                        )}
                        {submitLabel}
                    </button>
                    <button
                        type="reset"
                        disabled={form.isSubmitting}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {resetLabel}
                    </button>
                </div>
            </form>
        </FormContext.Provider>
    );
}
