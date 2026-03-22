// ---------------------------------------------------------------------------
// Formatica – Field component registry
// ---------------------------------------------------------------------------

import type { Component, ComputedRef, InjectionKey } from "vue";

// ---------------------------------------------------------------------------
// Per-instance component overrides (provided by FormBuilder)
// ---------------------------------------------------------------------------

export const FormComponentsKey: InjectionKey<ComputedRef<Record<string, Component>>> =
    Symbol("FormaticaComponents");

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const registry = new Map<string, Component>();

/**
 * Register a Vue component for a given field type.
 * If a component is already registered for that type, it will be replaced.
 */
export function registerFieldType(type: string, component: Component): void {
    registry.set(type, component);
}

/**
 * Unregister a field type component.
 */
export function unregisterFieldType(type: string): void {
    registry.delete(type);
}

/**
 * Retrieve the component registered for a given field type.
 */
export function getFieldComponent(type: string): Component | undefined {
    return registry.get(type);
}

/**
 * Check whether a component is registered for a given field type.
 */
export function hasFieldType(type: string): boolean {
    return registry.has(type);
}

/**
 * Return all registered field type names.
 */
export function getRegisteredFieldTypes(): string[] {
    return Array.from(registry.keys());
}
