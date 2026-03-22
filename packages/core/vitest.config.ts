import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        root: new URL(".", import.meta.url).pathname,
        globals: true,
        include: ["tests/**/*.test.ts"],
    },
    resolve: {
        alias: {
            "@formatica/core": new URL("./src/index.ts", import.meta.url).pathname,
        },
    },
});
