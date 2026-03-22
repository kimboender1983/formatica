import type { FormContext } from "@formatica/core";
import { getRule, hasRule, registerRule, unregisterRule } from "@formatica/core";

const emptyCtx: FormContext = { values: {}, getFieldValue: () => undefined };

describe("validation rule registry", () => {
    describe("built-in rules", () => {
        it("required — rejects empty values", async () => {
            const rule = getRule("required")!;
            expect(await rule("", {}, emptyCtx)).toBeTypeOf("string");
            expect(await rule(null, {}, emptyCtx)).toBeTypeOf("string");
            expect(await rule(undefined, {}, emptyCtx)).toBeTypeOf("string");
            expect(await rule([], {}, emptyCtx)).toBeTypeOf("string");
        });

        it("required — accepts non-empty values", async () => {
            const rule = getRule("required")!;
            expect(await rule("hello", {}, emptyCtx)).toBe(true);
            expect(await rule(0, {}, emptyCtx)).toBe(true);
            expect(await rule(false, {}, emptyCtx)).toBe(true);
        });

        it("email — validates email format", async () => {
            const rule = getRule("email")!;
            expect(await rule("user@example.com", {}, emptyCtx)).toBe(true);
            expect(await rule("bad-email", {}, emptyCtx)).toBeTypeOf("string");
            // Empty is valid (use required for mandatory)
            expect(await rule("", {}, emptyCtx)).toBe(true);
        });

        it("phone — validates phone numbers", async () => {
            const rule = getRule("phone")!;
            // Empty is valid
            expect(await rule("", {}, emptyCtx)).toBe(true);
            // E.164 format should pass the fallback regex
            expect(await rule("+14155552671", {}, emptyCtx)).toBe(true);
        });

        it("url — validates URLs", async () => {
            const rule = getRule("url")!;
            expect(await rule("https://example.com", {}, emptyCtx)).toBe(true);
            expect(await rule("not a url", {}, emptyCtx)).toBeTypeOf("string");
            expect(await rule("", {}, emptyCtx)).toBe(true);
        });

        it("min — enforces minimum numeric value", async () => {
            const rule = getRule("min")!;
            expect(await rule(5, { min: 3 }, emptyCtx)).toBe(true);
            expect(await rule(2, { min: 3 }, emptyCtx)).toBeTypeOf("string");
            expect(await rule(3, { min: 3 }, emptyCtx)).toBe(true);
        });

        it("max — enforces maximum numeric value", async () => {
            const rule = getRule("max")!;
            expect(await rule(5, { max: 10 }, emptyCtx)).toBe(true);
            expect(await rule(15, { max: 10 }, emptyCtx)).toBeTypeOf("string");
            expect(await rule(10, { max: 10 }, emptyCtx)).toBe(true);
        });

        it("minLength — enforces minimum string length", async () => {
            const rule = getRule("minLength")!;
            expect(await rule("hello", { min: 3 }, emptyCtx)).toBe(true);
            expect(await rule("hi", { min: 3 }, emptyCtx)).toBeTypeOf("string");
        });

        it("maxLength — enforces maximum string length", async () => {
            const rule = getRule("maxLength")!;
            expect(await rule("hi", { max: 5 }, emptyCtx)).toBe(true);
            expect(await rule("hello world", { max: 5 }, emptyCtx)).toBeTypeOf("string");
        });

        it("pattern — validates against regex", async () => {
            const rule = getRule("pattern")!;
            expect(await rule("abc123", { pattern: "^[a-z0-9]+$" }, emptyCtx)).toBe(true);
            expect(await rule("ABC!", { pattern: "^[a-z0-9]+$" }, emptyCtx)).toBeTypeOf("string");
        });

        it("numeric — validates numeric values", async () => {
            const rule = getRule("numeric")!;
            expect(await rule(42, {}, emptyCtx)).toBe(true);
            expect(await rule("42", {}, emptyCtx)).toBe(true);
            expect(await rule("abc", {}, emptyCtx)).toBeTypeOf("string");
        });

        it("alpha — validates alphabetic strings", async () => {
            const rule = getRule("alpha")!;
            expect(await rule("hello", {}, emptyCtx)).toBe(true);
            expect(await rule("hello123", {}, emptyCtx)).toBeTypeOf("string");
        });

        it("alphaNumeric — validates alphanumeric strings", async () => {
            const rule = getRule("alphaNumeric")!;
            expect(await rule("hello123", {}, emptyCtx)).toBe(true);
            expect(await rule("hello 123!", {}, emptyCtx)).toBeTypeOf("string");
        });

        it("between — validates value is between min and max", async () => {
            const rule = getRule("between")!;
            expect(await rule(5, { min: 1, max: 10 }, emptyCtx)).toBe(true);
            expect(await rule(0, { min: 1, max: 10 }, emptyCtx)).toBeTypeOf("string");
            expect(await rule(11, { min: 1, max: 10 }, emptyCtx)).toBeTypeOf("string");
        });

        it("integer — validates integer values", async () => {
            const rule = getRule("integer")!;
            expect(await rule(42, {}, emptyCtx)).toBe(true);
            expect(await rule(3.14, {}, emptyCtx)).toBeTypeOf("string");
        });
    });

    describe("custom rule registration", () => {
        const customRuleName = "testCustomRule";

        afterEach(() => {
            unregisterRule(customRuleName);
        });

        it("registers and retrieves a custom rule", () => {
            const fn = () => true;
            registerRule(customRuleName, fn);
            expect(getRule(customRuleName)).toBe(fn);
            expect(hasRule(customRuleName)).toBe(true);
        });

        it("unregisters a custom rule", () => {
            registerRule(customRuleName, () => true);
            expect(hasRule(customRuleName)).toBe(true);
            unregisterRule(customRuleName);
            expect(hasRule(customRuleName)).toBe(false);
            expect(getRule(customRuleName)).toBeUndefined();
        });

        it("custom rule receives value, params, and ctx", async () => {
            const ctx: FormContext = {
                values: { other: "test" },
                getFieldValue: (n) => (n === "other" ? "test" : undefined),
            };
            registerRule(customRuleName, (value, params, c) => {
                if (value !== "expected") return "wrong value";
                if (params.key !== "val") return "wrong params";
                if (c.values.other !== "test") return "wrong ctx";
                return true;
            });
            const rule = getRule(customRuleName)!;
            expect(await rule("expected", { key: "val" }, ctx)).toBe(true);
            expect(await rule("other", { key: "val" }, ctx)).toBeTypeOf("string");
        });
    });

    describe("getRule / hasRule", () => {
        it("hasRule returns true for built-in rules", () => {
            expect(hasRule("required")).toBe(true);
            expect(hasRule("email")).toBe(true);
            expect(hasRule("min")).toBe(true);
        });

        it("hasRule returns false for unknown rules", () => {
            expect(hasRule("nonExistentRule")).toBe(false);
        });

        it("getRule returns undefined for unknown rules", () => {
            expect(getRule("nonExistentRule")).toBeUndefined();
        });

        it("getRule returns a function for known rules", () => {
            expect(getRule("required")).toBeTypeOf("function");
        });
    });
});
