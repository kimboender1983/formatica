// ---------------------------------------------------------------------------
// FormCraft – Example: Job Application Form (rows, groups, validation)
// ---------------------------------------------------------------------------

import type { FormSchema } from "@formcraft/vue";

export const jobApplicationSchema: FormSchema = {
    id: "job-application",
    version: "1.0.0",
    fields: [
        {
            type: "group",
            title: "Personal Information",
            children: [
                {
                    type: "row",
                    children: [
                        {
                            type: "text",
                            name: "firstName",
                            label: "First name",
                            span: 6,
                            rules: ["required", "minLength:2"],
                            translations: {
                                en: {
                                    label: "First name",
                                    errors: {
                                        required: "First name is required",
                                        minLength: "At least 2 characters",
                                    },
                                },
                                nl: {
                                    label: "Voornaam",
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
                            span: 6,
                            rules: ["required", "minLength:2"],
                            translations: {
                                en: {
                                    label: "Last name",
                                    errors: {
                                        required: "Last name is required",
                                        minLength: "At least 2 characters",
                                    },
                                },
                                nl: {
                                    label: "Achternaam",
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
                    type: "row",
                    children: [
                        {
                            type: "text",
                            name: "email",
                            label: "Email",
                            inputType: "email",
                            span: 6,
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
                            label: "Phone",
                            span: 6,
                            rules: ["phone"],
                            defaultCountry: "NL",
                            translations: {
                                en: { label: "Phone" },
                                nl: { label: "Telefoon" },
                            },
                        },
                    ],
                },
                {
                    type: "row",
                    children: [
                        {
                            type: "date",
                            name: "birthDate",
                            label: "Date of birth",
                            span: 6,
                            rules: ["required"],
                            translations: {
                                en: {
                                    label: "Date of birth",
                                    errors: { required: "Date of birth is required" },
                                },
                                nl: {
                                    label: "Geboortedatum",
                                    errors: { required: "Geboortedatum is verplicht" },
                                },
                            },
                        },
                        {
                            type: "select",
                            name: "nationality",
                            label: "Nationality",
                            span: 6,
                            rules: ["required"],
                            options: [
                                { label: "Dutch", value: "NL" },
                                { label: "German", value: "DE" },
                                { label: "Belgian", value: "BE" },
                                { label: "French", value: "FR" },
                                { label: "British", value: "GB" },
                                { label: "American", value: "US" },
                                { label: "Canadian", value: "CA" },
                                { label: "Australian", value: "AU" },
                            ],
                            translations: {
                                en: {
                                    label: "Nationality",
                                    errors: { required: "Nationality is required" },
                                },
                                nl: {
                                    label: "Nationaliteit",
                                    errors: { required: "Nationaliteit is verplicht" },
                                },
                            },
                        },
                    ],
                },
            ],
        },
        { type: "divider" },
        {
            type: "group",
            title: "Professional Background",
            children: [
                {
                    type: "text",
                    name: "currentRole",
                    label: "Current job title",
                    rules: ["required"],
                    translations: {
                        en: {
                            label: "Current job title",
                            errors: { required: "Job title is required" },
                        },
                        nl: {
                            label: "Huidige functie",
                            errors: { required: "Functie is verplicht" },
                        },
                    },
                },
                {
                    type: "text",
                    name: "company",
                    label: "Current company",
                    translations: {
                        en: { label: "Current company" },
                        nl: { label: "Huidig bedrijf" },
                    },
                },
                {
                    type: "row",
                    children: [
                        {
                            type: "slider",
                            name: "experience",
                            label: "Years of experience",
                            span: 6,
                            min: 0,
                            max: 40,
                            step: 1,
                            showTooltip: true,
                            translations: {
                                en: { label: "Years of experience" },
                                nl: { label: "Jaren ervaring" },
                            },
                        },
                        {
                            type: "select",
                            name: "level",
                            label: "Seniority level",
                            span: 6,
                            options: [
                                { label: "Junior", value: "junior" },
                                { label: "Mid", value: "mid" },
                                { label: "Senior", value: "senior" },
                                { label: "Lead", value: "lead" },
                                { label: "Director", value: "director" },
                            ],
                            translations: {
                                en: { label: "Seniority level" },
                                nl: { label: "Senioriteitsniveau" },
                            },
                        },
                    ],
                },
                {
                    type: "tags",
                    name: "skills",
                    label: "Key skills",
                    placeholder: "Add a skill...",
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
                        "Docker",
                    ],
                    translations: {
                        en: {
                            label: "Key skills",
                            placeholder: "Add a skill...",
                        },
                        nl: {
                            label: "Vaardigheden",
                            placeholder: "Voeg een vaardigheid toe...",
                        },
                    },
                },
            ],
        },
        { type: "divider" },
        {
            type: "group",
            title: "Application Details",
            children: [
                {
                    type: "select",
                    name: "position",
                    label: "Position applied for",
                    rules: ["required"],
                    options: [
                        { label: "Frontend Developer", value: "frontend" },
                        { label: "Backend Developer", value: "backend" },
                        { label: "Full-Stack Developer", value: "fullstack" },
                        { label: "DevOps Engineer", value: "devops" },
                        { label: "Product Designer", value: "designer" },
                    ],
                    translations: {
                        en: {
                            label: "Position applied for",
                            errors: { required: "Please select a position" },
                        },
                        nl: {
                            label: "Positie waarvoor u solliciteert",
                            errors: { required: "Selecteer een positie" },
                        },
                    },
                },
                {
                    type: "row",
                    children: [
                        {
                            type: "select",
                            name: "startDate",
                            label: "Available from",
                            span: 6,
                            options: [
                                { label: "Immediately", value: "immediately" },
                                { label: "1 month", value: "1month" },
                                { label: "2 months", value: "2months" },
                                { label: "3+ months", value: "3months" },
                            ],
                            translations: {
                                en: { label: "Available from" },
                                nl: { label: "Beschikbaar vanaf" },
                            },
                        },
                        {
                            type: "select",
                            name: "salary",
                            label: "Salary expectation",
                            span: 6,
                            options: [
                                { label: "40-50k", value: "40-50k" },
                                { label: "50-70k", value: "50-70k" },
                                { label: "70-90k", value: "70-90k" },
                                { label: "90-120k", value: "90-120k" },
                                { label: "120k+", value: "120k+" },
                            ],
                            translations: {
                                en: { label: "Salary expectation" },
                                nl: { label: "Salarisverwachting" },
                            },
                        },
                    ],
                },
                {
                    type: "textarea",
                    name: "motivation",
                    label: "Cover letter / motivation",
                    rows: 5,
                    rules: ["required", "minLength:50"],
                    helpText: "Tell us why you're a good fit (min. 50 characters)",
                    translations: {
                        en: {
                            label: "Cover letter / motivation",
                            helpText: "Tell us why you're a good fit (min. 50 characters)",
                            errors: {
                                required: "Motivation is required",
                                minLength: "At least 50 characters",
                            },
                        },
                        nl: {
                            label: "Motivatiebrief",
                            helpText: "Vertel ons waarom u geschikt bent (min. 50 tekens)",
                            errors: {
                                required: "Motivatie is verplicht",
                                minLength: "Minimaal 50 tekens",
                            },
                        },
                    },
                },
                {
                    type: "file",
                    name: "resume",
                    label: "Resume / CV",
                    accept: ".pdf,.doc,.docx",
                    maxSize: 5242880,
                    helpText: "PDF, DOC or DOCX, max 5 MB",
                    translations: {
                        en: {
                            label: "Resume / CV",
                            helpText: "PDF, DOC or DOCX, max 5 MB",
                        },
                        nl: {
                            label: "CV",
                            helpText: "PDF, DOC of DOCX, max 5 MB",
                        },
                    },
                },
            ],
        },
        { type: "divider" },
        {
            type: "row",
            children: [
                {
                    type: "checkbox",
                    name: "privacy",
                    label: "I agree to the privacy policy",
                    rules: ["required"],
                    span: 12,
                    translations: {
                        en: {
                            label: "I agree to the privacy policy",
                            errors: { required: "You must accept the privacy policy" },
                        },
                        nl: {
                            label: "Ik ga akkoord met het privacybeleid",
                            errors: {
                                required: "U moet het privacybeleid accepteren",
                            },
                        },
                    },
                },
            ],
        },
        {
            type: "switch",
            name: "newsletter",
            label: "Subscribe to job alerts",
            translations: {
                en: { label: "Subscribe to job alerts" },
                nl: { label: "Abonneer op vacature-meldingen" },
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
            submit: "Submit Application",
            reset: "Clear Form",
        },
        nl: {
            submit: "Sollicitatie indienen",
            reset: "Formulier wissen",
        },
    },
};
