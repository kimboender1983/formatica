import { parseFormSchema, SchemaValidationError } from "@formatica/core";

describe("parseFormSchema", () => {
    it("parses a valid schema", () => {
        const schema = parseFormSchema({
            fields: [
                { type: "text", name: "firstName", label: "First Name" },
                { type: "text", name: "lastName", label: "Last Name" },
            ],
        });

        expect(schema.fields).toHaveLength(2);
    });

    it("parses a schema with id, version, and settings", () => {
        const schema = parseFormSchema({
            id: "contact-form",
            version: "1.0.0",
            fields: [{ type: "text", name: "name" }],
            settings: { layout: "vertical", size: "medium" },
        });

        expect(schema.id).toBe("contact-form");
        expect(schema.version).toBe("1.0.0");
        expect(schema.settings?.layout).toBe("vertical");
    });

    it("throws SchemaValidationError for non-object input", () => {
        expect(() => parseFormSchema("not an object")).toThrow(SchemaValidationError);
        expect(() => parseFormSchema(null)).toThrow(SchemaValidationError);
    });

    it("throws SchemaValidationError when fields is missing", () => {
        expect(() => parseFormSchema({})).toThrow(SchemaValidationError);
    });

    it("throws SchemaValidationError for fields without a name", () => {
        expect(() =>
            parseFormSchema({
                fields: [{ type: "text" }],
            }),
        ).toThrow(SchemaValidationError);
    });

    it("throws SchemaValidationError for unknown field types", () => {
        try {
            parseFormSchema({
                fields: [{ type: "unknown-widget", name: "x" }],
            });
            expect.fail("Should have thrown");
        } catch (err) {
            expect(err).toBeInstanceOf(SchemaValidationError);
            const schemaErr = err as SchemaValidationError;
            expect(schemaErr.errors.length).toBeGreaterThan(0);
            expect(schemaErr.errors[0]!.message).toContain("Unknown field type");
        }
    });

    it("throws SchemaValidationError for duplicate field names", () => {
        try {
            parseFormSchema({
                fields: [
                    { type: "text", name: "dup" },
                    { type: "text", name: "dup" },
                ],
            });
            expect.fail("Should have thrown");
        } catch (err) {
            expect(err).toBeInstanceOf(SchemaValidationError);
            const schemaErr = err as SchemaValidationError;
            expect(schemaErr.errors.some((e) => e.message.includes("Duplicate"))).toBe(true);
        }
    });

    it("throws SchemaValidationError for invalid settings", () => {
        try {
            parseFormSchema({
                fields: [{ type: "text", name: "a" }],
                settings: { layout: "diagonal" },
            });
            expect.fail("Should have thrown");
        } catch (err) {
            expect(err).toBeInstanceOf(SchemaValidationError);
        }
    });

    describe("all field types accepted", () => {
        const fieldTypes = [
            "text",
            "number",
            "textarea",
            "select",
            "checkbox",
            "checkbox-group",
            "radio",
            "switch",
            "date",
            "file",
            "slider",
            "tags",
            "richtext",
            "hidden",
            "phone",
        ] as const;

        for (const fieldType of fieldTypes) {
            it(`accepts field type: ${fieldType}`, () => {
                const field: Record<string, unknown> = {
                    type: fieldType,
                    name: `test_${fieldType}`,
                };
                // Types that require options
                if (["select", "radio", "checkbox-group"].includes(fieldType)) {
                    field.options = [{ label: "A", value: "a" }];
                }
                const schema = parseFormSchema({ fields: [field] });
                expect(schema.fields).toHaveLength(1);
            });
        }
    });

    describe("container nodes validate", () => {
        it("accepts a row node", () => {
            const schema = parseFormSchema({
                fields: [
                    {
                        type: "row",
                        children: [{ type: "text", name: "a" }],
                    },
                ],
            });
            expect(schema.fields).toHaveLength(1);
        });

        it("accepts a group node", () => {
            const schema = parseFormSchema({
                fields: [
                    {
                        type: "group",
                        title: "Details",
                        children: [{ type: "text", name: "b" }],
                    },
                ],
            });
            expect(schema.fields).toHaveLength(1);
        });

        it("accepts a steps node", () => {
            const schema = parseFormSchema({
                fields: [
                    {
                        type: "steps",
                        steps: [
                            {
                                title: "Step 1",
                                children: [{ type: "text", name: "c" }],
                            },
                        ],
                    },
                ],
            });
            expect(schema.fields).toHaveLength(1);
        });

        it("accepts a tabs node", () => {
            const schema = parseFormSchema({
                fields: [
                    {
                        type: "tabs",
                        tabs: [
                            {
                                title: "Tab 1",
                                children: [{ type: "text", name: "d" }],
                            },
                        ],
                    },
                ],
            });
            expect(schema.fields).toHaveLength(1);
        });

        it("accepts a divider node", () => {
            const schema = parseFormSchema({
                fields: [
                    { type: "text", name: "before" },
                    { type: "divider" },
                    { type: "text", name: "after" },
                ],
            });
            expect(schema.fields).toHaveLength(3);
        });

        it("rejects a row without children", () => {
            expect(() =>
                parseFormSchema({
                    fields: [{ type: "row" }],
                }),
            ).toThrow();
        });

        it("rejects steps without steps array", () => {
            expect(() =>
                parseFormSchema({
                    fields: [{ type: "steps" }],
                }),
            ).toThrow();
        });

        it("rejects tabs without tabs array", () => {
            expect(() =>
                parseFormSchema({
                    fields: [{ type: "tabs" }],
                }),
            ).toThrow();
        });
    });
});
