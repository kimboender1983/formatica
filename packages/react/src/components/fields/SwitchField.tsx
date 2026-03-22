// ---------------------------------------------------------------------------
// Formatica React – SwitchField (matches Vue SwitchInput styling)
// ---------------------------------------------------------------------------

export interface SwitchFieldProps {
    value: boolean;
    onChange: (value: boolean) => void;
    onBlur?: () => void;
    disabled?: boolean;
    activeLabel?: string;
    inactiveLabel?: string;
    className?: string;
}

export function SwitchField({
    value,
    onChange,
    onBlur,
    disabled,
    activeLabel,
    inactiveLabel,
    className,
}: SwitchFieldProps) {
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
            {inactiveLabel && <span className="text-sm text-gray-600">{inactiveLabel}</span>}
            <input
                type="checkbox"
                checked={value ?? false}
                onChange={toggle}
                onBlur={onBlur}
                disabled={disabled}
                className="sr-only"
            />
            <button
                type="button"
                role="switch"
                aria-checked={value}
                aria-disabled={disabled || undefined}
                tabIndex={0}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    !value ? "bg-gray-300" : ""
                } ${disabled ? "pointer-events-none" : "focus:outline-none focus:ring-2 focus:ring-blue-500/20"}`}
                style={value ? { backgroundColor: "var(--fc-color-primary, #3b82f6)" } : {}}
                onClick={toggle}
                onKeyDown={onKeydown}
            >
                <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        value ? "translate-x-5" : "translate-x-0"
                    }`}
                    aria-hidden="true"
                />
            </button>
            {activeLabel && <span className="text-sm text-gray-600">{activeLabel}</span>}
        </label>
    );
}
