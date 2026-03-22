import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useForm } from "@formatica/react";
import type { FormSchema } from "@formatica/core";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const schema: FormSchema = {
    fields: [
        { type: "text", name: "name", label: "Name", required: true },
        { type: "checkbox", name: "agree", label: "Agree" },
        { type: "tags", name: "tags", label: "Tags" },
        { type: "number", name: "age", label: "Age" },
        {
            type: "text",
            name: "email",
            label: "Email",
            inputType: "email",
            rules: "required|email",
        },
    ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useForm", () => {
    it("creates form with correct initial values per type", () => {
        const { result } = renderHook(() => useForm(schema));

        expect(result.current.values.name).toBe("");
        expect(result.current.values.agree).toBe(false);
        expect(result.current.values.tags).toEqual([]);
        expect(result.current.values.age).toBeNull();
        expect(result.current.values.email).toBe("");
    });

    it("setFieldValue updates values", () => {
        const { result } = renderHook(() => useForm(schema));

        act(() => {
            result.current.setFieldValue("name", "Alice");
        });

        expect(result.current.values.name).toBe("Alice");
    });

    it("validate() returns false when required fields are empty", async () => {
        const { result } = renderHook(() => useForm(schema));

        let valid: boolean | undefined;
        await act(async () => {
            valid = await result.current.validate();
        });

        expect(valid).toBe(false);
        expect(result.current.errors.name.length).toBeGreaterThan(0);
        expect(result.current.errors.email.length).toBeGreaterThan(0);
    });

    it("validate() returns true when all required fields are valid", async () => {
        const { result } = renderHook(() => useForm(schema));

        act(() => {
            result.current.setFieldValue("name", "Alice");
            result.current.setFieldValue("email", "alice@example.com");
        });

        let valid: boolean | undefined;
        await act(async () => {
            valid = await result.current.validate();
        });

        expect(valid).toBe(true);
    });

    it("validateField() validates a single field", async () => {
        const { result } = renderHook(() => useForm(schema));

        let valid: boolean | undefined;
        await act(async () => {
            valid = await result.current.validateField("name");
        });

        expect(valid).toBe(false);
        expect(result.current.errors.name).toContain("This field is required");
    });

    it("reset() restores initial values", () => {
        const { result } = renderHook(() => useForm(schema));

        act(() => {
            result.current.setFieldValue("name", "Alice");
            result.current.setFieldValue("age", 30);
        });

        expect(result.current.values.name).toBe("Alice");

        act(() => {
            result.current.reset();
        });

        expect(result.current.values.name).toBe("");
        expect(result.current.values.age).toBeNull();
    });

    it("clear() sets all fields to null", () => {
        const { result } = renderHook(() => useForm(schema));

        act(() => {
            result.current.setFieldValue("name", "Alice");
        });

        act(() => {
            result.current.clear();
        });

        expect(result.current.values.name).toBeNull();
        expect(result.current.values.agree).toBeNull();
        expect(result.current.values.tags).toBeNull();
    });

    it("setError() / clearError() / clearErrors() work", () => {
        const { result } = renderHook(() => useForm(schema));

        act(() => {
            result.current.setError("name", "Custom error");
        });
        expect(result.current.errors.name).toEqual(["Custom error"]);

        act(() => {
            result.current.setError("email", ["Error 1", "Error 2"]);
        });
        expect(result.current.errors.email).toEqual(["Error 1", "Error 2"]);

        act(() => {
            result.current.clearError("name");
        });
        expect(result.current.errors.name).toBeUndefined();
        // email errors should still be there
        expect(result.current.errors.email).toEqual(["Error 1", "Error 2"]);

        act(() => {
            result.current.clearErrors();
        });
        expect(result.current.errors).toEqual({});
    });

    it("submit() calls handler only when valid, and increments submitCount", async () => {
        const { result } = renderHook(() => useForm(schema));
        const handler = vi.fn();

        // Submit with invalid form (required fields empty)
        await act(async () => {
            await result.current.submit(handler);
        });
        expect(handler).not.toHaveBeenCalled();
        expect(result.current.submitCount).toBe(1);

        // Fill required fields
        act(() => {
            result.current.setFieldValue("name", "Alice");
            result.current.setFieldValue("email", "alice@example.com");
        });

        // Submit with valid form
        await act(async () => {
            await result.current.submit(handler);
        });
        expect(handler).toHaveBeenCalledTimes(1);
        expect(result.current.submitCount).toBe(2);
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ name: "Alice", email: "alice@example.com" }),
        );
    });

    it("isValid is computed correctly", () => {
        const { result } = renderHook(() => useForm(schema));

        // No errors initially
        expect(result.current.isValid).toBe(true);

        act(() => {
            result.current.setError("name", "Required");
        });
        expect(result.current.isValid).toBe(false);

        act(() => {
            result.current.clearErrors();
        });
        expect(result.current.isValid).toBe(true);
    });

    it("isDirty is computed correctly", () => {
        const { result } = renderHook(() => useForm(schema));

        expect(result.current.isDirty).toBe(false);

        act(() => {
            result.current.setFieldValue("name", "Alice");
        });
        expect(result.current.isDirty).toBe(true);

        act(() => {
            result.current.reset();
        });
        expect(result.current.isDirty).toBe(false);
    });

    it("touched tracks on validateField (blur proxy)", async () => {
        const { result } = renderHook(() => useForm(schema));

        expect(result.current.touched.name).toBeUndefined();

        await act(async () => {
            await result.current.validateField("name");
        });

        expect(result.current.touched.name).toBe(true);
    });
});
