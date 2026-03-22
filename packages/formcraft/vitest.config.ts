import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [vue()],
    test: {
        root: new URL(".", import.meta.url).pathname,
        environment: "happy-dom",
        globals: true,
        include: ["tests/**/*.test.ts"],
    },
    resolve: {
        alias: {
            "@formcraft/vue": new URL("./src/index.ts", import.meta.url).pathname,
        },
    },
});
