// ---------------------------------------------------------------------------
// Formatica React – SliderField (matches Vue SliderInput styling)
// ---------------------------------------------------------------------------

import { useState } from "react";

export interface SliderFieldProps {
    value: number | null;
    onChange: (value: number) => void;
    onBlur?: () => void;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    showTooltip?: boolean;
    className?: string;
}

export function SliderField({
    value,
    onChange,
    onBlur,
    disabled,
    min = 0,
    max = 100,
    step = 1,
    showTooltip = true,
    className,
}: SliderFieldProps) {
    const [isActive, setIsActive] = useState(false);

    const currentValue = value ?? min;
    const range = max - min;
    const percentage = range === 0 ? 0 : ((currentValue - min) / range) * 100;

    return (
        <div
            className={`relative w-full py-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className ?? ""}`}
        >
            {/* Tooltip */}
            {showTooltip && isActive && (
                <div
                    className="absolute -top-8 rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-sm transition-opacity duration-200"
                    style={{ left: `calc(${percentage}% - 16px)` }}
                >
                    {currentValue}
                </div>
            )}
            <input
                type="range"
                value={currentValue}
                onChange={(e) => onChange(Number.parseFloat(e.target.value))}
                onMouseDown={() => setIsActive(true)}
                onMouseUp={() => setIsActive(false)}
                onTouchStart={() => setIsActive(true)}
                onTouchEnd={() => setIsActive(false)}
                onFocus={() => setIsActive(true)}
                onBlur={(e) => {
                    setIsActive(false);
                    onBlur?.();
                }}
                disabled={disabled}
                min={min}
                max={max}
                step={step}
                aria-valuenow={currentValue}
                aria-valuemin={min}
                aria-valuemax={max}
                aria-disabled={disabled || undefined}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:pointer-events-none"
                style={{ accentColor: "var(--fc-color-primary, #3b82f6)" }}
            />
            {/* Min/Max labels */}
            <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>{min}</span>
                <span>{max}</span>
            </div>
        </div>
    );
}
