import { parseFormSchema, SchemaValidationError } from "@formcraft/vue";

describe("parseFormSchema", () => {
    it("parses a valid simple schema", () => {
        const schema = parseFormSchema({
            fields: [
                { type: "text", name: "firstName", label: "First Name" },
                { type: "text", name: "lastName", label: "Last Name" },
            ],
        });

        expect(schema.fields).toHaveLength(2);
        expect(schema.fields[0]).toMatchObject({
            type: "text",
            name: "firstName",
        });
    });

    it("parses a schema with rows, groups, and dividers", () => {
        const schema = parseFormSchema({
            fields: [
                {
                    type: "row",
                    children: [
                        { type: "text", name: "first", label: "First" },
                        { type: "text", name: "last", label: "Last" },
                    ],
                },
                { type: "divider" },
                {
                    type: "group",
                    title: "Address",
                    children: [
                        { type: "text", name: "street", label: "Street" },
                        { type: "text", name: "city", label: "City" },
                    ],
                },
            ],
        });

        expect(schema.fields).toHaveLength(3);
        expect(schema.fields[0]).toMatchObject({ type: "row" });
        expect(schema.fields[1]).toMatchObject({ type: "divider" });
        expect(schema.fields[2]).toMatchObject({ type: "group" });
    });

    it("throws SchemaValidationError when fields property is missing", () => {
        expect(() => parseFormSchema({ noFields: true })).toThrow(SchemaValidationError);

        try {
            parseFormSchema({ noFields: true });
        } catch (e) {
            const err = e as SchemaValidationError;
            expect(err.errors).toBeInstanceOf(Array);
            expect(err.errors.length).toBeGreaterThan(0);
            expect(err.errors[0].message).toContain('"fields" must be an array');
        }
    });

    it("throws SchemaValidationError for an invalid field type", () => {
        expect(() =>
            parseFormSchema({
                fields: [{ type: "nonexistent", name: "foo" }],
            }),
        ).toThrow(SchemaValidationError);

        try {
            parseFormSchema({ fields: [{ type: "nonexistent", name: "foo" }] });
        } catch (e) {
            const err = e as SchemaValidationError;
            expect(err.errors.some((e) => e.message.includes("Unknown field type"))).toBe(true);
        }
    });

    it("accepts an empty fields array as valid", () => {
        const schema = parseFormSchema({ fields: [] });
        expect(schema.fields).toHaveLength(0);
    });

    it("parses a schema with all known field types", () => {
        const schema = parseFormSchema({
            fields: [
                { type: "text", name: "f1" },
                { type: "number", name: "f2" },
                { type: "textarea", name: "f3" },
                {
                    type: "select",
                    name: "f4",
                    options: [{ label: "A", value: "a" }],
                },
                { type: "checkbox", name: "f5" },
                {
                    type: "checkbox-group",
                    name: "f6",
                    options: [{ label: "A", value: "a" }],
                },
                {
                    type: "radio",
                    name: "f7",
                    options: [{ label: "A", value: "a" }],
                },
                { type: "switch", name: "f8" },
                { type: "date", name: "f9" },
                { type: "file", name: "f10" },
                { type: "slider", name: "f11" },
                { type: "tags", name: "f12" },
                { type: "richtext", name: "f13" },
                { type: "hidden", name: "f14" },
                { type: "phone", name: "f15" },
            ],
        });

        expect(schema.fields).toHaveLength(15);
    });

    it("throws SchemaValidationError when schema is not a plain object", () => {
        expect(() => parseFormSchema(null)).toThrow(SchemaValidationError);
        expect(() => parseFormSchema("string")).toThrow(SchemaValidationError);
    });

    it("preserves id, version, and settings", () => {
        const schema = parseFormSchema({
            id: "my-form",
            version: "1.0.0",
            fields: [{ type: "text", name: "name" }],
            settings: { layout: "horizontal", size: "large" },
        });

        expect(schema.id).toBe("my-form");
        expect(schema.version).toBe("1.0.0");
        expect(schema.settings).toMatchObject({
            layout: "horizontal",
            size: "large",
        });
    });

    it("throws for duplicate field names", () => {
        expect(() =>
            parseFormSchema({
                fields: [
                    { type: "text", name: "dup" },
                    { type: "text", name: "dup" },
                ],
            }),
        ).toThrow(SchemaValidationError);
    });

    it("throws when select field is missing options", () => {
        expect(() =>
            parseFormSchema({
                fields: [{ type: "select", name: "s1" }],
            }),
        ).toThrow(SchemaValidationError);
    });
});
