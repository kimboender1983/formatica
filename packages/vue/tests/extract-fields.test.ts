import type { SchemaNode } from "@formatica/vue";
import { extractFields, isFieldNode } from "@formatica/vue";

describe("extractFields", () => {
    it("extracts fields from a flat array", () => {
        const nodes: SchemaNode[] = [
            { type: "text", name: "firstName" },
            { type: "number", name: "age" },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields[0].name).toBe("firstName");
        expect(fields[1].name).toBe("age");
    });

    it("extracts fields from nested rows", () => {
        const nodes: SchemaNode[] = [
            {
                type: "row",
                children: [
                    { type: "text", name: "first" },
                    { type: "text", name: "last" },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["first", "last"]);
    });

    it("extracts fields from nested groups", () => {
        const nodes: SchemaNode[] = [
            {
                type: "group",
                title: "Contact",
                children: [
                    { type: "text", name: "email" },
                    { type: "text", name: "phone" },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["email", "phone"]);
    });

    it("extracts fields from steps node", () => {
        const nodes: SchemaNode[] = [
            {
                type: "steps",
                steps: [
                    {
                        title: "Step 1",
                        children: [{ type: "text", name: "name" }],
                    },
                    {
                        title: "Step 2",
                        children: [{ type: "text", name: "email" }],
                    },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["name", "email"]);
    });

    it("extracts fields from tabs node", () => {
        const nodes: SchemaNode[] = [
            {
                type: "tabs",
                tabs: [
                    {
                        title: "Tab A",
                        children: [{ type: "text", name: "a1" }],
                    },
                    {
                        title: "Tab B",
                        children: [{ type: "number", name: "b1" }],
                    },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["a1", "b1"]);
    });

    it("extracts fields from deeply nested structures (group inside step inside tabs)", () => {
        const nodes: SchemaNode[] = [
            {
                type: "tabs",
                tabs: [
                    {
                        title: "Tab 1",
                        children: [
                            {
                                type: "steps",
                                steps: [
                                    {
                                        title: "Step 1",
                                        children: [
                                            {
                                                type: "group",
                                                title: "Details",
                                                children: [{ type: "text", name: "deep" }],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(1);
        expect(fields[0].name).toBe("deep");
    });

    it("ignores divider and html nodes", () => {
        const nodes: SchemaNode[] = [
            { type: "text", name: "before" },
            { type: "divider" },
            { type: "html", content: "<p>Hello</p>" },
            { type: "text", name: "after" },
        ];
        const fields = extractFields(nodes);
        expect(fields).toHaveLength(2);
        expect(fields.map((f) => f.name)).toEqual(["before", "after"]);
    });
});

describe("isFieldNode", () => {
    it("returns true for field nodes", () => {
        expect(isFieldNode({ type: "text", name: "foo" })).toBe(true);
        expect(isFieldNode({ type: "number", name: "bar" })).toBe(true);
        expect(isFieldNode({ type: "checkbox", name: "baz" })).toBe(true);
    });

    it("returns false for container nodes", () => {
        expect(isFieldNode({ type: "row", children: [] })).toBe(false);
        expect(isFieldNode({ type: "group", children: [] })).toBe(false);
        expect(isFieldNode({ type: "divider" })).toBe(false);
        expect(isFieldNode({ type: "html", content: "<p>hi</p>" })).toBe(false);
        expect(isFieldNode({ type: "steps", steps: [{ title: "S1", children: [] }] })).toBe(false);
        expect(isFieldNode({ type: "tabs", tabs: [{ title: "T1", children: [] }] })).toBe(false);
    });
});
