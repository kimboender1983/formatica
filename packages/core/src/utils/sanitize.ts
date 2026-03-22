// ---------------------------------------------------------------------------
// Formatica Core – Simple HTML sanitizer for HtmlLayout content
// ---------------------------------------------------------------------------

/**
 * Strip `<script>` tags and inline event handlers (on*="...") from HTML strings.
 * This is a lightweight sanitizer for use with the HtmlLayout node type.
 */
export function sanitizeHtml(html: string): string {
    return (
        html
            // Remove <script> tags and their content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            // Remove event handler attributes (onclick, onload, onerror, etc.)
            .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
            // Remove javascript: protocol in href/src/action attributes
            .replace(/(href|src|action)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""')
    );
}
