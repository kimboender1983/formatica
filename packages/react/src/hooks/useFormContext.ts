// ---------------------------------------------------------------------------
// Formatica React – Form context
// ---------------------------------------------------------------------------

import { createContext, useContext } from "react";
import type { FormInstance } from "./useForm";

export const FormContext = createContext<FormInstance | null>(null);

export function useFormContext(): FormInstance {
    const ctx = useContext(FormContext);
    if (!ctx) throw new Error("useFormContext must be used within a FormProvider");
    return ctx;
}
