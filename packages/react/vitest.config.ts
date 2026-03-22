import { defineConfig } from "vitest/config";
export default defineConfig({
    test: {
        root: new URL(".", import.meta.url).pathname,
        environment: "happy-dom",
        globals: true,
        include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    },
    resolve: {
        alias: {
            "@formatica/react": new URL("./src/index.ts", import.meta.url).pathname,
            "@formatica/core": new URL("../core/src/index.ts", import.meta.url).pathname,
        },
    },
});
