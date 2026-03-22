// ---------------------------------------------------------------------------
// Formatica – Condition evaluation
// ---------------------------------------------------------------------------

import type { Condition, ConditionGroup, ConditionOperator } from "../types/schema";

// ---------------------------------------------------------------------------
// Single condition evaluation
// ---------------------------------------------------------------------------

function evaluateOperator(
    fieldValue: unknown,
    operator: ConditionOperator,
    conditionValue: unknown,
): boolean {
    switch (operator) {
        case "eq":
            return fieldValue === conditionValue;
        case "neq":
            return fieldValue !== conditionValue;
        case "gt":
            return Number(fieldValue) > Number(conditionValue);
        case "gte":
            return Number(fieldValue) >= Number(conditionValue);
        case "lt":
            return Number(fieldValue) < Number(conditionValue);
        case "lte":
            return Number(fieldValue) <= Number(conditionValue);
        case "in":
            return (
                Array.isArray(conditionValue) && (conditionValue as unknown[]).includes(fieldValue)
            );
        case "notIn":
            return (
                Array.isArray(conditionValue) && !(conditionValue as unknown[]).includes(fieldValue)
            );
        case "contains": {
            if (typeof fieldValue === "string") return fieldValue.includes(String(conditionValue));
            if (Array.isArray(fieldValue))
                return (fieldValue as unknown[]).includes(conditionValue);
            return false;
        }
        case "empty":
            return (
                fieldValue === null ||
                fieldValue === undefined ||
                fieldValue === "" ||
                (Array.isArray(fieldValue) && fieldValue.length === 0)
            );
        case "notEmpty":
            return !(
                fieldValue === null ||
                fieldValue === undefined ||
                fieldValue === "" ||
                (Array.isArray(fieldValue) && fieldValue.length === 0)
            );
        case "matches": {
            if (typeof conditionValue !== "string") return false;
            try {
                return new RegExp(conditionValue).test(String(fieldValue));
            } catch {
                return false;
            }
        }
        default:
            return false;
    }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function isConditionGroup(cond: Condition | ConditionGroup): cond is ConditionGroup {
    return "and" in cond || "or" in cond;
}

/**
 * Evaluate a single condition or a compound condition group against the
 * current form values.
 */
export function evaluateCondition(
    condition: Condition | ConditionGroup,
    values: Record<string, unknown>,
): boolean {
    if (isConditionGroup(condition)) {
        if (condition.and) {
            return condition.and.every((c) => evaluateCondition(c, values));
        }
        if (condition.or) {
            return condition.or.some((c) => evaluateCondition(c, values));
        }
        // Empty group evaluates to true
        return true;
    }

    const fieldValue = values[condition.field];
    return evaluateOperator(fieldValue, condition.operator, condition.value);
}
