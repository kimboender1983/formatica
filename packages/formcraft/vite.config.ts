import { resolve } from "node:path";
import { copyFileSync, mkdirSync } from "node:fs";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        vue(),
        {
            name: "copy-formatica-css",
            closeBundle() {
                mkdirSync(resolve(__dirname, "dist"), { recursive: true });
                copyFileSync(
                    resolve(__dirname, "src/styles/formatica.css"),
                    resolve(__dirname, "dist/style.css"),
                );
            },
        },
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "Formatica",
            formats: ["es", "umd"],
            fileName: (format) => `formatica.${format === "es" ? "es.js" : "umd.cjs"}`,
        },
        rollupOptions: {
            external: ["vue", "libphonenumber-js", "@formatica/core"],
            output: {
                globals: {
                    vue: "Vue",
                    "libphonenumber-js": "libphonenumber",
                    "@formatica/core": "FormaticaCore",
                },
            },
        },
        sourcemap: true,
    },
});
