// ---------------------------------------------------------------------------
// Formatica Core – Deep merge utility
// ---------------------------------------------------------------------------

type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
    if (typeof value !== "object" || value === null) return false;
    const proto = Object.getPrototypeOf(value) as unknown;
    return proto === Object.prototype || proto === null;
}

/**
 * Deep-merge two objects. Arrays are replaced (not concatenated).
 * Returns a new object – neither source is mutated.
 */
export function deepMerge<T extends PlainObject>(target: T, source: Partial<T>): T {
    const result: PlainObject = { ...target };

    for (const key of Object.keys(source)) {
        const srcVal = (source as PlainObject)[key];
        const tgtVal = result[key];

        if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
            result[key] = deepMerge(tgtVal, srcVal);
        } else {
            result[key] = srcVal;
        }
    }

    return result as T;
}
