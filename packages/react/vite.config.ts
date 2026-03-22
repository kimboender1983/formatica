import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "FormaticaReact",
            formats: ["es", "umd"],
            fileName: (format) => `formatica-react.${format === "es" ? "es.js" : "umd.cjs"}`,
        },
        rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime", "@formatica/core"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                    "react/jsx-runtime": "jsxRuntime",
                    "@formatica/core": "FormaticaCore",
                },
            },
        },
        sourcemap: true,
    },
});
