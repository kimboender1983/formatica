// ---------------------------------------------------------------------------
// Formatica React – TextareaField (matches Vue TextareaInput styling)
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef } from "react";

export interface TextareaFieldProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
    readOnly?: boolean;
    autoResize?: boolean;
    maxLength?: number;
    className?: string;
}

const baseClasses =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200 fc-textarea-input";

export function TextareaField({
    value,
    onChange,
    onBlur,
    disabled,
    placeholder,
    rows = 3,
    readOnly,
    autoResize,
    maxLength,
    className,
}: TextareaFieldProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        if (!autoResize || !textareaRef.current) return;
        const el = textareaRef.current;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [autoResize]);

    useEffect(() => {
        adjustHeight();
    }, [value, adjustHeight]);

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "";
    const autoResizeClasses = autoResize ? "resize-none overflow-hidden" : "";
    const textareaClassName =
        `${baseClasses} ${disabledClasses} ${autoResizeClasses} ${className ?? ""}`.trim();

    return (
        <textarea
            ref={textareaRef}
            className={textareaClassName}
            value={value ?? ""}
            onChange={(e) => {
                onChange(e.target.value);
            }}
            onFocus={(e) => {
                e.target.style.borderColor = "var(--fc-color-primary, #3b82f6)";
            }}
            onBlur={(e) => {
                e.target.style.borderColor = "";
                onBlur?.();
            }}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            readOnly={readOnly}
            maxLength={maxLength}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
        />
    );
}
