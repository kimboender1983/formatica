// ---------------------------------------------------------------------------
// Formatica React – SelectField (custom dropdown matching Vue SelectInput)
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";

export interface SelectOption {
    label: string;
    value: string | number | boolean;
    disabled?: boolean;
}

export interface SelectFieldProps {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    options: SelectOption[];
    multiple?: boolean;
    searchable?: boolean;
    clearable?: boolean;
    className?: string;
}

export function SelectField({
    value,
    onChange,
    onBlur,
    disabled,
    placeholder = "Select...",
    options,
    multiple = false,
    searchable = false,
    clearable = false,
    className,
}: SelectFieldProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedValues: Array<string | number | boolean> = (() => {
        if (value === null || value === undefined) return [];
        if (Array.isArray(value)) return value;
        return [value as string | number | boolean];
    })();

    const displayLabel = (() => {
        if (selectedValues.length === 0) return "";
        if (multiple) return "";
        const opt = options.find((o) => o.value === selectedValues[0]);
        return opt?.label ?? String(selectedValues[0]);
    })();

    const filteredOptions = search
        ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    function isSelected(v: string | number | boolean): boolean {
        return selectedValues.includes(v);
    }

    function tagLabel(v: string | number | boolean): string {
        const opt = options.find((o) => o.value === v);
        return opt?.label ?? String(v);
    }

    const open = useCallback(() => {
        setIsOpen(true);
        setHighlightedIndex(-1);
        setSearch("");
        setTimeout(() => searchInputRef.current?.focus(), 0);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setSearch("");
        onBlur?.();
    }, [onBlur]);

    function toggle() {
        if (disabled) return;
        if (isOpen) {
            close();
        } else {
            open();
        }
    }

    function selectOption(option: SelectOption) {
        if (option.disabled) return;
        if (multiple) {
            const arr = [...selectedValues];
            const idx = arr.indexOf(option.value);
            if (idx >= 0) arr.splice(idx, 1);
            else arr.push(option.value);
            onChange(arr);
        } else {
            onChange(option.value);
            close();
        }
    }

    function removeTag(v: string | number | boolean) {
        if (disabled) return;
        const arr = selectedValues.filter((sv) => sv !== v);
        onChange(arr.length ? arr : multiple ? [] : null);
    }

    function clearSelection(e: React.MouseEvent) {
        e.stopPropagation();
        onChange(multiple ? [] : null);
    }

    function onKeydown(e: React.KeyboardEvent) {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                e.preventDefault();
                open();
            }
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    selectOption(filteredOptions[highlightedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                close();
                break;
        }
    }

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                close();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [close]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className ?? ""}`}
        >
            {/* Trigger */}
            <div
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                tabIndex={0}
                className={`flex min-h-[38px] w-full cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm transition-colors duration-200 ${isOpen ? "ring-2 ring-blue-500/20" : ""} ${disabled ? "pointer-events-none bg-gray-100" : ""}`}
                style={isOpen ? { borderColor: "var(--fc-color-primary, #3b82f6)" } : {}}
                onClick={toggle}
                onKeyDown={onKeydown}
            >
                <div className="flex flex-1 flex-wrap items-center gap-1">
                    {/* Multiple tags */}
                    {multiple &&
                        selectedValues.map((val) => (
                            <span
                                key={String(val)}
                                className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs"
                                style={{
                                    backgroundColor:
                                        "color-mix(in srgb, var(--fc-color-primary, #3b82f6) 15%, white)",
                                    color: "var(--fc-color-primary, #3b82f6)",
                                }}
                            >
                                {tagLabel(val)}
                                <button
                                    type="button"
                                    className="ml-0.5"
                                    style={{ color: "var(--fc-color-primary, #3b82f6)" }}
                                    aria-label="Remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeTag(val);
                                    }}
                                >
                                    &times;
                                </button>
                            </span>
                        ))}
                    {/* Single display */}
                    {!multiple && displayLabel && <span className="truncate">{displayLabel}</span>}
                    {/* Placeholder */}
                    {selectedValues.length === 0 && !multiple && (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                    {multiple && selectedValues.length === 0 && (
                        <span className="text-gray-400">{placeholder}</span>
                    )}
                </div>
                {/* Clear button */}
                {clearable && selectedValues.length > 0 && !disabled && (
                    <button
                        type="button"
                        className="ml-1 shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        aria-label="Clear selection"
                        onClick={clearSelection}
                    >
                        &times;
                    </button>
                )}
                {/* Chevron */}
                <svg
                    className={`ml-1 h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
                    {/* Search */}
                    {searchable && (
                        <div className="border-b border-gray-200 p-2">
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none fc-select-search"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={onKeydown}
                                onFocus={(e) => {
                                    e.target.style.borderColor = "var(--fc-color-primary, #3b82f6)";
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = "";
                                }}
                            />
                        </div>
                    )}
                    {/* Options list */}
                    <ul role="listbox" className="max-h-60 overflow-auto py-1">
                        {filteredOptions.map((option, idx) => (
                            <li
                                key={String(option.value)}
                                role="option"
                                aria-selected={isSelected(option.value)}
                                className={`cursor-pointer px-3 py-2 text-sm transition-colors duration-200 ${
                                    !isSelected(option.value) ? "text-gray-900" : ""
                                } ${highlightedIndex === idx ? "bg-gray-100" : ""} ${
                                    option.disabled
                                        ? "opacity-50 cursor-not-allowed"
                                        : "hover:bg-gray-50"
                                }`}
                                style={
                                    isSelected(option.value)
                                        ? {
                                              backgroundColor:
                                                  "color-mix(in srgb, var(--fc-color-primary, #3b82f6) 8%, white)",
                                              color: "var(--fc-color-primary, #3b82f6)",
                                          }
                                        : {}
                                }
                                onClick={() => selectOption(option)}
                                onMouseEnter={() => setHighlightedIndex(idx)}
                            >
                                {option.label}
                            </li>
                        ))}
                        {filteredOptions.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-400">No options found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
