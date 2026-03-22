import type { FormSchema } from "@formatica/core";
import { FormBuilder } from "@formatica/react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Full schema with multiple field types
// ---------------------------------------------------------------------------

const fullSchema: FormSchema = {
    fields: [
        {
            type: "text",
            name: "fullName",
            label: "Full Name",
            required: true,
            placeholder: "Enter your name",
        },
        {
            type: "text",
            name: "email",
            label: "Email",
            inputType: "email",
            required: true,
            rules: "required|email",
        },
        {
            type: "select",
            name: "country",
            label: "Country",
            required: true,
            placeholder: "Select a country",
            options: [
                { label: "Netherlands", value: "NL" },
                { label: "United States", value: "US" },
                { label: "Germany", value: "DE" },
            ],
        },
        {
            type: "checkbox",
            name: "newsletter",
            label: "Subscribe to newsletter",
        },
        {
            type: "radio",
            name: "plan",
            label: "Plan",
            required: true,
            options: [
                { label: "Free", value: "free" },
                { label: "Pro", value: "pro" },
                { label: "Enterprise", value: "enterprise" },
            ],
        },
        {
            type: "slider",
            name: "budget",
            label: "Budget",
            min: 0,
            max: 1000,
            step: 50,
        },
    ],
};

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------

describe("Integration: end-to-end form flow", () => {
    it("renders all field types from schema", () => {
        render(<FormBuilder schema={fullSchema} />);

        expect(screen.getByText("Full Name")).toBeDefined();
        expect(screen.getByText("Email")).toBeDefined();
        expect(screen.getByText("Country")).toBeDefined();
        expect(screen.getByText("Subscribe to newsletter")).toBeDefined();
        expect(screen.getByText("Plan")).toBeDefined();
        expect(screen.getByText("Budget")).toBeDefined();

        // Check input types exist
        expect(document.querySelector("input[type='text']")).not.toBeNull();
        expect(document.querySelector("input[type='email']")).not.toBeNull();
        // Custom select dropdown (combobox role)
        expect(document.querySelector("[role='combobox']")).not.toBeNull();
        // Checkbox (sr-only input + custom div with role=checkbox)
        expect(document.querySelector("[role='checkbox']")).not.toBeNull();
        // Radio (sr-only input + custom div with role=radio)
        expect(document.querySelector("[role='radio']")).not.toBeNull();
        expect(document.querySelector("input[type='range']")).not.toBeNull();
    });

    it("fills in fields, submits, and verifies onSubmit receives correct values", async () => {
        const handleSubmit = vi.fn();
        render(<FormBuilder schema={fullSchema} onSubmit={handleSubmit} />);

        // Fill text field
        const textInput = document.querySelector("input[type='text']") as HTMLInputElement;
        fireEvent.change(textInput, { target: { value: "Jan de Vries" } });

        // Fill email field
        const emailInput = document.querySelector("input[type='email']") as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: "jan@example.com" } });

        // Fill select: click the combobox trigger to open, then click an option
        const combobox = document.querySelector("[role='combobox']") as HTMLElement;
        fireEvent.click(combobox);
        // Wait for dropdown to appear, then click the "Netherlands" option
        await waitFor(() => {
            expect(document.querySelector("[role='listbox']")).not.toBeNull();
        });
        const nlOption = screen.getByText("Netherlands");
        fireEvent.click(nlOption);

        // Check checkbox: click the custom checkbox div
        const checkboxDiv = document.querySelector("[role='checkbox']") as HTMLElement;
        fireEvent.click(checkboxDiv);

        // Select radio: click the "Free" radio option text (inside the label)
        const freeRadioDiv = document.querySelectorAll("[role='radio']")[0] as HTMLElement;
        fireEvent.click(freeRadioDiv);

        // Adjust slider
        const slider = document.querySelector("input[type='range']") as HTMLInputElement;
        fireEvent.change(slider, { target: { value: "500" } });

        // Submit
        const button = screen.getByRole("button", { name: /submit/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledTimes(1);
        });

        const submittedValues = handleSubmit.mock.calls[0][0];
        expect(submittedValues.fullName).toBe("Jan de Vries");
        expect(submittedValues.email).toBe("jan@example.com");
        expect(submittedValues.country).toBe("NL");
        expect(submittedValues.newsletter).toBe(true);
        expect(submittedValues.plan).toBe("free");
        expect(submittedValues.budget).toBe(500);
    });

    it("shows validation errors for empty required fields on submit", async () => {
        const handleSubmit = vi.fn();
        render(<FormBuilder schema={fullSchema} onSubmit={handleSubmit} />);

        // Submit without filling anything
        const button = screen.getByRole("button", { name: /submit/i });
        fireEvent.click(button);

        await waitFor(() => {
            const errors = document.querySelectorAll("[role='alert']");
            expect(errors.length).toBeGreaterThan(0);
        });

        // Handler should NOT have been called
        expect(handleSubmit).not.toHaveBeenCalled();

        // Check specific required field errors
        const errorMessages = document.querySelectorAll("[role='alert']");
        const texts = Array.from(errorMessages).map((el) => el.textContent);
        expect(texts.filter((t) => t === "This field is required").length).toBeGreaterThanOrEqual(
            3,
        );
    });

    it("clears validation errors after correcting fields and resubmitting", async () => {
        const handleSubmit = vi.fn();
        render(<FormBuilder schema={fullSchema} onSubmit={handleSubmit} />);

        // Submit empty to trigger errors
        const button = screen.getByRole("button", { name: /submit/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(document.querySelectorAll("[role='alert']").length).toBeGreaterThan(0);
        });

        // Now fill in all required fields
        const textInput = document.querySelector("input[type='text']") as HTMLInputElement;
        fireEvent.change(textInput, { target: { value: "Alice" } });

        const emailInput = document.querySelector("input[type='email']") as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: "alice@test.com" } });

        // Fill select via custom dropdown
        const combobox = document.querySelector("[role='combobox']") as HTMLElement;
        fireEvent.click(combobox);
        await waitFor(() => {
            expect(document.querySelector("[role='listbox']")).not.toBeNull();
        });
        const usOption = screen.getByText("United States");
        fireEvent.click(usOption);

        // Select radio: click the "Pro" option
        const radioOptions = document.querySelectorAll("[role='radio']");
        fireEvent.click(radioOptions[1] as HTMLElement); // "Pro" is the second option

        // Submit again
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledTimes(1);
        });

        // Errors should now be cleared
        await waitFor(() => {
            const remainingErrors = document.querySelectorAll("[role='alert']");
            expect(remainingErrors.length).toBe(0);
        });
    });
});
