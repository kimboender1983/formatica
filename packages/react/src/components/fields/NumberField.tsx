// ---------------------------------------------------------------------------
// Formatica React – NumberField (matches Vue NumberInput styling)
// ---------------------------------------------------------------------------

export interface NumberFieldProps {
    value: number | null;
    onChange: (value: number | null) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    readOnly?: boolean;
    prefix?: string;
    suffix?: string;
    className?: string;
}

const baseInputClasses =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200 fc-number-input";

export function NumberField({
    value,
    onChange,
    onBlur,
    disabled,
    placeholder,
    min,
    max,
    step = 1,
    precision,
    readOnly,
    prefix,
    suffix,
    className,
}: NumberFieldProps) {
    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : "";
    const prefixClass = prefix ? "rounded-l-none" : "";
    const suffixClass = suffix ? "rounded-r-none" : "";
    const inputClassName =
        `${baseInputClasses} ${disabledClasses} ${prefixClass} ${suffixClass} ${className ?? ""}`.trim();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        if (raw === "") {
            onChange(null);
            return;
        }
        let num = Number.parseFloat(raw);
        if (Number.isNaN(num)) return;
        if (precision !== undefined) {
            num = Number.parseFloat(num.toFixed(precision));
        }
        onChange(num);
    }

    const inputEl = (
        <input
            type="number"
            className={inputClassName}
            value={value ?? ""}
            onChange={handleChange}
            onFocus={(e) => {
                e.target.style.borderColor = "var(--fc-color-primary, #3b82f6)";
            }}
            onBlur={(e) => {
                e.target.style.borderColor = "";
                onBlur?.();
            }}
            disabled={disabled}
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            readOnly={readOnly}
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
