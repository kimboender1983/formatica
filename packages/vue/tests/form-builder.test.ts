import type { FormSchema } from "@formatica/vue";
import { FormBuilder } from "@formatica/vue";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";

function simpleSchema(): FormSchema {
    return {
        fields: [
            { type: "text", name: "firstName", label: "First Name" },
            { type: "text", name: "lastName", label: "Last Name" },
        ],
    };
}

describe("FormBuilder", () => {
    it("renders a form element", () => {
        const wrapper = mount(FormBuilder, {
            props: { schema: simpleSchema() },
        });

        expect(wrapper.find("form").exists()).toBe(true);
        wrapper.unmount();
    });

    it("renders a submit button", () => {
        const wrapper = mount(FormBuilder, {
            props: { schema: simpleSchema() },
        });

        const submitBtn = wrapper.find('button[type="submit"]');
        expect(submitBtn.exists()).toBe(true);
        expect(submitBtn.text()).toContain("Submit");
        wrapper.unmount();
    });

    it("renders a reset button", () => {
        const wrapper = mount(FormBuilder, {
            props: { schema: simpleSchema() },
        });

        const resetBtn = wrapper.find('button[type="reset"]');
        expect(resetBtn.exists()).toBe(true);
        expect(resetBtn.text()).toContain("Reset");
        wrapper.unmount();
    });

    it("renders form with rows (grid)", () => {
        const schema: FormSchema = {
            fields: [
                {
                    type: "row",
                    children: [
                        { type: "text", name: "first", label: "First" },
                        { type: "text", name: "last", label: "Last" },
                    ],
                },
            ],
        };

        const wrapper = mount(FormBuilder, {
            props: { schema },
        });

        expect(wrapper.find("form").exists()).toBe(true);
        // The row should render its children
        expect(wrapper.html()).toContain("first");
        wrapper.unmount();
    });

    it("renders form with groups", () => {
        const schema: FormSchema = {
            fields: [
                {
                    type: "group",
                    title: "Personal Info",
                    children: [{ type: "text", name: "name", label: "Name" }],
                },
            ],
        };

        const wrapper = mount(FormBuilder, {
            props: { schema },
        });

        expect(wrapper.find("form").exists()).toBe(true);
        expect(wrapper.html()).toContain("Personal Info");
        wrapper.unmount();
    });

    it("components prop registers a custom type", async () => {
        const CustomInput = defineComponent({
            name: "CustomInput",
            props: {
                modelValue: { type: String, default: "" },
            },
            emits: ["update:modelValue"],
            setup(props, { emit }) {
                return () =>
                    h("div", { class: "custom-input" }, [
                        h("span", {}, `Custom: ${props.modelValue}`),
                    ]);
            },
        });

        const schema: FormSchema = {
            fields: [{ type: "my-custom" as any, name: "custom", label: "Custom" }],
        };

        const wrapper = mount(FormBuilder, {
            props: {
                schema,
                components: { "my-custom": CustomInput },
            },
        });

        await nextTick();
        expect(wrapper.find(".custom-input").exists()).toBe(true);
        wrapper.unmount();
    });

    it("emits update:modelValue when values change", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
        };
        const wrapper = mount(FormBuilder, {
            props: { schema },
        });

        // Find the input and change its value to trigger update:modelValue
        const input = wrapper.find("input");
        if (input.exists()) {
            await input.setValue("Alice");
            await nextTick();
            await nextTick();
        }

        const events = wrapper.emitted("update:modelValue");
        expect(events).toBeDefined();
        expect(events!.length).toBeGreaterThan(0);
        const lastEmit = events![events!.length - 1][0] as Record<string, unknown>;
        expect(lastEmit).toHaveProperty("name");

        wrapper.unmount();
    });

    it("renders with the fc-form-builder class", () => {
        const wrapper = mount(FormBuilder, {
            props: { schema: simpleSchema() },
        });

        expect(wrapper.find("form.fc-form-builder").exists()).toBe(true);
        wrapper.unmount();
    });

    it("emits submit event with values on valid submission", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
        };

        const wrapper = mount(FormBuilder, {
            props: { schema },
        });

        await wrapper.find("form").trigger("submit");
        await nextTick();
        await nextTick();

        const submitEvents = wrapper.emitted("submit");
        expect(submitEvents).toBeDefined();
        if (submitEvents && submitEvents.length > 0) {
            const payload = submitEvents[0][0] as Record<string, unknown>;
            expect(payload).toHaveProperty("name");
        }

        wrapper.unmount();
    });

    it("v-model binding works (modelValue prop syncs into form)", async () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
        };

        const wrapper = mount(FormBuilder, {
            props: {
                schema,
                modelValue: { name: "Preset" },
            },
        });

        await nextTick();
        await nextTick();

        // The preset value should be reflected in the rendered input
        const input = wrapper.find("input");
        expect(input.exists()).toBe(true);
        expect((input.element as HTMLInputElement).value).toBe("Preset");

        wrapper.unmount();
    });
});
