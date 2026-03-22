import { extractFields, isFieldNode } from "@formatica/core";
import type { SchemaNode } from "@formatica/core";

describe("extractFields", () => {
    it("extracts flat fields", () => {
        const nodes: SchemaNode[] = [
            { type: "text", name: "first" },
            { type: "number", name: "age" },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["first", "age"]);
    });

    it("extracts fields nested in rows", () => {
        const nodes: SchemaNode[] = [
            {
                type: "row",
                children: [
                    { type: "text", name: "a" },
                    { type: "text", name: "b" },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["a", "b"]);
    });

    it("extracts fields nested in groups", () => {
        const nodes: SchemaNode[] = [
            {
                type: "group",
                title: "Personal",
                children: [
                    { type: "text", name: "name" },
                    { type: "text", name: "email" },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
    });

    it("extracts fields nested in steps", () => {
        const nodes: SchemaNode[] = [
            {
                type: "steps",
                steps: [
                    {
                        title: "Step 1",
                        children: [{ type: "text", name: "step1field" }],
                    },
                    {
                        title: "Step 2",
                        children: [{ type: "number", name: "step2field" }],
                    },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["step1field", "step2field"]);
    });

    it("extracts fields nested in tabs", () => {
        const nodes: SchemaNode[] = [
            {
                type: "tabs",
                tabs: [
                    {
                        title: "Tab A",
                        children: [{ type: "text", name: "tabAfield" }],
                    },
                    {
                        title: "Tab B",
                        children: [{ type: "textarea", name: "tabBfield" }],
                    },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["tabAfield", "tabBfield"]);
    });

    it("ignores divider nodes", () => {
        const nodes: SchemaNode[] = [
            { type: "text", name: "before" },
            { type: "divider" },
            { type: "text", name: "after" },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
    });

    it("handles deeply nested structures", () => {
        const nodes: SchemaNode[] = [
            {
                type: "group",
                title: "Outer",
                children: [
                    {
                        type: "row",
                        children: [{ type: "text", name: "deep" }],
                    },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(1);
        expect(fields[0]!.name).toBe("deep");
    });
});

describe("isFieldNode", () => {
    it("returns true for field nodes", () => {
        expect(isFieldNode({ type: "text", name: "test" })).toBe(true);
        expect(isFieldNode({ type: "number", name: "age" })).toBe(true);
    });

    it("returns false for container nodes", () => {
        expect(isFieldNode({ type: "row", children: [] })).toBe(false);
        expect(isFieldNode({ type: "divider" })).toBe(false);
        expect(isFieldNode({ type: "group", children: [] })).toBe(false);
    });
});
