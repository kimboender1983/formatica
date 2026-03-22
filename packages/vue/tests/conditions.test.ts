import type { FormSchema } from "@formatica/vue";
import { useForm } from "@formatica/vue";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

/**
 * evaluateCondition is not exported from the barrel, so we test conditions
 * through useForm's field visibility system.
 */
function withSetup<T>(fn: () => T): { result: T; unmount: () => void } {
    let result!: T;
    const Comp = defineComponent({
        setup() {
            result = fn();
            return () => h("div");
        },
    });
    const wrapper = mount(Comp);
    return { result, unmount: () => wrapper.unmount() };
}

describe("conditions (via useForm field visibility)", () => {
    it("field is visible when eq condition is met", () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "type", label: "Type" },
                {
                    type: "text",
                    name: "companyName",
                    label: "Company Name",
                    condition: { field: "type", operator: "eq", value: "business" },
                },
            ],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema));
        const field = form.getField("companyName")!;

        // Initially, type is "" so condition not met
        expect(field.visible.value).toBe(false);

        // Set type to "business" -> condition met
        form.setFieldValue("type", "business");
        expect(field.visible.value).toBe(true);

        // Change to something else -> hidden again
        form.setFieldValue("type", "personal");
        expect(field.visible.value).toBe(false);

        unmount();
    });

    it("field is visible when neq condition is met", () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "role", label: "Role" },
                {
                    type: "text",
                    name: "extraInfo",
                    label: "Extra",
                    condition: { field: "role", operator: "neq", value: "admin" },
                },
            ],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema));
        const field = form.getField("extraInfo")!;

        // Initially role is "" which is not "admin", so visible
        expect(field.visible.value).toBe(true);

        form.setFieldValue("role", "admin");
        expect(field.visible.value).toBe(false);

        form.setFieldValue("role", "user");
        expect(field.visible.value).toBe(true);

        unmount();
    });

    it("field is visible when gt condition is met", () => {
        const schema: FormSchema = {
            fields: [
                { type: "number", name: "quantity", label: "Quantity" },
                {
                    type: "text",
                    name: "bulkNote",
                    label: "Bulk Note",
                    condition: { field: "quantity", operator: "gt", value: 10 },
                },
            ],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema));
        const field = form.getField("bulkNote")!;

        // quantity is null initially, Number(null) = 0 which is not > 10
        expect(field.visible.value).toBe(false);

        form.setFieldValue("quantity", 15);
        expect(field.visible.value).toBe(true);

        form.setFieldValue("quantity", 5);
        expect(field.visible.value).toBe(false);

        unmount();
    });

    it("field visibility with 'in' operator", () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "country", label: "Country" },
                {
                    type: "text",
                    name: "state",
                    label: "State",
                    condition: {
                        field: "country",
                        operator: "in",
                        value: ["US", "CA"],
                    },
                },
            ],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema));
        const field = form.getField("state")!;

        expect(field.visible.value).toBe(false);

        form.setFieldValue("country", "US");
        expect(field.visible.value).toBe(true);

        form.setFieldValue("country", "NL");
        expect(field.visible.value).toBe(false);

        unmount();
    });

    it("field visibility with 'empty' operator", () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "code", label: "Code" },
                {
                    type: "text",
                    name: "noCode",
                    label: "No Code Message",
                    condition: { field: "code", operator: "empty" },
                },
            ],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema));
        const field = form.getField("noCode")!;

        // Initially code is "" which is empty -> visible
        expect(field.visible.value).toBe(true);

        form.setFieldValue("code", "ABC");
        expect(field.visible.value).toBe(false);

        form.setFieldValue("code", "");
        expect(field.visible.value).toBe(true);

        unmount();
    });

    it("field visibility with 'notEmpty' operator", () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "email", label: "Email" },
                {
                    type: "checkbox",
                    name: "subscribe",
                    label: "Subscribe",
                    condition: { field: "email", operator: "notEmpty" },
                },
            ],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema));
        const field = form.getField("subscribe")!;

        expect(field.visible.value).toBe(false);

        form.setFieldValue("email", "a@b.com");
        expect(field.visible.value).toBe(true);

        unmount();
    });

    it("compound AND condition", () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "type", label: "Type" },
                { type: "number", name: "amount", label: "Amount" },
                {
                    type: "text",
                    name: "approval",
                    label: "Approval",
                    condition: {
                        and: [
                            { field: "type", operator: "eq", value: "expense" },
                            { field: "amount", operator: "gt", value: 1000 },
                        ],
                    },
                },
            ],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema));
        const field = form.getField("approval")!;

        expect(field.visible.value).toBe(false);

        form.setFieldValue("type", "expense");
        expect(field.visible.value).toBe(false); // amount still null

        form.setFieldValue("amount", 2000);
        expect(field.visible.value).toBe(true);

        form.setFieldValue("type", "income");
        expect(field.visible.value).toBe(false);

        unmount();
    });

    it("compound OR condition", () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "status", label: "Status" },
                {
                    type: "text",
                    name: "action",
                    label: "Action",
                    condition: {
                        or: [
                            { field: "status", operator: "eq", value: "draft" },
                            { field: "status", operator: "eq", value: "review" },
                        ],
                    },
                },
            ],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema));
        const field = form.getField("action")!;

        expect(field.visible.value).toBe(false);

        form.setFieldValue("status", "draft");
        expect(field.visible.value).toBe(true);

        form.setFieldValue("status", "review");
        expect(field.visible.value).toBe(true);

        form.setFieldValue("status", "published");
        expect(field.visible.value).toBe(false);

        unmount();
    });
});
