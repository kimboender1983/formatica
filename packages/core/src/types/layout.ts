// ---------------------------------------------------------------------------
// Formatica Core – Layout types
// ---------------------------------------------------------------------------

import type { Condition, ConditionGroup } from "./schema";

// ---------------------------------------------------------------------------
// Column span
// ---------------------------------------------------------------------------

export type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "full" | "auto";

// ---------------------------------------------------------------------------
// Layout node types
// ---------------------------------------------------------------------------

export interface FieldRef {
    type: "field";
    name: string;
    span?: ColumnSpan;
    className?: string;
}

export interface RowLayout {
    type: "row";
    columns: LayoutNode[];
    gap?: string | number;
    align?: "start" | "center" | "end" | "stretch";
    className?: string;
}

export interface GroupLayout {
    type: "group";
    title?: string;
    description?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    children: LayoutNode[];
    className?: string;
    condition?: Condition | ConditionGroup;
}

export interface StepItem {
    title: string;
    description?: string;
    icon?: string;
    children: LayoutNode[];
    condition?: Condition | ConditionGroup;
}

export interface StepsLayout {
    type: "steps";
    steps: StepItem[];
    linear?: boolean;
    className?: string;
}

export interface TabItem {
    title: string;
    icon?: string;
    children: LayoutNode[];
    disabled?: boolean;
    condition?: Condition | ConditionGroup;
}

export interface TabsLayout {
    type: "tabs";
    tabs: TabItem[];
    className?: string;
}

export interface ConditionalLayout {
    type: "conditional";
    condition: Condition | ConditionGroup;
    children: LayoutNode[];
    elseChildren?: LayoutNode[];
    className?: string;
}

export interface DividerLayout {
    type: "divider";
    label?: string;
    className?: string;
}

export interface HtmlLayout {
    type: "html";
    content: string;
    className?: string;
}

// ---------------------------------------------------------------------------
// Discriminated union
// ---------------------------------------------------------------------------

export type LayoutNode =
    | FieldRef
    | RowLayout
    | GroupLayout
    | StepsLayout
    | TabsLayout
    | ConditionalLayout
    | DividerLayout
    | HtmlLayout;

// ---------------------------------------------------------------------------
// Top-level layout schema
// ---------------------------------------------------------------------------

export interface LayoutSchema {
    nodes: LayoutNode[];
    columns?: number;
    gap?: string | number;
    className?: string;
}

// ---------------------------------------------------------------------------
// Re-export unified schema node from schema.ts
// ---------------------------------------------------------------------------

export type {
    DividerNode,
    GroupNode,
    HtmlNode,
    RowNode,
    SchemaNode,
    StepNodeItem,
    StepsNode,
    TabNodeItem,
    TabsNode,
} from "./schema";
