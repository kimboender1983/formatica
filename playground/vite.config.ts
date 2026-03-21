import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            "@formcraft/vue": resolve(__dirname, "../packages/formcraft/src"),
            "@": resolve(__dirname, "src"),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
