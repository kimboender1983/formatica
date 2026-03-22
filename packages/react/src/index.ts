// Re-export everything from core
export * from "@formatica/core";
export type * from "@formatica/core";

// React-specific
export { useForm } from "./hooks/useForm";
export type { FormInstance, UseFormOptions } from "./hooks/useForm";
export { FormContext, useFormContext } from "./hooks/useFormContext";
export { FormBuilder } from "./components/FormBuilder";
export type { FormBuilderProps, FieldComponentProps } from "./components/FormBuilder";
export { FormaticaProvider, useFormaticaConfig } from "./components/FormaticaProvider";
export type { FormaticaConfig } from "./components/FormaticaProvider";
