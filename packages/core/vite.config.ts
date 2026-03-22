import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "FormaticaCore",
            formats: ["es", "umd"],
            fileName: (format) => `formatica-core.${format === "es" ? "es.js" : "umd.cjs"}`,
        },
        rollupOptions: {
            external: ["libphonenumber-js"],
        },
        sourcemap: true,
    },
});
