<script setup lang="ts">
    import { onMounted, ref, watch } from "vue";
    import { useRoute } from "vue-router";

    // ---------------------------------------------------------------------------
    // Dark mode
    // ---------------------------------------------------------------------------
    const isDark = ref(false);

    onMounted(() => {
        const stored = localStorage.getItem("formatica-dark-mode");
        if (stored !== null) {
            isDark.value = stored === "true";
        } else {
            isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        applyDarkClass();
    });

    watch(isDark, () => {
        localStorage.setItem("formatica-dark-mode", String(isDark.value));
        applyDarkClass();
    });

    function applyDarkClass() {
        document.documentElement.classList.toggle("dark", isDark.value);
    }

    function toggleDark() {
        isDark.value = !isDark.value;
    }

    // ---------------------------------------------------------------------------
    // Mobile sidebar
    // ---------------------------------------------------------------------------
    const sidebarOpen = ref(false);

    const route = useRoute();
    watch(
        () => route.path,
        () => {
            sidebarOpen.value = false;
        },
    );

    // ---------------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------------
    interface NavItem {
        label: string;
        to: string;
        icon: string;
    }

    const developLinks: NavItem[] = [
        {
            label: "Playground",
            to: "/",
            icon: "code-bracket",
        },
        {
            label: "Builder",
            to: "/builder",
            icon: "squares-plus",
        },
    ];

    const learnLinks: NavItem[] = [
        {
            label: "Examples",
            to: "/examples",
            icon: "rectangle-group",
        },
        {
            label: "Docs",
            to: "/docs",
            icon: "document-text",
        },
    ];

    function isActive(to: string): boolean {
        if (to === "/") return route.path === "/";
        return route.path.startsWith(to);
    }
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
    <!-- Mobile overlay -->
    <Transition name="sidebar">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 transition-transform duration-200 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-14 items-center gap-2.5 border-b border-gray-200 dark:border-gray-800 px-5">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 17.5h7" />
            <path d="M17.5 14v7" />
          </svg>
        </div>
        <span class="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
          Formatica
        </span>
        <span class="ml-auto rounded-md bg-primary-100 dark:bg-primary-900/40 px-1.5 py-0.5 text-[10px] font-medium text-primary-700 dark:text-primary-300">
          v0.1
        </span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-6">
        <!-- Develop group -->
        <div>
          <p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Develop
          </p>
          <ul class="space-y-0.5">
            <li v-for="item in developLinks" :key="item.to">
              <RouterLink
                :to="item.to"
                :class="[
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                  isActive(item.to)
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
                ]"
              >
                <!-- code-bracket -->
                <svg
                  v-if="item.icon === 'code-bracket'"
                  class="h-4 w-4 shrink-0"
                  :class="isActive(item.to) ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
                <!-- squares-plus -->
                <svg
                  v-if="item.icon === 'squares-plus'"
                  class="h-4 w-4 shrink-0"
                  :class="isActive(item.to) ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Learn group -->
        <div>
          <p class="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Learn
          </p>
          <ul class="space-y-0.5">
            <li v-for="item in learnLinks" :key="item.to">
              <RouterLink
                :to="item.to"
                :class="[
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors',
                  isActive(item.to)
                    ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200',
                ]"
              >
                <!-- rectangle-group -->
                <svg
                  v-if="item.icon === 'rectangle-group'"
                  class="h-4 w-4 shrink-0"
                  :class="isActive(item.to) ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
                </svg>
                <!-- document-text -->
                <svg
                  v-if="item.icon === 'document-text'"
                  class="h-4 w-4 shrink-0"
                  :class="isActive(item.to) ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                {{ item.label }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Sidebar footer -->
      <div class="border-t border-gray-200 dark:border-gray-800 px-3 py-3">
        <button
          @click="toggleDark"
          class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <!-- Sun icon (shown in dark mode) -->
          <svg
            v-if="isDark"
            class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
          </svg>
          <!-- Moon icon (shown in light mode) -->
          <svg
            v-else
            class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
          {{ isDark ? 'Light mode' : 'Dark mode' }}
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Mobile header -->
      <header class="flex h-14 items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-4 lg:hidden">
        <button
          @click="sidebarOpen = true"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div class="flex items-center gap-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary-600 text-white">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 17.5h7" />
              <path d="M17.5 14v7" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">Formatica</span>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto scrollbar-thin p-6 lg:p-8">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
