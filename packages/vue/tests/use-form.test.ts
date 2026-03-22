import type { FormSchema } from "@formatica/vue";
import { useForm } from "@formatica/vue";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";

/**
 * Helper: runs a callback inside a mounted Vue component so that
 * provide/inject and Vue reactivity (watchers, computed) work correctly.
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

function simpleSchema(overrides?: Partial<FormSchema>): FormSchema {
    return {
        fields: [
            { type: "text", name: "name", label: "Name" },
            { type: "checkbox", name: "agree", label: "Agree" },
            { type: "tags", name: "skills", label: "Skills" },
            { type: "number", name: "age", label: "Age" },
        ],
        ...overrides,
    };
}

describe("useForm", () => {
    it("creates form with correct initial values based on field types", () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        expect(form.values.name).toBe("");
        expect(form.values.agree).toBe(false);
        expect(form.values.skills).toEqual([]);
        expect(form.values.age).toBe(null);

        unmount();
    });

    it("setFieldValue updates values reactively", async () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        form.setFieldValue("name", "Alice");
        expect(form.values.name).toBe("Alice");

        form.setFieldValue("age", 30);
        expect(form.values.age).toBe(30);

        unmount();
    });

    it("validate() returns false when required fields are empty", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "email", label: "Email", required: true }],
        };
        const { result: form, unmount } = withSetup(() => useForm(schema));

        const valid = await form.validate();
        expect(valid).toBe(false);
        expect(form.errors.email.length).toBeGreaterThan(0);

        unmount();
    });

    it("validate() returns true when all rules pass", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "email", label: "Email", required: true }],
        };
        const { result: form, unmount } = withSetup(() => useForm(schema));

        form.setFieldValue("email", "test@example.com");
        const valid = await form.validate();
        expect(valid).toBe(true);

        unmount();
    });

    it("validateField() validates a single field", async () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "email", label: "Email", rules: "required|email" },
                { type: "text", name: "name", label: "Name", required: true },
            ],
        };
        const { result: form, unmount } = withSetup(() => useForm(schema));

        const errors = await form.validateField("email");
        expect(errors.length).toBeGreaterThan(0);

        // Name should not have errors yet (not validated)
        expect(form.errors.name).toBeUndefined();

        unmount();
    });

    it("reset() restores initial values", async () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        form.setFieldValue("name", "Bob");
        form.setFieldValue("age", 25);
        await nextTick();

        form.reset();

        expect(form.values.name).toBe("");
        expect(form.values.age).toBe(null);
        expect(form.dirty.name).toBeFalsy();
        expect(form.touched.name).toBeFalsy();

        unmount();
    });

    it("clear() clears all values and errors", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name", required: true }],
        };
        const { result: form, unmount } = withSetup(() => useForm(schema));

        form.setFieldValue("name", "Alice");
        await form.validate();
        form.setError("name", ["Server error"]);

        form.clear();

        expect(form.values.name).toBe(null);
        expect(form.errors.name).toBeUndefined();

        unmount();
    });

    it("setError() adds a server-side error", () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        form.setError("name", ["Name is already taken"]);
        expect(form.errors.name).toEqual(["Name is already taken"]);

        unmount();
    });

    it("clearError() removes an error", () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        form.setError("name", ["Error"]);
        expect(form.errors.name).toEqual(["Error"]);

        form.clearError("name");
        expect(form.errors.name).toBeUndefined();

        unmount();
    });

    it("submit() calls handler when valid", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
        };
        const handler = vi.fn();
        const { result: form, unmount } = withSetup(() => useForm(schema));

        form.setFieldValue("name", "Alice");
        await form.submit(handler);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Alice" }),
            expect.any(Object),
        );

        unmount();
    });

    it("submit() does NOT call handler when invalid", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name", required: true }],
        };
        const handler = vi.fn();
        const { result: form, unmount } = withSetup(() => useForm(schema));

        await form.submit(handler);

        expect(handler).not.toHaveBeenCalled();

        unmount();
    });

    it("touched tracking works via submit", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
        };
        const { result: form, unmount } = withSetup(() => useForm(schema));

        expect(form.touched.name).toBeFalsy();

        await form.submit();
        expect(form.touched.name).toBe(true);

        unmount();
    });

    it("dirty tracking works when values change", async () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        expect(form.dirty.name).toBeFalsy();
        expect(form.isDirty.value).toBe(false);

        form.setFieldValue("name", "Changed");
        await nextTick();

        expect(form.dirty.name).toBe(true);
        expect(form.isDirty.value).toBe(true);

        unmount();
    });

    it("isValid computed updates reactively", async () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        expect(form.isValid.value).toBe(true);

        form.setError("name", ["Error"]);
        await nextTick();
        expect(form.isValid.value).toBe(false);

        form.clearError("name");
        await nextTick();
        expect(form.isValid.value).toBe(true);

        unmount();
    });

    it("submitCount increments on each submit call", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
        };
        const { result: form, unmount } = withSetup(() => useForm(schema));

        expect(form.submitCount.value).toBe(0);
        await form.submit();
        expect(form.submitCount.value).toBe(1);
        await form.submit();
        expect(form.submitCount.value).toBe(2);

        unmount();
    });

    it("getField returns a FieldInstance", () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        const field = form.getField("name");
        expect(field).toBeDefined();
        expect(field?.name).toBe("name");
        expect(field?.schema.type).toBe("text");

        unmount();
    });

    it("clearErrors() removes all errors", () => {
        const { result: form, unmount } = withSetup(() => useForm(simpleSchema()));

        form.setError("name", ["Error 1"]);
        form.setError("age", ["Error 2"]);
        expect(Object.keys(form.errors).length).toBe(2);

        form.clearErrors();
        expect(Object.keys(form.errors).length).toBe(0);

        unmount();
    });

    it("on() registers event listeners", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
        };
        const { result: form, unmount } = withSetup(() => useForm(schema));

        const submitHandler = vi.fn();
        form.on("submit", submitHandler);

        form.setFieldValue("name", "Test");
        await form.submit();

        expect(submitHandler).toHaveBeenCalledWith(
            expect.objectContaining({
                values: expect.objectContaining({ name: "Test" }),
            }),
        );

        unmount();
    });

    it("respects defaultValue on field schema", () => {
        const schema: FormSchema = {
            fields: [
                { type: "text", name: "name", label: "Name", defaultValue: "Default" },
                { type: "number", name: "count", label: "Count", defaultValue: 42 },
            ],
        };
        const { result: form, unmount } = withSetup(() => useForm(schema));

        expect(form.values.name).toBe("Default");
        expect(form.values.count).toBe(42);

        unmount();
    });
});
