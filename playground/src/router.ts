import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/",
        name: "playground",
        component: () => import("./pages/PlaygroundPage.vue"),
    },
    {
        path: "/builder",
        name: "builder",
        component: () => import("./pages/FormBuilderPage.vue"),
    },
    {
        path: "/examples",
        name: "examples",
        component: () => import("./pages/ExamplesPage.vue"),
    },
    {
        path: "/examples/:id",
        name: "example-detail",
        component: () => import("./pages/ExamplesPage.vue"),
    },
    {
        path: "/docs",
        name: "docs",
        component: () => import("./pages/DocsPage.vue"),
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
