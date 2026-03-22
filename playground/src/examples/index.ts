// ---------------------------------------------------------------------------
// Formatica – Playground example schemas barrel export
// ---------------------------------------------------------------------------

import type { FormSchema } from "@formatica/vue";
import { contactSchema } from "./contactForm";
import { eventRegistrationSchema } from "./eventRegistration";
import { jobApplicationSchema } from "./jobApplication";
import { registrationSchema } from "./registration";
import { settingsSchema } from "./settingsPanel";
import { surveySchema } from "./surveyWizard";

export interface ExampleEntry {
    id: string;
    title: string;
    description: string;
    tags: string[];
    schema: FormSchema;
}

export const examples: ExampleEntry[] = [
    {
        id: "registration",
        title: "User Registration",
        description:
            "Multi-step registration wizard with personal info, profile details, and confirmation. Features conditional fields, i18n translations, and a variety of field types.",
        tags: ["Multi-step", "i18n", "Conditional"],
        schema: registrationSchema,
    },
    {
        id: "contact",
        title: "Contact Form",
        description:
            "Classic single-page contact form with grouped sections, file attachments, and field validation. A great starting point for simple forms.",
        tags: ["Simple", "Groups", "File upload"],
        schema: contactSchema,
    },
    {
        id: "survey",
        title: "Survey Wizard",
        description:
            "Multi-step survey with branching logic. Follow-up questions appear based on previous answers, and an optional contact step adapts to user preference.",
        tags: ["Multi-step", "Branching", "Conditional"],
        schema: surveySchema,
    },
    {
        id: "settings",
        title: "Settings Panel",
        description:
            "Tabbed settings interface covering profile, notifications, privacy, and appearance. Demonstrates switches, selects, sliders, and tab-based layout.",
        tags: ["Tabs", "Switches", "Nested groups"],
        schema: settingsSchema,
    },
    {
        id: "job-application",
        title: "Job Application",
        description:
            "Structured job application form with grouped sections for personal info, professional background, and application details. Features rows, validation, phone input, and file upload.",
        tags: ["Rows", "Groups", "Validation", "Phone"],
        schema: jobApplicationSchema,
    },
    {
        id: "event-registration",
        title: "Event Registration",
        description:
            "Event registration form with attendee details, ticket selection, session checkboxes, and additional options like hotel accommodation and airport transfer.",
        tags: ["Rows", "Groups", "Conditional", "Checkbox groups"],
        schema: eventRegistrationSchema,
    },
];

export { contactSchema } from "./contactForm";
export { eventRegistrationSchema } from "./eventRegistration";
export { jobApplicationSchema } from "./jobApplication";
// Re-export individual schemas for direct imports
export { registrationSchema } from "./registration";
export { settingsSchema } from "./settingsPanel";
export { surveySchema } from "./surveyWizard";
