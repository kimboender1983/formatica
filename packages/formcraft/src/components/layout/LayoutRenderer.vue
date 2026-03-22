<script setup lang="ts">
    import { inject } from "vue";
    import { evaluateCondition } from "../../core/useConditions";
    import { FormContextKey } from "../../core/useForm";
    import type { FormInstance } from "../../types/form";
    import type { LayoutNode } from "../../types/layout";
    import type { SchemaNode } from "../../types/schema";
    import { isFieldNode } from "../../utils/extractFields";
    import FormField from "../FormField.vue";
    import FormDivider from "./FormDivider.vue";
    import FormGroup from "./FormGroup.vue";
    import FormHtml from "./FormHtml.vue";
    import FormRow from "./FormRow.vue";
    import FormSteps from "./FormSteps.vue";
    import FormTabs from "./FormTabs.vue";

    defineProps<{
        nodes: SchemaNode[] | LayoutNode[];
    }>();

    const form = inject<FormInstance>(FormContextKey);

    function isConditionalVisible(node: LayoutNode & { type: "conditional" }): boolean {
        if (!form) return true;
        return evaluateCondition(node.condition, form.values);
    }

    function getSpanStyle(span: number | string | undefined): Record<string, string> {
        if (span === "full") return { gridColumn: "1 / -1" };
        if (span === "auto") return { gridColumn: "auto" };
        if (typeof span === "number") return { gridColumn: `span ${span} / span ${span}` };
        // Default: full width when inside a grid (span 12)
        return { gridColumn: "span 12 / span 12" };
    }
</script>

<template>
  <template v-for="(node, index) in nodes" :key="index">
    <!-- Field node (SchemaNode with a name) -->
    <div
      v-if="isFieldNode(node as SchemaNode)"
      :class="(node as any).className ?? ''"
      :style="getSpanStyle((node as any).span)"
    >
      <FormField :name="(node as any).name" />
    </div>

    <!-- Legacy field reference (LayoutNode backwards compat) -->
    <div
      v-else-if="node.type === 'field'"
      :class="(node as any).className ?? ''"
      :style="getSpanStyle((node as any).span)"
    >
      <FormField :name="(node as any).name" />
    </div>

    <!-- Row -->
    <FormRow
      v-else-if="node.type === 'row'"
      :children="(node as any).children"
      :gap="(node as any).gap"
      :align="(node as any).align"
      :class-name="(node as any).className"
    />

    <!-- Group -->
    <FormGroup
      v-else-if="node.type === 'group'"
      :title="(node as any).title"
      :description="(node as any).description"
      :collapsible="(node as any).collapsible"
      :collapsed="(node as any).collapsed"
      :children="(node as any).children"
      :class-name="(node as any).className"
    />

    <!-- Steps -->
    <FormSteps
      v-else-if="node.type === 'steps'"
      :steps="(node as any).steps"
      :linear="(node as any).linear"
      :class-name="(node as any).className"
    />

    <!-- Tabs -->
    <FormTabs
      v-else-if="node.type === 'tabs'"
      :tabs="(node as any).tabs"
      :class-name="(node as any).className"
    />

    <!-- Divider -->
    <FormDivider
      v-else-if="node.type === 'divider'"
      :label="(node as any).label"
      :class-name="(node as any).className"
    />

    <!-- Html -->
    <FormHtml
      v-else-if="node.type === 'html'"
      :content="(node as any).content"
      :class-name="(node as any).className"
    />

    <!-- Conditional (legacy LayoutNode) -->
    <template v-else-if="node.type === 'conditional'">
      <LayoutRenderer
        v-if="isConditionalVisible(node as any)"
        :nodes="(node as any).children"
      />
      <LayoutRenderer
        v-else-if="(node as any).elseChildren?.length"
        :nodes="(node as any).elseChildren"
      />
    </template>
  </template>
</template>
