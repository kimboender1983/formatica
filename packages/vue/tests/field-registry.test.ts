import {
    getFieldComponent,
    getRegisteredFieldTypes,
    hasFieldType,
    registerFieldType,
    unregisterFieldType,
} from "@formatica/vue";
import { defineComponent, h } from "vue";

const DummyComponent = defineComponent({
    name: "DummyField",
    setup() {
        return () => h("input", { type: "text" });
    },
});

const AnotherComponent = defineComponent({
    name: "AnotherField",
    setup() {
        return () => h("textarea");
    },
});

describe("field registry", () => {
    const testType = "test-custom-field";

    afterEach(() => {
        // Clean up any test registrations
        if (hasFieldType(testType)) {
            unregisterFieldType(testType);
        }
    });

    it("registers a custom component", () => {
        registerFieldType(testType, DummyComponent);
        expect(hasFieldType(testType)).toBe(true);
    });

    it("hasFieldType returns true after registration", () => {
        expect(hasFieldType(testType)).toBe(false);
        registerFieldType(testType, DummyComponent);
        expect(hasFieldType(testType)).toBe(true);
    });

    it("getFieldComponent returns the registered component", () => {
        registerFieldType(testType, DummyComponent);
        const comp = getFieldComponent(testType);
        expect(comp).toBe(DummyComponent);
    });

    it("getFieldComponent returns undefined for unregistered types", () => {
        expect(getFieldComponent("nonexistent-type")).toBeUndefined();
    });

    it("unregisterFieldType removes the component", () => {
        registerFieldType(testType, DummyComponent);
        expect(hasFieldType(testType)).toBe(true);

        unregisterFieldType(testType);
        expect(hasFieldType(testType)).toBe(false);
        expect(getFieldComponent(testType)).toBeUndefined();
    });

    it("getRegisteredFieldTypes lists all registered types", () => {
        registerFieldType(testType, DummyComponent);
        const types = getRegisteredFieldTypes();
        expect(types).toContain(testType);
        expect(Array.isArray(types)).toBe(true);
    });

    it("overwriting an existing type replaces the component", () => {
        registerFieldType(testType, DummyComponent);
        expect(getFieldComponent(testType)).toBe(DummyComponent);

        registerFieldType(testType, AnotherComponent);
        expect(getFieldComponent(testType)).toBe(AnotherComponent);
    });
});
