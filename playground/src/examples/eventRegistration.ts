// ---------------------------------------------------------------------------
// FormCraft – Example: Event Registration Form (groups, checkbox groups)
// ---------------------------------------------------------------------------

import type { FormSchema } from "@formcraft/vue";

export const eventRegistrationSchema: FormSchema = {
    id: "event-registration",
    version: "1.0.0",
    fields: [
        {
            type: "group",
            title: "Attendee",
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "text",
                            name: "fullName",
                            label: "Full name",
                            span: 8,
                            rules: ["required"],
                            translations: {
                                en: {
                                    label: "Full name",
                                    errors: { required: "Full name is required" },
                                },
                                nl: {
                                    label: "Volledige naam",
                                    errors: { required: "Naam is verplicht" },
                                },
                            },
                        },
                        {
                            type: "select",
                            name: "title",
                            label: "Title",
                            span: 4,
                            options: [
                                { label: "Mr", value: "mr" },
                                { label: "Mrs", value: "mrs" },
                                { label: "Ms", value: "ms" },
                                { label: "Dr", value: "dr" },
                                { label: "Prof", value: "prof" },
                            ],
                            translations: {
                                en: { label: "Title" },
                                nl: { label: "Aanhef" },
                            },
                        },
                    ],
                },
                {
                    type: "text",
                    name: "email",
                    label: "Email",
                    inputType: "email",
                    rules: ["required", "email"],
                    translations: {
                        en: {
                            label: "Email",
                            errors: {
                                required: "Email is required",
                                email: "Enter a valid email address",
                            },
                        },
                        nl: {
                            label: "E-mail",
                            errors: {
                                required: "E-mail is verplicht",
                                email: "Voer een geldig e-mailadres in",
                            },
                        },
                    },
                },
                {
                    type: "phone",
                    name: "phone",
                    label: "Phone number",
                    defaultCountry: "NL",
                    rules: ["phone"],
                    translations: {
                        en: { label: "Phone number" },
                        nl: { label: "Telefoonnummer" },
                    },
                },
                {
                    type: "text",
                    name: "organization",
                    label: "Organization / Company",
                    translations: {
                        en: { label: "Organization / Company" },
                        nl: { label: "Organisatie / Bedrijf" },
                    },
                },
            ],
        },
        {
            type: "group",
            title: "Event Details",
            children: [
                {
                    type: "select",
                    name: "ticketType",
                    label: "Ticket type",
                    rules: ["required"],
                    options: [
                        { label: "Standard \u2014 \u20AC99", value: "standard" },
                        { label: "VIP \u2014 \u20AC249", value: "vip" },
                        { label: "Speaker \u2014 Free", value: "speaker" },
                        { label: "Student \u2014 \u20AC49", value: "student" },
                    ],
                    translations: {
                        en: {
                            label: "Ticket type",
                            errors: { required: "Please select a ticket type" },
                        },
                        nl: {
                            label: "Tickettype",
                            errors: { required: "Selecteer een tickettype" },
                        },
                    },
                },
                {
                    type: "row",
                    children: [
                        {
                            type: "checkbox-group",
                            name: "sessions",
                            label: "Sessions to attend",
                            span: 12,
                            options: [
                                {
                                    label: "Keynote: Future of Web",
                                    value: "keynote",
                                },
                                {
                                    label: "Workshop: Vue 3 Deep Dive",
                                    value: "vue-workshop",
                                },
                                {
                                    label: "Workshop: TypeScript Patterns",
                                    value: "ts-workshop",
                                },
                                {
                                    label: "Panel: Open Source Sustainability",
                                    value: "panel",
                                },
                                {
                                    label: "Networking Dinner",
                                    value: "dinner",
                                },
                            ],
                            translations: {
                                en: { label: "Sessions to attend" },
                                nl: { label: "Sessies om bij te wonen" },
                            },
                        },
                    ],
                },
                {
                    type: "textarea",
                    name: "dietary",
                    label: "Dietary requirements",
                    placeholder: "Any allergies or preferences?",
                    rows: 2,
                    translations: {
                        en: {
                            label: "Dietary requirements",
                            placeholder: "Any allergies or preferences?",
                        },
                        nl: {
                            label: "Dieetwensen",
                            placeholder: "Eventuele allergieën of voorkeuren?",
                        },
                    },
                },
            ],
        },
        {
            type: "group",
            title: "Additional Options",
            children: [
                {
                    type: "switch",
                    name: "needsHotel",
                    label: "I need hotel accommodation",
                    translations: {
                        en: { label: "I need hotel accommodation" },
                        nl: { label: "Ik heb hotelaccommodatie nodig" },
                    },
                },
                {
                    type: "switch",
                    name: "needsTransport",
                    label: "I need airport transfer",
                    translations: {
                        en: { label: "I need airport transfer" },
                        nl: { label: "Ik heb luchthaven transfer nodig" },
                    },
                },
                {
                    type: "row",
                    children: [
                        {
                            type: "number",
                            name: "guests",
                            label: "Additional guests",
                            span: 6,
                            min: 0,
                            max: 5,
                            translations: {
                                en: { label: "Additional guests" },
                                nl: { label: "Extra gasten" },
                            },
                        },
                        {
                            type: "text",
                            name: "promoCode",
                            label: "Promo code",
                            span: 6,
                            placeholder: "Enter code",
                            translations: {
                                en: {
                                    label: "Promo code",
                                    placeholder: "Enter code",
                                },
                                nl: {
                                    label: "Promotiecode",
                                    placeholder: "Voer code in",
                                },
                            },
                        },
                    ],
                },
            ],
        },
        { type: "divider" },
        {
            type: "checkbox",
            name: "terms",
            label: "I accept the terms and conditions",
            rules: ["required"],
            translations: {
                en: {
                    label: "I accept the terms and conditions",
                    errors: {
                        required: "You must accept the terms and conditions",
                    },
                },
                nl: {
                    label: "Ik accepteer de algemene voorwaarden",
                    errors: {
                        required: "U moet de algemene voorwaarden accepteren",
                    },
                },
            },
        },
        {
            type: "checkbox",
            name: "marketing",
            label: "Send me event updates and offers",
            translations: {
                en: { label: "Send me event updates and offers" },
                nl: { label: "Stuur mij evenementupdates en aanbiedingen" },
            },
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
            submit: "Register",
            reset: "Clear Form",
        },
        nl: {
            submit: "Registreren",
            reset: "Formulier wissen",
        },
    },
};
