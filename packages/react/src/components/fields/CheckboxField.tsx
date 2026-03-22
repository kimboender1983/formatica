// ---------------------------------------------------------------------------
// Formatica React – CheckboxField (matches Vue CheckboxInput styling)
// ---------------------------------------------------------------------------

export interface CheckboxFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    onBlur?: () => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function CheckboxField({
    value,
    onChange,
    onBlur,
    disabled,
    label,
    className,
}: CheckboxFieldProps) {
    function toggle() {
        if (disabled) return;
        onChange(!value);
    }

    function onKeydown(e: React.KeyboardEvent) {
        if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
        }
    }

    return (
        <label
            className={`inline-flex items-center gap-2 select-none ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className ?? ""}`}
        >
            <input
                type="checkbox"
                checked={value ?? false}
                onChange={() => {}}
                onBlur={onBlur}
                disabled={disabled}
                className="sr-only"
            />
            <div
                role="checkbox"
                aria-checked={value}
                aria-disabled={disabled || undefined}
                tabIndex={0}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-200 ${
                    value ? "text-white" : "border-gray-300 bg-white"
                }`}
                style={
                    value
                        ? {
                              borderColor: "var(--fc-color-primary, #3b82f6)",
                              backgroundColor: "var(--fc-color-primary, #3b82f6)",
                          }
                        : {}
                }
                onClick={(e) => {
                    e.preventDefault();
                    toggle();
                }}
                onKeyDown={onKeydown}
            >
                {value && (
                    <svg
                        className="h-3 w-3"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            {label && <span className="text-sm text-gray-700">{label}</span>}
        </label>
    );
}
