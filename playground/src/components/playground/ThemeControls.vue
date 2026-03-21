<script setup lang="ts">
    import type { ThemeConfig } from "@formcraft/vue";
    import { computed, ref } from "vue";

    // ---------------------------------------------------------------------------
    // Props & emits
    // ---------------------------------------------------------------------------

    const props = defineProps<{
        theme: ThemeConfig;
    }>();

    const emit = defineEmits<{
        "update:theme": [theme: ThemeConfig];
    }>();

    // ---------------------------------------------------------------------------
    // Popover state
    // ---------------------------------------------------------------------------

    const isOpen = ref(false);

    function toggle() {
        isOpen.value = !isOpen.value;
    }

    function close() {
        isOpen.value = false;
    }

    // ---------------------------------------------------------------------------
    // Color swatches
    // ---------------------------------------------------------------------------

    interface ColorSwatch {
        label: string;
        value: string;
        bgClass: string;
    }

    const primaryColors: ColorSwatch[] = [
        { label: "Indigo", value: "#4f46e5", bgClass: "bg-indigo-500" },
        { label: "Blue", value: "#2563eb", bgClass: "bg-blue-500" },
        { label: "Purple", value: "#7c3aed", bgClass: "bg-purple-500" },
        { label: "Pink", value: "#db2777", bgClass: "bg-pink-500" },
        { label: "Emerald", value: "#059669", bgClass: "bg-emerald-500" },
        { label: "Amber", value: "#d97706", bgClass: "bg-amber-500" },
        { label: "Rose", value: "#e11d48", bgClass: "bg-rose-500" },
        { label: "Cyan", value: "#0891b2", bgClass: "bg-cyan-500" },
    ];

    const errorColors: ColorSwatch[] = [
        { label: "Red", value: "#dc2626", bgClass: "bg-red-500" },
        { label: "Rose", value: "#e11d48", bgClass: "bg-rose-500" },
        { label: "Orange", value: "#ea580c", bgClass: "bg-orange-500" },
        { label: "Pink", value: "#db2777", bgClass: "bg-pink-500" },
    ];

    const successColors: ColorSwatch[] = [
        { label: "Emerald", value: "#059669", bgClass: "bg-emerald-500" },
        { label: "Green", value: "#16a34a", bgClass: "bg-green-500" },
        { label: "Teal", value: "#0d9488", bgClass: "bg-teal-500" },
        { label: "Lime", value: "#65a30d", bgClass: "bg-lime-500" },
    ];

    // ---------------------------------------------------------------------------
    // Toggle options
    // ---------------------------------------------------------------------------

    const fieldSizes = ["sm", "md", "lg"] as const;
    const borderRadii = ["none", "sm", "md", "lg", "full"] as const;
    const variants = ["outlined", "filled", "underlined"] as const;

    // ---------------------------------------------------------------------------
    // Current selections (derived from theme)
    // ---------------------------------------------------------------------------

    const currentPrimary = computed(() => props.theme.colors?.primary ?? "#4f46e5");
    const currentError = computed(() => props.theme.colors?.error ?? "#dc2626");
    const currentSuccess = computed(() => props.theme.colors?.success ?? "#059669");

    const currentSize = computed(() => {
        const px = props.theme.spacing?.inputPaddingY;
        if (px === "0.375rem") return "sm";
        if (px === "0.75rem") return "lg";
        return "md";
    });

    const currentRadius = computed(() => {
        const r = props.theme.borders?.radius;
        if (r === "0") return "none";
        if (r === "0.125rem") return "sm";
        if (r === "0.5rem") return "lg";
        if (r === "9999px") return "full";
        return "md";
    });

    const currentVariant = computed(() => {
        const comp = props.theme.components?.input ?? "";
        if (comp.includes("filled")) return "filled";
        if (comp.includes("underlined") || comp.includes("border-b")) return "underlined";
        return "outlined";
    });

    const floatingLabels = computed(() => {
        return props.theme.components?.label?.includes("floating") ?? false;
    });

    // ---------------------------------------------------------------------------
    // Update helpers
    // ---------------------------------------------------------------------------

    function updateColor(key: "primary" | "error" | "success", value: string) {
        emit("update:theme", {
            ...props.theme,
            colors: {
                ...props.theme.colors,
                [key]: value,
            },
        });
    }

    function updateSize(size: "sm" | "md" | "lg") {
        const sizeMap: Record<string, { paddingX: string; paddingY: string; fontSize: string }> = {
            sm: { paddingX: "0.5rem", paddingY: "0.375rem", fontSize: "0.8125rem" },
            md: { paddingX: "0.75rem", paddingY: "0.5rem", fontSize: "0.875rem" },
            lg: { paddingX: "1rem", paddingY: "0.75rem", fontSize: "1rem" },
        };
        const s = sizeMap[size];
        emit("update:theme", {
            ...props.theme,
            spacing: {
                ...props.theme.spacing,
                inputPaddingX: s.paddingX,
                inputPaddingY: s.paddingY,
            },
            typography: {
                ...props.theme.typography,
                fontSize: s.fontSize,
            },
        });
    }

    function updateRadius(radius: "none" | "sm" | "md" | "lg" | "full") {
        const radiusMap: Record<string, string> = {
            none: "0",
            sm: "0.125rem",
            md: "0.375rem",
            lg: "0.5rem",
            full: "9999px",
        };
        emit("update:theme", {
            ...props.theme,
            borders: {
                ...props.theme.borders,
                radius: radiusMap[radius],
            },
        });
    }

    function updateVariant(variant: "outlined" | "filled" | "underlined") {
        const variantClasses: Record<string, string> = {
            outlined: "",
            filled: "filled",
            underlined: "underlined border-b",
        };
        emit("update:theme", {
            ...props.theme,
            components: {
                ...props.theme.components,
                input: variantClasses[variant],
            },
        });
    }

    function toggleFloatingLabels() {
        const currentLabel = props.theme.components?.label ?? "";
        const isFloating = currentLabel.includes("floating");
        emit("update:theme", {
            ...props.theme,
            components: {
                ...props.theme.components,
                label: isFloating
                    ? currentLabel.replace("floating", "").trim()
                    : `${currentLabel} floating`.trim(),
            },
        });
    }
</script>

<template>
  <div class="relative">
    <!-- Trigger button -->
    <button
      @click="toggle"
      class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-sm transition-colors"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      Theme
    </button>

    <!-- Popover panel -->
    <Transition
      enter-active-class="transition ease-out duration-150"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-xl"
      >
        <!-- Close button -->
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Theme Controls</h3>
          <button
            @click="close"
            class="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="space-y-5">
          <!-- Primary color -->
          <div>
            <label class="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">Primary color</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in primaryColors"
                :key="color.value"
                @click="updateColor('primary', color.value)"
                :title="color.label"
                :class="[
                  'h-7 w-7 rounded-full transition-all',
                  color.bgClass,
                  currentPrimary === color.value
                    ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-900 dark:ring-white scale-110'
                    : 'hover:scale-105',
                ]"
              />
            </div>
          </div>

          <!-- Error color -->
          <div>
            <label class="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">Error color</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in errorColors"
                :key="color.value"
                @click="updateColor('error', color.value)"
                :title="color.label"
                :class="[
                  'h-7 w-7 rounded-full transition-all',
                  color.bgClass,
                  currentError === color.value
                    ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-900 dark:ring-white scale-110'
                    : 'hover:scale-105',
                ]"
              />
            </div>
          </div>

          <!-- Success color -->
          <div>
            <label class="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">Success color</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="color in successColors"
                :key="color.value"
                @click="updateColor('success', color.value)"
                :title="color.label"
                :class="[
                  'h-7 w-7 rounded-full transition-all',
                  color.bgClass,
                  currentSuccess === color.value
                    ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-gray-900 dark:ring-white scale-110'
                    : 'hover:scale-105',
                ]"
              />
            </div>
          </div>

          <!-- Field size -->
          <div>
            <label class="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">Field size</label>
            <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <button
                v-for="size in fieldSizes"
                :key="size"
                @click="updateSize(size)"
                :class="[
                  'px-3 py-1.5 text-xs font-medium transition-colors',
                  currentSize === size
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600',
                ]"
              >
                {{ size.toUpperCase() }}
              </button>
            </div>
          </div>

          <!-- Border radius -->
          <div>
            <label class="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">Border radius</label>
            <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <button
                v-for="radius in borderRadii"
                :key="radius"
                @click="updateRadius(radius)"
                :class="[
                  'px-2.5 py-1.5 text-xs font-medium transition-colors',
                  currentRadius === radius
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600',
                ]"
              >
                {{ radius }}
              </button>
            </div>
          </div>

          <!-- Variant -->
          <div>
            <label class="mb-2 block text-xs font-medium text-gray-600 dark:text-gray-400">Variant</label>
            <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
              <button
                v-for="variant in variants"
                :key="variant"
                @click="updateVariant(variant)"
                :class="[
                  'px-2.5 py-1.5 text-xs font-medium capitalize transition-colors',
                  currentVariant === variant
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600',
                ]"
              >
                {{ variant }}
              </button>
            </div>
          </div>

          <!-- Floating labels -->
          <div class="flex items-center justify-between">
            <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Floating labels</label>
            <button
              @click="toggleFloatingLabels"
              :class="[
                'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                floatingLabels ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600',
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  floatingLabels ? 'translate-x-4' : 'translate-x-0',
                ]"
              />
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Click-outside overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="close"
    />
  </div>
</template>
