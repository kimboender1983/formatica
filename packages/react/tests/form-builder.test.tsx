import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { FormBuilder } from "@formatica/react";
import type { FormSchema, FieldComponentProps } from "@formatica/react";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const basicSchema: FormSchema = {
    fields: [
        { type: "text", name: "firstName", label: "First Name", required: true },
        { type: "text", name: "lastName", label: "Last Name" },
    ],
};

const rowSchema: FormSchema = {
    fields: [
        {
            type: "row",
            children: [
                { type: "text", name: "city", label: "City", span: 6 },
                { type: "text", name: "zip", label: "Zip", span: 6 },
            ],
        },
    ],
};

const groupSchema: FormSchema = {
    fields: [
        {
            type: "group",
            title: "Personal Info",
            children: [{ type: "text", name: "fullName", label: "Full Name" }],
        },
    ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FormBuilder", () => {
    it("renders form with text fields (labels and inputs visible)", () => {
        render(<FormBuilder schema={basicSchema} />);

        expect(screen.getByText("First Name")).toBeDefined();
        expect(screen.getByText("Last Name")).toBeDefined();
        // Two text inputs
        const inputs = document.querySelectorAll("input[type='text']");
        expect(inputs.length).toBe(2);
    });

    it("renders a submit button", () => {
        render(<FormBuilder schema={basicSchema} />);

        const button = screen.getByRole("button", { name: /submit/i });
        expect(button).toBeDefined();
        expect(button.getAttribute("type")).toBe("submit");
    });

    it("renders rows as grid", () => {
        render(<FormBuilder schema={rowSchema} />);

        // Row uses Tailwind grid classes (grid grid-cols-12)
        const row = document.querySelector(".grid.grid-cols-12");
        expect(row).not.toBeNull();
    });

    it("renders groups as fieldset with legend", () => {
        render(<FormBuilder schema={groupSchema} />);

        const fieldset = document.querySelector("fieldset");
        expect(fieldset).not.toBeNull();
        expect(screen.getByText("Personal Info")).toBeDefined();
        const legend = document.querySelector("legend");
        expect(legend).not.toBeNull();
        expect(legend!.textContent).toBe("Personal Info");
    });

    it("custom components prop overrides built-in type", () => {
        function CustomText({ field, value, onChange }: FieldComponentProps) {
            return (
                <input
                    data-testid="custom-text"
                    type="text"
                    value={String(value ?? "")}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        }

        render(<FormBuilder schema={basicSchema} components={{ text: CustomText }} />);

        const customInputs = screen.getAllByTestId("custom-text");
        expect(customInputs.length).toBe(2);
    });

    it("custom components prop registers new type", () => {
        function RatingField({ field, value, onChange }: FieldComponentProps) {
            return <div data-testid="rating-field">Rating: {String(value)}</div>;
        }

        const schemaWithCustom: FormSchema = {
            fields: [{ type: "rating" as any, name: "score", label: "Score" }],
        };

        render(<FormBuilder schema={schemaWithCustom} components={{ rating: RatingField }} />);

        expect(screen.getByTestId("rating-field")).toBeDefined();
    });

    it("shows validation errors after submit click", async () => {
        render(<FormBuilder schema={basicSchema} />);

        const button = screen.getByRole("button", { name: /submit/i });
        fireEvent.click(button);

        await waitFor(() => {
            const errorItems = document.querySelectorAll("[role='alert']");
            expect(errorItems.length).toBeGreaterThan(0);
        });

        // The error for the required "firstName" field
        expect(screen.getByText("This field is required")).toBeDefined();
    });

    it("calls onSubmit with values when form is valid", async () => {
        const handleSubmit = vi.fn();
        render(<FormBuilder schema={basicSchema} onSubmit={handleSubmit} />);

        // Fill in the required field
        const inputs = document.querySelectorAll<HTMLInputElement>("input[type='text']");
        fireEvent.change(inputs[0]!, { target: { value: "Alice" } });

        // Submit
        const button = screen.getByRole("button", { name: /submit/i });
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleSubmit).toHaveBeenCalledTimes(1);
        });

        expect(handleSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ firstName: "Alice", lastName: "" }),
        );
    });
});
