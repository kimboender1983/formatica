import { deepMerge, sanitizeHtml, titleCase } from "@formatica/core";

describe("deepMerge", () => {
    it("merges flat objects", () => {
        const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 });
        expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it("deep merges nested objects", () => {
        const result = deepMerge(
            { settings: { color: "red", size: 10 } },
            { settings: { color: "blue" } },
        );
        expect(result).toEqual({ settings: { color: "blue", size: 10 } });
    });

    it("replaces arrays instead of concatenating", () => {
        const result = deepMerge({ items: [1, 2, 3] }, { items: [4, 5] });
        expect(result).toEqual({ items: [4, 5] });
    });

    it("does not mutate source objects", () => {
        const target = { a: 1, nested: { b: 2 } };
        const source = { nested: { c: 3 } };
        const result = deepMerge(target, source);
        expect(target).toEqual({ a: 1, nested: { b: 2 } });
        expect(result.nested).toEqual({ b: 2, c: 3 });
    });

    it("handles empty source", () => {
        const target = { a: 1 };
        const result = deepMerge(target, {});
        expect(result).toEqual({ a: 1 });
    });

    it("overwrites primitives with objects", () => {
        const result = deepMerge({ a: "string" }, { a: { nested: true } } as never);
        expect(result).toEqual({ a: { nested: true } });
    });
});

describe("titleCase", () => {
    it("converts camelCase", () => {
        expect(titleCase("firstName")).toBe("First Name");
    });

    it("converts kebab-case", () => {
        expect(titleCase("last-name")).toBe("Last Name");
    });

    it("converts snake_case", () => {
        expect(titleCase("email_address")).toBe("Email Address");
    });

    it("handles single word", () => {
        expect(titleCase("name")).toBe("Name");
    });

    it("handles already spaced words", () => {
        expect(titleCase("hello world")).toBe("Hello World");
    });
});

describe("sanitizeHtml", () => {
    it("removes script tags", () => {
        const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>');
        expect(result).toBe("<p>Hello</p>");
    });

    it("removes event handler attributes", () => {
        const result = sanitizeHtml('<img src="x" onerror="alert(1)">');
        expect(result).not.toContain("onerror");
    });

    it("removes javascript: protocol from href", () => {
        const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
        expect(result).not.toContain("javascript:");
    });

    it("preserves safe HTML", () => {
        const safe = '<p class="info">Hello <strong>world</strong></p>';
        expect(sanitizeHtml(safe)).toBe(safe);
    });

    it("handles empty string", () => {
        expect(sanitizeHtml("")).toBe("");
    });
});
