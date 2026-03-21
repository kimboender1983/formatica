// ---------------------------------------------------------------------------
// FormCraft – Example: Contact Form (single-step with groups)
// ---------------------------------------------------------------------------

import type { FormSchema } from "@formcraft/vue";

export const contactSchema: FormSchema = {
    id: "contact-form",
    version: "1.0.0",
    fields: [
        {
            type: "group",
            title: "Contact Information",
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "text",
                            name: "name",
                            label: "Full name",
                            placeholder: "John Doe",
                            required: true,
                            rules: ["required", "minLength:2"],
                            autocomplete: "name",
                            span: 6,
                            translations: {
                                en: {
                                    label: "Full name",
                                    placeholder: "John Doe",
                                    errors: {
                                        required: "Name is required",
                                        minLength: "At least 2 characters",
                                    },
                                },
                                nl: {
                                    label: "Volledige naam",
                                    placeholder: "Jan Jansen",
                                    errors: {
                                        required: "Naam is verplicht",
                                        minLength: "Minimaal 2 tekens",
                                    },
                                },
                            },
                        },
                        {
                            type: "text",
                            name: "email",
                            label: "Email address",
                            placeholder: "you@example.com",
                            inputType: "email",
                            required: true,
                            rules: ["required", "email"],
                            autocomplete: "email",
                            span: 6,
                            translations: {
                                en: {
                                    label: "Email address",
                                    placeholder: "you@example.com",
                                    errors: {
                                        required: "Email is required",
                                        email: "Enter a valid email address",
                                    },
                                },
                                nl: {
                                    label: "E-mailadres",
                                    placeholder: "jij@voorbeeld.nl",
                                    errors: {
                                        required: "E-mail is verplicht",
                                        email: "Voer een geldig e-mailadres in",
                                    },
                                },
                            },
                        },
                    ],
                },
                {
                    type: "text",
                    name: "phone",
                    label: "Phone number",
                    placeholder: "+1 (555) 000-0000",
                    inputType: "tel",
                    autocomplete: "tel",
                    translations: {
                        en: {
                            label: "Phone number",
                            placeholder: "+1 (555) 000-0000",
                        },
                        nl: {
                            label: "Telefoonnummer",
                            placeholder: "+31 6 12345678",
                        },
                    },
                },
            ],
        },
        {
            type: "group",
            title: "Your Message",
            children: [
                {
                    type: "select",
                    name: "subject",
                    label: "Subject",
                    required: true,
                    rules: ["required"],
                    clearable: true,
                    options: [
                        { label: "General Inquiry", value: "general" },
                        { label: "Technical Support", value: "support" },
                        { label: "Sales", value: "sales" },
                        { label: "Partnership", value: "partnership" },
                        { label: "Press & Media", value: "press" },
                    ],
                    translations: {
                        en: {
                            label: "Subject",
                            placeholder: "Select a subject",
                            options: {
                                general: "General Inquiry",
                                support: "Technical Support",
                                sales: "Sales",
                                partnership: "Partnership",
                                press: "Press & Media",
                            },
                            errors: { required: "Please select a subject" },
                        },
                        nl: {
                            label: "Onderwerp",
                            placeholder: "Selecteer een onderwerp",
                            options: {
                                general: "Algemene vraag",
                                support: "Technische ondersteuning",
                                sales: "Verkoop",
                                partnership: "Samenwerking",
                                press: "Pers & Media",
                            },
                            errors: { required: "Selecteer een onderwerp" },
                        },
                    },
                },
                {
                    type: "textarea",
                    name: "message",
                    label: "Message",
                    placeholder: "How can we help you?",
                    required: true,
                    rules: ["required", "minLength:10"],
                    rows: 5,
                    maxLength: 2000,
                    helpText: "Please describe your inquiry in detail (max 2000 characters)",
                    translations: {
                        en: {
                            label: "Message",
                            placeholder: "How can we help you?",
                            helpText:
                                "Please describe your inquiry in detail (max 2000 characters)",
                            errors: {
                                required: "Message is required",
                                minLength: "At least 10 characters",
                            },
                        },
                        nl: {
                            label: "Bericht",
                            placeholder: "Hoe kunnen we je helpen?",
                            helpText: "Beschrijf je vraag in detail (max 2000 tekens)",
                            errors: {
                                required: "Bericht is verplicht",
                                minLength: "Minimaal 10 tekens",
                            },
                        },
                    },
                },
                {
                    type: "file",
                    name: "attachment",
                    label: "Attachment",
                    accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg",
                    maxSize: 5242880, // 5 MB
                    maxFiles: 3,
                    multiple: true,
                    dragDrop: true,
                    helpText:
                        "Upload up to 3 files (max 5 MB each). Accepted: PDF, Word, PNG, JPG.",
                    translations: {
                        en: {
                            label: "Attachment",
                            helpText:
                                "Upload up to 3 files (max 5 MB each). Accepted: PDF, Word, PNG, JPG.",
                        },
                        nl: {
                            label: "Bijlage",
                            helpText:
                                "Upload maximaal 3 bestanden (max 5 MB per stuk). Toegestaan: PDF, Word, PNG, JPG.",
                        },
                    },
                },
            ],
        },
    ],
    settings: {
        layout: "vertical",
        size: "medium",
        validateOnBlur: true,
        scrollToError: true,
    },
    translations: {
        en: {
            submit: "Send Message",
            reset: "Clear Form",
        },
        nl: {
            submit: "Bericht versturen",
            reset: "Formulier wissen",
        },
    },
};
