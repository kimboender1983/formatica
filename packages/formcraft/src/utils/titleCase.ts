// ---------------------------------------------------------------------------
// Formatica – Title case conversion utility
// ---------------------------------------------------------------------------

/**
 * Convert camelCase, kebab-case, or snake_case field names to Title Case.
 *
 * @example
 * titleCase('firstName')     // "First Name"
 * titleCase('last-name')     // "Last Name"
 * titleCase('email_address') // "Email Address"
 */
export function titleCase(input: string): string {
    return (
        input
            // Insert space before uppercase letters in camelCase
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            // Replace kebab-case and snake_case separators with spaces
            .replace(/[-_]+/g, " ")
            // Capitalize first letter of each word
            .replace(/\b\w/g, (char) => char.toUpperCase())
            .trim()
    );
}
