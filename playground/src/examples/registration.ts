// ---------------------------------------------------------------------------
// FormCraft – Example: User Registration (multi-step)
// ---------------------------------------------------------------------------

import type { FormSchema } from "@formcraft/vue";

export const registrationSchema: FormSchema = {
    id: "registration",
    version: "1.0.0",
    fields: [
        {
            type: "steps",
            linear: true,
            steps: [
                {
                    title: "Personal Info",
                    description: "Basic account details",
                    icon: "user",
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "text",
                                    name: "firstName",
                                    label: "First name",
                                    placeholder: "Enter your first name",
                                    required: true,
                                    rules: ["required", "minLength:2"],
                                    autocomplete: "given-name",
                                    span: 6,
                                    translations: {
                                        en: {
                                            label: "First name",
                                            placeholder: "Enter your first name",
                                            errors: {
                                                required: "First name is required",
                                                minLength: "At least 2 characters",
                                            },
                                        },
                                        nl: {
                                            label: "Voornaam",
                                            placeholder: "Voer je voornaam in",
                                            errors: {
                                                required: "Voornaam is verplicht",
                                                minLength: "Minimaal 2 tekens",
                                            },
                                        },
                                    },
                                },
                                {
                                    type: "text",
                                    name: "lastName",
                                    label: "Last name",
                                    placeholder: "Enter your last name",
                                    required: true,
                                    rules: ["required", "minLength:2"],
                                    autocomplete: "family-name",
                                    span: 6,
                                    translations: {
                                        en: {
                                            label: "Last name",
                                            placeholder: "Enter your last name",
                                            errors: {
                                                required: "Last name is required",
                                                minLength: "At least 2 characters",
                                            },
                                        },
                                        nl: {
                                            label: "Achternaam",
                                            placeholder: "Voer je achternaam in",
                                            errors: {
                                                required: "Achternaam is verplicht",
                                                minLength: "Minimaal 2 tekens",
                                            },
                                        },
                                    },
                                },
                            ],
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
                        {
                            type: "radio",
                            name: "accountType",
                            label: "Account type",
                            required: true,
                            rules: ["required"],
                            inline: true,
                            options: [
                                { label: "Personal", value: "personal" },
                                { label: "Business", value: "business" },
                            ],
                            defaultValue: "personal",
                            translations: {
                                en: {
                                    label: "Account type",
                                    options: {
                                        personal: "Personal",
                                        business: "Business",
                                    },
                                    errors: { required: "Please select an account type" },
                                },
                                nl: {
                                    label: "Accounttype",
                                    options: {
                                        personal: "Persoonlijk",
                                        business: "Zakelijk",
                                    },
                                    errors: { required: "Selecteer een accounttype" },
                                },
                            },
                        },
                        {
                            type: "text",
                            name: "companyName",
                            label: "Company name",
                            placeholder: "Your company name",
                            required: true,
                            rules: ["required"],
                            condition: {
                                field: "accountType",
                                operator: "eq",
                                value: "business",
                            },
                            translations: {
                                en: {
                                    label: "Company name",
                                    placeholder: "Your company name",
                                    errors: { required: "Company name is required" },
                                },
                                nl: {
                                    label: "Bedrijfsnaam",
                                    placeholder: "Naam van je bedrijf",
                                    errors: { required: "Bedrijfsnaam is verplicht" },
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Profile",
                    description: "Tell us about yourself",
                    icon: "edit",
                    children: [
                        {
                            type: "textarea",
                            name: "bio",
                            label: "Bio",
                            placeholder: "Tell us a bit about yourself...",
                            rows: 4,
                            maxLength: 500,
                            helpText: "Maximum 500 characters",
                            translations: {
                                en: {
                                    label: "Bio",
                                    placeholder: "Tell us a bit about yourself...",
                                    helpText: "Maximum 500 characters",
                                },
                                nl: {
                                    label: "Biografie",
                                    placeholder: "Vertel iets over jezelf...",
                                    helpText: "Maximaal 500 tekens",
                                },
                            },
                        },
                        {
                            type: "tags",
                            name: "skills",
                            label: "Skills",
                            maxTags: 10,
                            allowCustom: true,
                            suggestions: [
                                "JavaScript",
                                "TypeScript",
                                "Vue",
                                "React",
                                "Node.js",
                                "Python",
                                "Go",
                                "Rust",
                                "SQL",
                                "GraphQL",
                            ],
                            helpText: "Add up to 10 skills",
                            translations: {
                                en: {
                                    label: "Skills",
                                    placeholder: "Type a skill and press Enter",
                                    helpText: "Add up to 10 skills",
                                },
                                nl: {
                                    label: "Vaardigheden",
                                    placeholder: "Typ een vaardigheid en druk op Enter",
                                    helpText: "Voeg maximaal 10 vaardigheden toe",
                                },
                            },
                        },
                        {
                            type: "slider",
                            name: "experience",
                            label: "Years of experience",
                            min: 0,
                            max: 30,
                            step: 1,
                            defaultValue: 3,
                            showTooltip: true,
                            marks: {
                                0: "0",
                                5: "5",
                                10: "10",
                                15: "15",
                                20: "20",
                                25: "25",
                                30: "30",
                            },
                            translations: {
                                en: {
                                    label: "Years of experience",
                                    helpText: "Drag the slider to indicate your experience",
                                },
                                nl: {
                                    label: "Jaren ervaring",
                                    helpText: "Verschuif de slider om je ervaring aan te geven",
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Finish",
                    description: "Review and confirm",
                    icon: "check",
                    children: [
                        {
                            type: "switch",
                            name: "newsletter",
                            label: "Subscribe to newsletter",
                            defaultValue: true,
                            checkedLabel: "Yes",
                            uncheckedLabel: "No",
                            translations: {
                                en: {
                                    label: "Subscribe to newsletter",
                                },
                                nl: {
                                    label: "Abonneren op nieuwsbrief",
                                },
                            },
                        },
                        { type: "divider" },
                        {
                            type: "checkbox",
                            name: "agreeTerms",
                            label: "I agree to the terms and conditions",
                            required: true,
                            rules: ["required"],
                            checkedValue: true,
                            uncheckedValue: false,
                            translations: {
                                en: {
                                    label: "I agree to the terms and conditions",
                                    errors: {
                                        required: "You must agree to the terms",
                                    },
                                },
                                nl: {
                                    label: "Ik ga akkoord met de algemene voorwaarden",
                                    errors: {
                                        required: "Je moet akkoord gaan met de voorwaarden",
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
            submit: "Create Account",
            reset: "Reset",
            cancel: "Cancel",
            next: "Next",
            previous: "Back",
        },
        nl: {
            submit: "Account aanmaken",
            reset: "Opnieuw instellen",
            cancel: "Annuleren",
            next: "Volgende",
            previous: "Vorige",
        },
    },
};
