// ---------------------------------------------------------------------------
// Formatica React – TextField (matches Vue TextInput styling)
// ---------------------------------------------------------------------------

export interface TextFieldProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    inputType?: "text" | "email" | "password" | "url" | "tel" | "search";
    readOnly?: boolean;
    prefix?: string;
    suffix?: string;
    maxLength?: number;
    className?: string;
}

const baseInputClasses =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200 fc-text-input";

export function TextField({
    value,
    onChange,
    onBlur,
    disabled,
    placeholder,
    inputType = "text",
    readOnly,
    prefix,
    suffix,
    maxLength,
    className,
}: TextFieldProps) {
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "";
    const prefixClass = prefix ? "rounded-l-none" : "";
    const suffixClass = suffix ? "rounded-r-none" : "";
    const inputClassName =
        `${baseInputClasses} ${disabledClasses} ${prefixClass} ${suffixClass} ${className ?? ""}`.trim();

    const inputEl = (
        <input
            type={inputType}
            className={inputClassName}
            style={{ borderColor: undefined }}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onFocus={(e) => {
                e.target.style.borderColor = "var(--fc-color-primary, #3b82f6)";
            }}
            onBlur={(e) => {
                e.target.style.borderColor = "";
                onBlur?.();
            }}
            disabled={disabled}
            placeholder={placeholder}
            readOnly={readOnly}
            maxLength={maxLength}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
        />
    );

    if (prefix || suffix) {
        return (
            <div className="flex items-stretch">
                {prefix && (
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        {prefix}
                    </span>
                )}
                {inputEl}
                {suffix && (
                    <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                        {suffix}
                    </span>
                )}
            </div>
        );
    }

    return inputEl;
}
