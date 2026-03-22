// ---------------------------------------------------------------------------
// Formatica – Utility to extract field schemas from a unified schema tree
// ---------------------------------------------------------------------------

import type { FieldSchema, SchemaNode } from "../types/schema";

/**
 * Recursively walks a `SchemaNode[]` tree and collects every node that is an
 * actual field (i.e. has a `name` property), ignoring layout containers.
 */
export function extractFields(nodes: SchemaNode[]): FieldSchema[] {
    const fields: FieldSchema[] = [];
    for (const node of nodes) {
        if (isFieldNode(node)) {
            fields.push(node);
        } else if (node.type === "row" || node.type === "group") {
            fields.push(...extractFields(node.children));
        } else if (node.type === "steps") {
            for (const step of node.steps) {
                fields.push(...extractFields(step.children));
            }
        } else if (node.type === "tabs") {
            for (const tab of node.tabs) {
                fields.push(...extractFields(tab.children));
            }
        }
    }
    return fields;
}

/**
 * Type-guard that distinguishes field nodes from layout container nodes.
 */
export function isFieldNode(node: SchemaNode): node is FieldSchema {
    return "name" in node && typeof node.name === "string";
}
