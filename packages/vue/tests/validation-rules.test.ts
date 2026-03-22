import { getRule, hasRule, registerRule, unregisterRule } from "@formatica/vue";

const dummyCtx = { values: {}, getFieldValue: () => undefined };

describe("validation rules", () => {
    describe("required", () => {
        it("fails on empty string", async () => {
            const rule = getRule("required")!;
            expect(await rule("", {}, dummyCtx)).not.toBe(true);
        });

        it("fails on null", async () => {
            const rule = getRule("required")!;
            expect(await rule(null, {}, dummyCtx)).not.toBe(true);
        });

        it("fails on undefined", async () => {
            const rule = getRule("required")!;
            expect(await rule(undefined, {}, dummyCtx)).not.toBe(true);
        });

        it("fails on empty array", async () => {
            const rule = getRule("required")!;
            expect(await rule([], {}, dummyCtx)).not.toBe(true);
        });

        it("passes on non-empty string", async () => {
            const rule = getRule("required")!;
            expect(await rule("hello", {}, dummyCtx)).toBe(true);
        });

        it("passes on true", async () => {
            const rule = getRule("required")!;
            expect(await rule(true, {}, dummyCtx)).toBe(true);
        });

        it("passes on 0 (falsy but not empty)", async () => {
            const rule = getRule("required")!;
            expect(await rule(0, {}, dummyCtx)).toBe(true);
        });

        it("passes on false (treated as empty by isEmpty helper)", async () => {
            const rule = getRule("required")!;
            // Note: in Formatica, false is NOT considered empty by isEmpty(), so required passes
            // Actually checking the source: isEmpty only checks null/undefined/""/[],
            // so false passes required
            expect(await rule(false, {}, dummyCtx)).toBe(true);
        });
    });

    describe("email", () => {
        it("fails on invalid email", async () => {
            const rule = getRule("email")!;
            expect(await rule("notanemail", {}, dummyCtx)).not.toBe(true);
        });

        it("passes on valid email", async () => {
            const rule = getRule("email")!;
            expect(await rule("test@example.com", {}, dummyCtx)).toBe(true);
        });

        it("passes on empty value (optional by default)", async () => {
            const rule = getRule("email")!;
            expect(await rule("", {}, dummyCtx)).toBe(true);
        });
    });

    describe("phone", () => {
        it("passes on valid E.164 format", async () => {
            const rule = getRule("phone")!;
            const result = await rule("+14155552671", {}, dummyCtx);
            expect(result).toBe(true);
        });

        it("fails on invalid phone", async () => {
            const rule = getRule("phone")!;
            const result = await rule("abc", {}, dummyCtx);
            expect(result).not.toBe(true);
        });

        it("passes on empty value", async () => {
            const rule = getRule("phone")!;
            expect(await rule("", {}, dummyCtx)).toBe(true);
        });
    });

    describe("min", () => {
        it("fails when value is below minimum", async () => {
            const rule = getRule("min")!;
            expect(await rule(3, { min: 5 }, dummyCtx)).not.toBe(true);
        });

        it("passes when value equals minimum", async () => {
            const rule = getRule("min")!;
            expect(await rule(5, { min: 5 }, dummyCtx)).toBe(true);
        });

        it("passes when value is above minimum", async () => {
            const rule = getRule("min")!;
            expect(await rule(10, { min: 5 }, dummyCtx)).toBe(true);
        });

        it("passes on empty value", async () => {
            const rule = getRule("min")!;
            expect(await rule("", { min: 5 }, dummyCtx)).toBe(true);
        });
    });

    describe("max", () => {
        it("fails when value exceeds maximum", async () => {
            const rule = getRule("max")!;
            expect(await rule(15, { max: 10 }, dummyCtx)).not.toBe(true);
        });

        it("passes when value equals maximum", async () => {
            const rule = getRule("max")!;
            expect(await rule(10, { max: 10 }, dummyCtx)).toBe(true);
        });

        it("passes when value is below maximum", async () => {
            const rule = getRule("max")!;
            expect(await rule(5, { max: 10 }, dummyCtx)).toBe(true);
        });
    });

    describe("minLength", () => {
        it("fails when string is too short", async () => {
            const rule = getRule("minLength")!;
            expect(await rule("ab", { min: 3 }, dummyCtx)).not.toBe(true);
        });

        it("passes when string meets minimum length", async () => {
            const rule = getRule("minLength")!;
            expect(await rule("abc", { min: 3 }, dummyCtx)).toBe(true);
        });

        it("works with minLength param name", async () => {
            const rule = getRule("minLength")!;
            expect(await rule("ab", { minLength: 3 }, dummyCtx)).not.toBe(true);
        });
    });

    describe("maxLength", () => {
        it("fails when string exceeds max length", async () => {
            const rule = getRule("maxLength")!;
            expect(await rule("abcdef", { max: 3 }, dummyCtx)).not.toBe(true);
        });

        it("passes when string meets max length", async () => {
            const rule = getRule("maxLength")!;
            expect(await rule("abc", { max: 3 }, dummyCtx)).toBe(true);
        });

        it("works with maxLength param name", async () => {
            const rule = getRule("maxLength")!;
            expect(await rule("abcdef", { maxLength: 3 }, dummyCtx)).not.toBe(true);
        });
    });

    describe("url", () => {
        it("fails on invalid URL", async () => {
            const rule = getRule("url")!;
            expect(await rule("not-a-url", {}, dummyCtx)).not.toBe(true);
        });

        it("passes on valid URL", async () => {
            const rule = getRule("url")!;
            expect(await rule("https://example.com", {}, dummyCtx)).toBe(true);
        });

        it("passes on empty value", async () => {
            const rule = getRule("url")!;
            expect(await rule("", {}, dummyCtx)).toBe(true);
        });
    });

    describe("pattern", () => {
        it("fails when value does not match pattern", async () => {
            const rule = getRule("pattern")!;
            expect(await rule("abc", { pattern: "^\\d+$" }, dummyCtx)).not.toBe(true);
        });

        it("passes when value matches pattern", async () => {
            const rule = getRule("pattern")!;
            expect(await rule("123", { pattern: "^\\d+$" }, dummyCtx)).toBe(true);
        });

        it("passes on empty value", async () => {
            const rule = getRule("pattern")!;
            expect(await rule("", { pattern: "^\\d+$" }, dummyCtx)).toBe(true);
        });
    });

    describe("numeric", () => {
        it("fails on non-numeric string", async () => {
            const rule = getRule("numeric")!;
            expect(await rule("abc", {}, dummyCtx)).not.toBe(true);
        });

        it("passes on numeric string", async () => {
            const rule = getRule("numeric")!;
            expect(await rule("42", {}, dummyCtx)).toBe(true);
        });

        it("passes on number value", async () => {
            const rule = getRule("numeric")!;
            expect(await rule(42, {}, dummyCtx)).toBe(true);
        });
    });

    describe("alpha", () => {
        it("fails on strings with numbers", async () => {
            const rule = getRule("alpha")!;
            expect(await rule("abc123", {}, dummyCtx)).not.toBe(true);
        });

        it("passes on letters only", async () => {
            const rule = getRule("alpha")!;
            expect(await rule("abcABC", {}, dummyCtx)).toBe(true);
        });

        it("passes on empty value", async () => {
            const rule = getRule("alpha")!;
            expect(await rule("", {}, dummyCtx)).toBe(true);
        });
    });

    describe("custom rule registration", () => {
        const customName = "testCustomRule";

        afterEach(() => {
            if (hasRule(customName)) {
                unregisterRule(customName);
            }
        });

        it("registers a custom rule and uses it", async () => {
            registerRule(customName, (value) => {
                return value === "magic" || "Must be magic";
            });

            expect(hasRule(customName)).toBe(true);

            const rule = getRule(customName)!;
            expect(await rule("magic", {}, dummyCtx)).toBe(true);
            expect(await rule("nope", {}, dummyCtx)).toBe("Must be magic");
        });

        it("unregisterRule removes the rule", () => {
            registerRule(customName, () => true);
            expect(hasRule(customName)).toBe(true);

            unregisterRule(customName);
            expect(hasRule(customName)).toBe(false);
            expect(getRule(customName)).toBeUndefined();
        });
    });

    describe("between", () => {
        it("fails when value is out of range", async () => {
            const rule = getRule("between")!;
            expect(await rule(20, { min: 1, max: 10 }, dummyCtx)).not.toBe(true);
        });

        it("passes when value is in range", async () => {
            const rule = getRule("between")!;
            expect(await rule(5, { min: 1, max: 10 }, dummyCtx)).toBe(true);
        });
    });

    describe("integer", () => {
        it("fails on float", async () => {
            const rule = getRule("integer")!;
            expect(await rule(3.14, {}, dummyCtx)).not.toBe(true);
        });

        it("passes on integer", async () => {
            const rule = getRule("integer")!;
            expect(await rule(42, {}, dummyCtx)).toBe(true);
        });
    });
});
