// ---------------------------------------------------------------------------
// Formatica React – BaseField wrapper (matches Vue BaseField styling)
// ---------------------------------------------------------------------------

import { type ReactNode, useState } from "react";

export interface BaseFieldProps {
    label?: string;
    required?: boolean;
    errors?: string[];
    touched?: boolean;
    helpText?: string;
    tooltip?: string;
    disabled?: boolean;
    readOnly?: boolean;
    fieldName?: string;
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function BaseField({
    label,
    required,
    errors,
    touched = true,
    helpText,
    tooltip,
    disabled,
    readOnly,
    fieldName,
    children,
    className,
    style,
}: BaseFieldProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const hasErrors = touched && errors !== undefined && errors.length > 0;
    const fieldId = fieldName ? `fc-field-${fieldName}` : undefined;
    const errorId = fieldName ? `fc-error-${fieldName}` : undefined;

    return (
        <div
            className={`relative mb-4 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${readOnly ? "fc-readonly" : ""} ${className ?? ""}`}
            style={style}
        >
            {/* Label row */}
            {label && (
                <div className="mb-1.5 flex items-center gap-1">
                    <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
                        {label}
                        {required && (
                            <span className="text-red-500 ml-0.5" aria-hidden="true">
                                *
                            </span>
                        )}
                    </label>

                    {/* Tooltip icon */}
                    {tooltip && (
                        <span
                            className="relative inline-flex"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            onFocus={() => setShowTooltip(true)}
                            onBlur={() => setShowTooltip(false)}
                        >
                            <button
                                type="button"
                                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-xs hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                aria-label={`Info: ${tooltip}`}
                                tabIndex={0}
                            >
                                i
                            </button>
                            {showTooltip && (
                                <div
                                    role="tooltip"
                                    className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white shadow-lg whitespace-nowrap"
                                >
                                    {tooltip}
                                    <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                                </div>
                            )}
                        </span>
                    )}
                </div>
            )}

            {/* Input slot */}
            <div id={fieldId}>{children}</div>

            {/* Error messages */}
            {hasErrors && (
                <div>
                    {errors.map((error, idx) => (
                        <p
                            key={`${error}-${idx}`}
                            id={idx === 0 ? errorId : undefined}
                            className="mt-1 text-xs text-red-500"
                            role="alert"
                        >
                            {error}
                        </p>
                    ))}
                </div>
            )}

            {/* Help text */}
            {helpText && !hasErrors && <p className="mt-1 text-xs text-gray-400">{helpText}</p>}
        </div>
    );
}
