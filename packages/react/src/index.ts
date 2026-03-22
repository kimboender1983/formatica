// Re-export everything from core

export type * from "@formatica/core";
export * from "@formatica/core";
export type { FormaticaConfig } from "./components/FormaticaProvider";
export { FormaticaProvider, useFormaticaConfig } from "./components/FormaticaProvider";
export type { FieldComponentProps, FormBuilderProps } from "./components/FormBuilder";
export { FormBuilder } from "./components/FormBuilder";
export type { FormInstance, UseFormOptions } from "./hooks/useForm";
// React-specific
export { useForm } from "./hooks/useForm";
export { FormContext, useFormContext } from "./hooks/useFormContext";
