<script setup lang="ts">
    import { computed, ref } from "vue";
    import { useThemeClasses } from "../../core/useTheme";

    const props = withDefaults(
        defineProps<{
            modelValue: File | File[] | null;
            accept?: string;
            maxSize?: number;
            multiple?: boolean;
            maxFiles?: number;
            disabled?: boolean;
        }>(),
        {
            multiple: false,
            disabled: false,
        },
    );

    const emit = defineEmits<{
        "update:modelValue": [value: File | File[] | null];
        blur: [event: FocusEvent];
    }>();

    useThemeClasses();

    const fileInputRef = ref<HTMLInputElement | null>(null);
    const isDragOver = ref(false);

    const files = computed<File[]>(() => {
        if (!props.modelValue) return [];
        return Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue];
    });

    function formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function filterFiles(incoming: File[]): File[] {
        let valid = incoming;
        if (props.maxSize) {
            const limit = props.maxSize;
            valid = valid.filter((f) => f.size <= limit);
        }
        if (props.multiple && props.maxFiles) {
            const remaining = props.maxFiles - files.value.length;
            valid = valid.slice(0, Math.max(0, remaining));
        }
        return valid;
    }

    function addFiles(incoming: File[]) {
        const valid = filterFiles(incoming);
        if (valid.length === 0) return;
        if (props.multiple) {
            emit("update:modelValue", [...files.value, ...valid]);
        } else {
            emit("update:modelValue", valid[0]);
        }
    }

    function onFileChange(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target.files) return;
        addFiles(Array.from(target.files));
        // Reset so same file can be selected again
        target.value = "";
    }

    function removeFile(index: number) {
        if (props.disabled) return;
        const updated = files.value.filter((_, i) => i !== index);
        if (props.multiple) {
            emit("update:modelValue", updated.length ? updated : []);
        } else {
            emit("update:modelValue", null);
        }
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault();
        if (!props.disabled) isDragOver.value = true;
    }

    function onDragLeave() {
        isDragOver.value = false;
    }

    function onDrop(event: DragEvent) {
        event.preventDefault();
        isDragOver.value = false;
        if (props.disabled || !event.dataTransfer?.files) return;
        addFiles(Array.from(event.dataTransfer.files));
    }

    function openPicker() {
        if (!props.disabled) fileInputRef.value?.click();
    }
</script>

<template>
  <div :class="disabled ? 'opacity-50 cursor-not-allowed' : ''">
    <!-- Drop zone -->
    <div
      role="button"
      tabindex="0"
      :aria-disabled="disabled || undefined"
      :class="[
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-200',
        isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50',
        disabled ? 'pointer-events-none' : 'cursor-pointer hover:border-gray-400',
      ]"
      @click="openPicker"
      @keydown.enter="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      @blur="emit('blur', $event as unknown as FocusEvent)"
    >
      <svg
        class="mb-2 h-8 w-8 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
        />
      </svg>
      <p class="text-sm text-gray-600">
        Drop files here or <span class="font-medium text-blue-500">browse</span>
      </p>
      <p v-if="accept" class="mt-1 text-xs text-gray-400">Accepted: {{ accept }}</p>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="hidden"
      @change="onFileChange"
    />

    <!-- File list -->
    <ul v-if="files.length > 0" class="mt-3 space-y-2">
      <li
        v-for="(file, idx) in files"
        :key="`${file.name}-${idx}`"
        class="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
      >
        <div class="flex items-center gap-2 truncate">
          <svg
            class="h-4 w-4 shrink-0 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span class="truncate">{{ file.name }}</span>
          <span class="shrink-0 text-xs text-gray-400">({{ formatSize(file.size) }})</span>
        </div>
        <button
          v-if="!disabled"
          type="button"
          class="ml-2 shrink-0 text-gray-400 hover:text-red-500 transition-colors duration-200"
          aria-label="Remove file"
          @click.stop="removeFile(idx)"
        >
          &times;
        </button>
      </li>
    </ul>
  </div>
</template>
