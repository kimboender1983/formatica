import { useForm } from "@formatica/vue";
import type { FormSchema } from "@formatica/vue";
import { FormBuilder } from "@formatica/vue";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";

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

describe("i18n", () => {
    it("default locale 'en' renders labels from field.label", () => {
        const schema: FormSchema = {
            fields: [
                {
                    type: "text",
                    name: "name",
                    label: "Full Name",
                    translations: {
                        en: { label: "Full Name" },
                        nl: { label: "Volledige Naam" },
                    },
                },
            ],
        };

        const wrapper = mount(FormBuilder, {
            props: { schema, locale: "en" },
        });

        expect(wrapper.html()).toContain("Full Name");
        wrapper.unmount();
    });

    it("setting locale to 'nl' uses translations.nl.label", () => {
        const schema: FormSchema = {
            fields: [
                {
                    type: "text",
                    name: "name",
                    label: "Full Name",
                    translations: {
                        en: { label: "Full Name" },
                        nl: { label: "Volledige Naam" },
                    },
                },
            ],
        };

        const wrapper = mount(FormBuilder, {
            props: { schema, locale: "nl" },
        });

        expect(wrapper.html()).toContain("Volledige Naam");
        wrapper.unmount();
    });

    it("falls back to 'en' when locale key is missing", () => {
        const schema: FormSchema = {
            fields: [
                {
                    type: "text",
                    name: "name",
                    label: "Full Name",
                    translations: {
                        en: { label: "English Name" },
                        // no 'fr' translation
                    },
                },
            ],
        };

        const wrapper = mount(FormBuilder, {
            props: { schema, locale: "fr", fallbackLocale: "en" },
        });

        expect(wrapper.html()).toContain("English Name");
        wrapper.unmount();
    });

    it("form-level translations for submit/reset labels", () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
            translations: {
                en: { submit: "Send", reset: "Clear" },
                nl: { submit: "Versturen", reset: "Wissen" },
            },
        };

        const wrapper = mount(FormBuilder, {
            props: { schema, locale: "nl" },
        });

        const submitBtn = wrapper.find('button[type="submit"]');
        const resetBtn = wrapper.find('button[type="reset"]');
        expect(submitBtn.text()).toContain("Versturen");
        expect(resetBtn.text()).toContain("Wissen");

        wrapper.unmount();
    });

    it("form-level submit/reset defaults to english", () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
            translations: {
                en: { submit: "Submit Form", reset: "Reset Form" },
            },
        };

        const wrapper = mount(FormBuilder, {
            props: { schema, locale: "en" },
        });

        expect(wrapper.find('button[type="submit"]').text()).toContain("Submit Form");
        expect(wrapper.find('button[type="reset"]').text()).toContain("Reset Form");

        wrapper.unmount();
    });

    it("useForm exposes locale and setLocale", () => {
        const schema: FormSchema = {
            fields: [{ type: "text", name: "name", label: "Name" }],
        };

        const { result: form, unmount } = withSetup(() => useForm(schema, { locale: "en" }));

        expect(form.locale.value).toBe("en");

        form.setLocale("nl");
        expect(form.locale.value).toBe("nl");

        unmount();
    });
});
