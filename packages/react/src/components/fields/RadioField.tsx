// ---------------------------------------------------------------------------
// Formatica React – RadioField (matches Vue RadioInput styling)
// ---------------------------------------------------------------------------

export interface RadioOption {
    label: string;
    value: string | number | boolean;
    disabled?: boolean;
}

export interface RadioFieldProps {
    name: string;
    value: unknown;
    onChange: (value: string | number | boolean) => void;
    onBlur?: () => void;
    disabled?: boolean;
    options: RadioOption[];
    inline?: boolean;
    className?: string;
}

export function RadioField({
    name,
    value,
    onChange,
    onBlur,
    disabled,
    options,
    inline = false,
    className,
}: RadioFieldProps) {
    function isSelected(v: string | number | boolean): boolean {
        return value === v;
    }

    function isOptionDisabled(option: RadioOption): boolean {
        return disabled === true || !!option.disabled;
    }

    function selectOption(option: RadioOption) {
        if (isOptionDisabled(option)) return;
        onChange(option.value);
    }

    function onKeydown(e: React.KeyboardEvent, option: RadioOption) {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            selectOption(option);
        }
    }

    return (
        <div
            role="radiogroup"
            className={`${inline ? "flex flex-wrap gap-4" : "flex flex-col gap-2"} ${className ?? ""}`}
        >
            {options.map((option) => (
                <label
                    key={String(option.value)}
                    className={`inline-flex items-center gap-2 select-none ${
                        isOptionDisabled(option)
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                    }`}
                >
                    <input
                        type="radio"
                        checked={isSelected(option.value)}
                        disabled={isOptionDisabled(option)}
                        className="sr-only"
                        name={name}
                        onChange={() => selectOption(option)}
                        onBlur={onBlur}
                    />
                    <div
                        role="radio"
                        aria-checked={isSelected(option.value)}
                        aria-disabled={isOptionDisabled(option) || undefined}
                        tabIndex={0}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                            !isSelected(option.value) ? "border-gray-300" : ""
                        }`}
                        style={
                            isSelected(option.value)
                                ? { borderColor: "var(--fc-color-primary, #3b82f6)" }
                                : {}
                        }
                        onClick={() => selectOption(option)}
                        onKeyDown={(e) => onKeydown(e, option)}
                    >
                        {isSelected(option.value) && (
                            <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                    backgroundColor: "var(--fc-color-primary, #3b82f6)",
                                }}
                            />
                        )}
                    </div>
                    <span className="text-sm text-gray-700">{option.label}</span>
                </label>
            ))}
        </div>
    );
}
