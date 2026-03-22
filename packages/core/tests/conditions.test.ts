import { evaluateCondition } from "@formatica/core";
import type { Condition, ConditionGroup } from "@formatica/core";

describe("evaluateCondition", () => {
    describe("operators", () => {
        it("eq — equal", () => {
            const cond: Condition = { field: "status", operator: "eq", value: "active" };
            expect(evaluateCondition(cond, { status: "active" })).toBe(true);
            expect(evaluateCondition(cond, { status: "inactive" })).toBe(false);
        });

        it("neq — not equal", () => {
            const cond: Condition = { field: "status", operator: "neq", value: "active" };
            expect(evaluateCondition(cond, { status: "inactive" })).toBe(true);
            expect(evaluateCondition(cond, { status: "active" })).toBe(false);
        });

        it("gt — greater than", () => {
            const cond: Condition = { field: "age", operator: "gt", value: 18 };
            expect(evaluateCondition(cond, { age: 21 })).toBe(true);
            expect(evaluateCondition(cond, { age: 18 })).toBe(false);
            expect(evaluateCondition(cond, { age: 15 })).toBe(false);
        });

        it("gte — greater than or equal", () => {
            const cond: Condition = { field: "age", operator: "gte", value: 18 };
            expect(evaluateCondition(cond, { age: 18 })).toBe(true);
            expect(evaluateCondition(cond, { age: 21 })).toBe(true);
            expect(evaluateCondition(cond, { age: 15 })).toBe(false);
        });

        it("lt — less than", () => {
            const cond: Condition = { field: "count", operator: "lt", value: 10 };
            expect(evaluateCondition(cond, { count: 5 })).toBe(true);
            expect(evaluateCondition(cond, { count: 10 })).toBe(false);
        });

        it("lte — less than or equal", () => {
            const cond: Condition = { field: "count", operator: "lte", value: 10 };
            expect(evaluateCondition(cond, { count: 10 })).toBe(true);
            expect(evaluateCondition(cond, { count: 5 })).toBe(true);
            expect(evaluateCondition(cond, { count: 15 })).toBe(false);
        });

        it("in — value in array", () => {
            const cond: Condition = {
                field: "role",
                operator: "in",
                value: ["admin", "editor"],
            };
            expect(evaluateCondition(cond, { role: "admin" })).toBe(true);
            expect(evaluateCondition(cond, { role: "viewer" })).toBe(false);
        });

        it("notIn — value not in array", () => {
            const cond: Condition = {
                field: "role",
                operator: "notIn",
                value: ["banned", "suspended"],
            };
            expect(evaluateCondition(cond, { role: "active" })).toBe(true);
            expect(evaluateCondition(cond, { role: "banned" })).toBe(false);
        });

        it("contains — string contains substring", () => {
            const cond: Condition = { field: "email", operator: "contains", value: "@" };
            expect(evaluateCondition(cond, { email: "user@test.com" })).toBe(true);
            expect(evaluateCondition(cond, { email: "noemail" })).toBe(false);
        });

        it("contains — array contains value", () => {
            const cond: Condition = { field: "tags", operator: "contains", value: "important" };
            expect(evaluateCondition(cond, { tags: ["important", "urgent"] })).toBe(true);
            expect(evaluateCondition(cond, { tags: ["normal"] })).toBe(false);
        });

        it("empty — value is empty", () => {
            const cond: Condition = { field: "name", operator: "empty" };
            expect(evaluateCondition(cond, { name: "" })).toBe(true);
            expect(evaluateCondition(cond, { name: null })).toBe(true);
            expect(evaluateCondition(cond, { name: undefined })).toBe(true);
            expect(evaluateCondition(cond, { name: [] })).toBe(true);
            expect(evaluateCondition(cond, { name: "filled" })).toBe(false);
        });

        it("notEmpty — value is not empty", () => {
            const cond: Condition = { field: "name", operator: "notEmpty" };
            expect(evaluateCondition(cond, { name: "filled" })).toBe(true);
            expect(evaluateCondition(cond, { name: "" })).toBe(false);
            expect(evaluateCondition(cond, { name: null })).toBe(false);
        });

        it("matches — regex match", () => {
            const cond: Condition = { field: "code", operator: "matches", value: "^[A-Z]{3}$" };
            expect(evaluateCondition(cond, { code: "ABC" })).toBe(true);
            expect(evaluateCondition(cond, { code: "abc" })).toBe(false);
            expect(evaluateCondition(cond, { code: "ABCD" })).toBe(false);
        });
    });

    describe("compound conditions", () => {
        it("AND — all conditions must be true", () => {
            const group: ConditionGroup = {
                and: [
                    { field: "age", operator: "gte", value: 18 },
                    { field: "agreed", operator: "eq", value: true },
                ],
            };
            expect(evaluateCondition(group, { age: 21, agreed: true })).toBe(true);
            expect(evaluateCondition(group, { age: 21, agreed: false })).toBe(false);
            expect(evaluateCondition(group, { age: 15, agreed: true })).toBe(false);
        });

        it("OR — at least one condition must be true", () => {
            const group: ConditionGroup = {
                or: [
                    { field: "role", operator: "eq", value: "admin" },
                    { field: "role", operator: "eq", value: "editor" },
                ],
            };
            expect(evaluateCondition(group, { role: "admin" })).toBe(true);
            expect(evaluateCondition(group, { role: "editor" })).toBe(true);
            expect(evaluateCondition(group, { role: "viewer" })).toBe(false);
        });

        it("AND with empty array evaluates to true", () => {
            const group: ConditionGroup = { and: [] };
            expect(evaluateCondition(group, {})).toBe(true);
        });

        it("OR with empty array evaluates to false", () => {
            const group: ConditionGroup = { or: [] };
            expect(evaluateCondition(group, {})).toBe(false);
        });
    });

    describe("nested compound conditions", () => {
        it("AND with nested OR", () => {
            const group: ConditionGroup = {
                and: [
                    { field: "country", operator: "eq", value: "US" },
                    {
                        or: [
                            { field: "age", operator: "gte", value: 21 },
                            { field: "hasParentalConsent", operator: "eq", value: true },
                        ],
                    },
                ],
            };

            expect(
                evaluateCondition(group, { country: "US", age: 25, hasParentalConsent: false }),
            ).toBe(true);
            expect(
                evaluateCondition(group, { country: "US", age: 18, hasParentalConsent: true }),
            ).toBe(true);
            expect(
                evaluateCondition(group, { country: "US", age: 18, hasParentalConsent: false }),
            ).toBe(false);
            expect(
                evaluateCondition(group, { country: "CA", age: 25, hasParentalConsent: false }),
            ).toBe(false);
        });

        it("OR with nested AND", () => {
            const group: ConditionGroup = {
                or: [
                    { field: "isAdmin", operator: "eq", value: true },
                    {
                        and: [
                            { field: "isEditor", operator: "eq", value: true },
                            { field: "approved", operator: "eq", value: true },
                        ],
                    },
                ],
            };

            expect(
                evaluateCondition(group, { isAdmin: true, isEditor: false, approved: false }),
            ).toBe(true);
            expect(
                evaluateCondition(group, { isAdmin: false, isEditor: true, approved: true }),
            ).toBe(true);
            expect(
                evaluateCondition(group, { isAdmin: false, isEditor: true, approved: false }),
            ).toBe(false);
        });
    });
});
