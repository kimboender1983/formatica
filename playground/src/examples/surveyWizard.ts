// ---------------------------------------------------------------------------
// FormCraft – Example: Survey Wizard (multi-step with branching)
// ---------------------------------------------------------------------------

import type { FormSchema } from "@formcraft/vue";

export const surveySchema: FormSchema = {
    id: "survey-wizard",
    version: "1.0.0",
    fields: [
        {
            type: "steps",
            linear: false,
            steps: [
                {
                    title: "About You",
                    description: "Some background info",
                    icon: "user",
                    children: [
                        {
                            type: "number",
                            name: "age",
                            label: "Age",
                            min: 16,
                            max: 120,
                            step: 1,
                            required: true,
                            rules: ["required"],
                            translations: {
                                en: {
                                    label: "Age",
                                    placeholder: "Enter your age",
                                    errors: { required: "Age is required" },
                                },
                                nl: {
                                    label: "Leeftijd",
                                    placeholder: "Voer je leeftijd in",
                                    errors: { required: "Leeftijd is verplicht" },
                                },
                            },
                        },
                        {
                            type: "radio",
                            name: "gender",
                            label: "Gender",
                            inline: true,
                            options: [
                                { label: "Male", value: "male" },
                                { label: "Female", value: "female" },
                                { label: "Non-binary", value: "nonbinary" },
                                { label: "Prefer not to say", value: "undisclosed" },
                            ],
                            translations: {
                                en: {
                                    label: "Gender",
                                    options: {
                                        male: "Male",
                                        female: "Female",
                                        nonbinary: "Non-binary",
                                        undisclosed: "Prefer not to say",
                                    },
                                },
                                nl: {
                                    label: "Geslacht",
                                    options: {
                                        male: "Man",
                                        female: "Vrouw",
                                        nonbinary: "Non-binair",
                                        undisclosed: "Zeg ik liever niet",
                                    },
                                },
                            },
                        },
                        {
                            type: "select",
                            name: "country",
                            label: "Country",
                            required: true,
                            rules: ["required"],
                            searchable: true,
                            clearable: true,
                            options: [
                                { label: "United States", value: "us" },
                                { label: "United Kingdom", value: "gb" },
                                { label: "Netherlands", value: "nl" },
                                { label: "Germany", value: "de" },
                                { label: "France", value: "fr" },
                                { label: "Other", value: "other" },
                            ],
                            translations: {
                                en: {
                                    label: "Country",
                                    placeholder: "Select your country",
                                    options: {
                                        us: "United States",
                                        gb: "United Kingdom",
                                        nl: "Netherlands",
                                        de: "Germany",
                                        fr: "France",
                                        other: "Other",
                                    },
                                    errors: { required: "Please select a country" },
                                },
                                nl: {
                                    label: "Land",
                                    placeholder: "Selecteer je land",
                                    options: {
                                        us: "Verenigde Staten",
                                        gb: "Verenigd Koninkrijk",
                                        nl: "Nederland",
                                        de: "Duitsland",
                                        fr: "Frankrijk",
                                        other: "Anders",
                                    },
                                    errors: { required: "Selecteer een land" },
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Experience",
                    description: "Rate your experience",
                    icon: "star",
                    children: [
                        {
                            type: "slider",
                            name: "satisfaction",
                            label: "Overall satisfaction",
                            min: 1,
                            max: 10,
                            step: 1,
                            defaultValue: 5,
                            showTooltip: true,
                            marks: { 1: "1", 5: "5", 10: "10" },
                            helpText:
                                "Rate your overall satisfaction from 1 (very poor) to 10 (excellent)",
                            translations: {
                                en: {
                                    label: "Overall satisfaction",
                                    helpText:
                                        "Rate your overall satisfaction from 1 (very poor) to 10 (excellent)",
                                },
                                nl: {
                                    label: "Algehele tevredenheid",
                                    helpText:
                                        "Beoordeel je algehele tevredenheid van 1 (zeer slecht) tot 10 (uitstekend)",
                                },
                            },
                        },
                        {
                            type: "checkbox-group",
                            name: "features",
                            label: "Which features matter most to you?",
                            required: true,
                            rules: ["required"],
                            minSelections: 1,
                            options: [
                                { label: "Performance", value: "performance" },
                                { label: "User Interface", value: "ui" },
                                { label: "Customer Support", value: "support" },
                                { label: "Documentation", value: "docs" },
                                { label: "Pricing", value: "pricing" },
                            ],
                            translations: {
                                en: {
                                    label: "Which features matter most to you?",
                                    options: {
                                        performance: "Performance",
                                        ui: "User Interface",
                                        support: "Customer Support",
                                        docs: "Documentation",
                                        pricing: "Pricing",
                                    },
                                    errors: {
                                        required: "Select at least one feature",
                                    },
                                },
                                nl: {
                                    label: "Welke functies zijn het belangrijkst voor je?",
                                    options: {
                                        performance: "Prestaties",
                                        ui: "Gebruikersinterface",
                                        support: "Klantenservice",
                                        docs: "Documentatie",
                                        pricing: "Prijzen",
                                    },
                                    errors: {
                                        required: "Selecteer minstens een functie",
                                    },
                                },
                            },
                        },
                        { type: "divider" },
                        {
                            type: "radio",
                            name: "recommendation",
                            label: "Would you recommend us?",
                            required: true,
                            rules: ["required"],
                            inline: true,
                            options: [
                                { label: "Yes", value: "yes" },
                                { label: "No", value: "no" },
                                { label: "Maybe", value: "maybe" },
                            ],
                            translations: {
                                en: {
                                    label: "Would you recommend us?",
                                    options: {
                                        yes: "Yes",
                                        no: "No",
                                        maybe: "Maybe",
                                    },
                                    errors: { required: "Please make a selection" },
                                },
                                nl: {
                                    label: "Zou je ons aanbevelen?",
                                    options: {
                                        yes: "Ja",
                                        no: "Nee",
                                        maybe: "Misschien",
                                    },
                                    errors: { required: "Maak een keuze" },
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Feedback",
                    description: "Help us improve",
                    icon: "message-square",
                    children: [
                        {
                            type: "tags",
                            name: "improvementAreas",
                            label: "Areas for improvement",
                            maxTags: 8,
                            allowCustom: true,
                            suggestions: [
                                "Speed",
                                "Reliability",
                                "Design",
                                "Onboarding",
                                "Pricing",
                                "Mobile",
                                "API",
                                "Integrations",
                            ],
                            helpText: "Tag the areas you think need the most improvement",
                            condition: {
                                or: [
                                    {
                                        field: "recommendation",
                                        operator: "eq",
                                        value: "no",
                                    },
                                    {
                                        field: "recommendation",
                                        operator: "eq",
                                        value: "maybe",
                                    },
                                ],
                            },
                            translations: {
                                en: {
                                    label: "Areas for improvement",
                                    placeholder: "Type an area and press Enter",
                                    helpText: "Tag the areas you think need the most improvement",
                                },
                                nl: {
                                    label: "Verbeterpunten",
                                    placeholder: "Typ een verbeterpunt en druk op Enter",
                                    helpText:
                                        "Tag de gebieden die volgens jou het meest verbeterd moeten worden",
                                },
                            },
                        },
                        {
                            type: "textarea",
                            name: "comments",
                            label: "Additional comments",
                            placeholder: "Share any additional thoughts...",
                            rows: 4,
                            maxLength: 1000,
                            translations: {
                                en: {
                                    label: "Additional comments",
                                    placeholder: "Share any additional thoughts...",
                                },
                                nl: {
                                    label: "Aanvullende opmerkingen",
                                    placeholder: "Deel eventuele aanvullende gedachten...",
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Contact",
                    description: "Optional follow-up",
                    icon: "mail",
                    children: [
                        {
                            type: "switch",
                            name: "contactMe",
                            label: "I would like to be contacted",
                            defaultValue: false,
                            checkedLabel: "Yes",
                            uncheckedLabel: "No",
                            translations: {
                                en: {
                                    label: "I would like to be contacted",
                                },
                                nl: {
                                    label: "Ik wil graag gecontacteerd worden",
                                },
                            },
                        },
                        {
                            type: "text",
                            name: "contactEmail",
                            label: "Contact email",
                            placeholder: "you@example.com",
                            inputType: "email",
                            required: true,
                            rules: ["required", "email"],
                            autocomplete: "email",
                            condition: {
                                field: "contactMe",
                                operator: "eq",
                                value: true,
                            },
                            translations: {
                                en: {
                                    label: "Contact email",
                                    placeholder: "you@example.com",
                                    errors: {
                                        required: "Email is required",
                                        email: "Enter a valid email",
                                    },
                                },
                                nl: {
                                    label: "Contact e-mail",
                                    placeholder: "jij@voorbeeld.nl",
                                    errors: {
                                        required: "E-mail is verplicht",
                                        email: "Voer een geldig e-mailadres in",
                                    },
                                },
                            },
                        },
                        {
                            type: "select",
                            name: "preferredTime",
                            label: "Preferred contact time",
                            clearable: true,
                            options: [
                                {
                                    label: "Morning (9:00 - 12:00)",
                                    value: "morning",
                                },
                                {
                                    label: "Afternoon (12:00 - 17:00)",
                                    value: "afternoon",
                                },
                                {
                                    label: "Evening (17:00 - 20:00)",
                                    value: "evening",
                                },
                            ],
                            condition: {
                                field: "contactMe",
                                operator: "eq",
                                value: true,
                            },
                            translations: {
                                en: {
                                    label: "Preferred contact time",
                                    placeholder: "Select a time slot",
                                    options: {
                                        morning: "Morning (9:00 - 12:00)",
                                        afternoon: "Afternoon (12:00 - 17:00)",
                                        evening: "Evening (17:00 - 20:00)",
                                    },
                                },
                                nl: {
                                    label: "Gewenst contactmoment",
                                    placeholder: "Selecteer een tijdslot",
                                    options: {
                                        morning: "Ochtend (9:00 - 12:00)",
                                        afternoon: "Middag (12:00 - 17:00)",
                                        evening: "Avond (17:00 - 20:00)",
                                    },
                                },
                            },
                        },
                    ],
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
            submit: "Submit Survey",
            next: "Continue",
            previous: "Back",
            reset: "Start Over",
        },
        nl: {
            submit: "Enquete versturen",
            next: "Verder",
            previous: "Terug",
            reset: "Opnieuw beginnen",
        },
    },
};
