// ---------------------------------------------------------------------------
// Formatica – Example: Settings Panel (tabs layout)
// ---------------------------------------------------------------------------

import type { FormSchema } from "@formatica/vue";

export const settingsSchema: FormSchema = {
    id: "settings-panel",
    version: "1.0.0",
    fields: [
        {
            type: "tabs",
            tabs: [
                {
                    title: "Profile",
                    icon: "user",
                    children: [
                        {
                            type: "text",
                            name: "displayName",
                            label: "Display name",
                            placeholder: "How others see you",
                            required: true,
                            rules: ["required", "minLength:2", "maxLength:50"],
                            autocomplete: "nickname",
                            translations: {
                                en: {
                                    label: "Display name",
                                    placeholder: "How others see you",
                                    errors: {
                                        required: "Display name is required",
                                        minLength: "At least 2 characters",
                                        maxLength: "At most 50 characters",
                                    },
                                },
                                nl: {
                                    label: "Weergavenaam",
                                    placeholder: "Hoe anderen je zien",
                                    errors: {
                                        required: "Weergavenaam is verplicht",
                                        minLength: "Minimaal 2 tekens",
                                        maxLength: "Maximaal 50 tekens",
                                    },
                                },
                            },
                        },
                        {
                            type: "textarea",
                            name: "bio",
                            label: "Bio",
                            placeholder: "Write a short bio...",
                            rows: 3,
                            maxLength: 300,
                            helpText:
                                "A brief description shown on your profile (max 300 characters)",
                            translations: {
                                en: {
                                    label: "Bio",
                                    placeholder: "Write a short bio...",
                                    helpText:
                                        "A brief description shown on your profile (max 300 characters)",
                                },
                                nl: {
                                    label: "Biografie",
                                    placeholder: "Schrijf een korte bio...",
                                    helpText:
                                        "Een korte beschrijving op je profiel (max 300 tekens)",
                                },
                            },
                        },
                        { type: "divider" },
                        {
                            type: "file",
                            name: "avatar",
                            label: "Avatar",
                            accept: ".png,.jpg,.jpeg,.webp",
                            maxSize: 2097152, // 2 MB
                            multiple: false,
                            dragDrop: true,
                            helpText: "Upload an image (PNG, JPG or WebP, max 2 MB)",
                            translations: {
                                en: {
                                    label: "Avatar",
                                    helpText: "Upload an image (PNG, JPG or WebP, max 2 MB)",
                                },
                                nl: {
                                    label: "Avatar",
                                    helpText: "Upload een afbeelding (PNG, JPG of WebP, max 2 MB)",
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Notifications",
                    icon: "bell",
                    children: [
                        {
                            type: "row",
                            children: [
                                {
                                    type: "switch",
                                    name: "emailNotifs",
                                    label: "Email notifications",
                                    defaultValue: true,
                                    checkedLabel: "On",
                                    uncheckedLabel: "Off",
                                    helpText: "Receive important updates via email",
                                    span: 6,
                                    translations: {
                                        en: {
                                            label: "Email notifications",
                                            helpText: "Receive important updates via email",
                                        },
                                        nl: {
                                            label: "E-mailmeldingen",
                                            helpText: "Ontvang belangrijke updates via e-mail",
                                        },
                                    },
                                },
                                {
                                    type: "switch",
                                    name: "pushNotifs",
                                    label: "Push notifications",
                                    defaultValue: false,
                                    checkedLabel: "On",
                                    uncheckedLabel: "Off",
                                    helpText: "Receive push notifications in your browser",
                                    span: 6,
                                    translations: {
                                        en: {
                                            label: "Push notifications",
                                            helpText: "Receive push notifications in your browser",
                                        },
                                        nl: {
                                            label: "Pushmeldingen",
                                            helpText: "Ontvang pushmeldingen in je browser",
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            type: "select",
                            name: "notifFrequency",
                            label: "Notification frequency",
                            clearable: false,
                            defaultValue: "daily",
                            options: [
                                { label: "Instant", value: "instant" },
                                { label: "Daily digest", value: "daily" },
                                { label: "Weekly digest", value: "weekly" },
                            ],
                            translations: {
                                en: {
                                    label: "Notification frequency",
                                    options: {
                                        instant: "Instant",
                                        daily: "Daily digest",
                                        weekly: "Weekly digest",
                                    },
                                },
                                nl: {
                                    label: "Meldingsfrequentie",
                                    options: {
                                        instant: "Direct",
                                        daily: "Dagelijks overzicht",
                                        weekly: "Wekelijks overzicht",
                                    },
                                },
                            },
                        },
                        { type: "divider" },
                        {
                            type: "checkbox",
                            name: "marketingEmails",
                            label: "Receive marketing emails and product updates",
                            defaultValue: false,
                            checkedValue: true,
                            uncheckedValue: false,
                            translations: {
                                en: {
                                    label: "Receive marketing emails and product updates",
                                },
                                nl: {
                                    label: "Ontvang marketing e-mails en productupdates",
                                },
                            },
                        },
                    ],
                },
                {
                    title: "Privacy",
                    icon: "shield",
                    children: [
                        {
                            type: "radio",
                            name: "profileVisibility",
                            label: "Profile visibility",
                            required: true,
                            defaultValue: "public",
                            options: [
                                { label: "Public", value: "public" },
                                { label: "Friends only", value: "friends" },
                                { label: "Private", value: "private" },
                            ],
                            translations: {
                                en: {
                                    label: "Profile visibility",
                                    options: {
                                        public: "Public",
                                        friends: "Friends only",
                                        private: "Private",
                                    },
                                },
                                nl: {
                                    label: "Profielzichtbaarheid",
                                    options: {
                                        public: "Openbaar",
                                        friends: "Alleen vrienden",
                                        private: "Prive",
                                    },
                                },
                            },
                        },
                        { type: "divider" },
                        {
                            type: "row",
                            children: [
                                {
                                    type: "switch",
                                    name: "showEmail",
                                    label: "Show email on profile",
                                    defaultValue: false,
                                    checkedLabel: "Visible",
                                    uncheckedLabel: "Hidden",
                                    span: 6,
                                    translations: {
                                        en: {
                                            label: "Show email on profile",
                                        },
                                        nl: {
                                            label: "E-mail tonen op profiel",
                                        },
                                    },
                                },
                                {
                                    type: "switch",
                                    name: "showActivity",
                                    label: "Show activity status",
                                    defaultValue: true,
                                    checkedLabel: "Visible",
                                    uncheckedLabel: "Hidden",
                                    helpText: "Let others see when you were last active",
                                    span: 6,
                                    translations: {
                                        en: {
                                            label: "Show activity status",
                                            helpText: "Let others see when you were last active",
                                        },
                                        nl: {
                                            label: "Activiteitsstatus tonen",
                                            helpText:
                                                "Laat anderen zien wanneer je voor het laatst actief was",
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    title: "Appearance",
                    icon: "palette",
                    children: [
                        {
                            type: "radio",
                            name: "theme",
                            label: "Theme",
                            inline: true,
                            defaultValue: "system",
                            options: [
                                { label: "Light", value: "light", icon: "sun" },
                                { label: "Dark", value: "dark", icon: "moon" },
                                {
                                    label: "System",
                                    value: "system",
                                    icon: "monitor",
                                },
                            ],
                            translations: {
                                en: {
                                    label: "Theme",
                                    options: {
                                        light: "Light",
                                        dark: "Dark",
                                        system: "System",
                                    },
                                },
                                nl: {
                                    label: "Thema",
                                    options: {
                                        light: "Licht",
                                        dark: "Donker",
                                        system: "Systeem",
                                    },
                                },
                            },
                        },
                        {
                            type: "row",
                            children: [
                                {
                                    type: "select",
                                    name: "language",
                                    label: "Language",
                                    clearable: false,
                                    defaultValue: "en",
                                    span: 6,
                                    options: [
                                        { label: "English", value: "en" },
                                        { label: "Nederlands", value: "nl" },
                                        { label: "Deutsch", value: "de" },
                                        { label: "Francais", value: "fr" },
                                    ],
                                    translations: {
                                        en: {
                                            label: "Language",
                                            options: {
                                                en: "English",
                                                nl: "Nederlands",
                                                de: "Deutsch",
                                                fr: "Francais",
                                            },
                                        },
                                        nl: {
                                            label: "Taal",
                                            options: {
                                                en: "English",
                                                nl: "Nederlands",
                                                de: "Deutsch",
                                                fr: "Francais",
                                            },
                                        },
                                    },
                                },
                                {
                                    type: "slider",
                                    name: "fontSize",
                                    label: "Font size",
                                    min: 12,
                                    max: 24,
                                    step: 1,
                                    defaultValue: 16,
                                    showTooltip: true,
                                    span: 6,
                                    marks: {
                                        12: "12",
                                        16: "16",
                                        20: "20",
                                        24: "24",
                                    },
                                    helpText: "Adjust the base font size for the interface",
                                    translations: {
                                        en: {
                                            label: "Font size",
                                            helpText: "Adjust the base font size for the interface",
                                        },
                                        nl: {
                                            label: "Lettergrootte",
                                            helpText:
                                                "Pas de basislettergrootte van de interface aan",
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
    settings: {
        layout: "vertical",
        size: "medium",
        validateOnChange: true,
    },
    translations: {
        en: {
            submit: "Save Settings",
            reset: "Reset to Defaults",
        },
        nl: {
            submit: "Instellingen opslaan",
            reset: "Standaardwaarden herstellen",
        },
    },
};
