import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [vue()],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "FormCraft",
            formats: ["es", "umd"],
            fileName: (format) => `formcraft.${format === "es" ? "es.js" : "umd.cjs"}`,
        },
        rollupOptions: {
            external: ["vue", "libphonenumber-js"],
            output: {
                globals: { vue: "Vue", "libphonenumber-js": "libphonenumber" },
            },
        },
        sourcemap: true,
    },
});
