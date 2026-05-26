import type { Field, FieldHook } from 'payload'

/**
 * Convert any string to a URL-safe slug.
 * Removes diacritics, lowercases, replaces non-alphanum runs with single hyphens.
 */
function slugifyString(text: string): string {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-') // non-alphanum → hyphen
    .replace(/^-+|-+$/g, '') // trim hyphens at edges
}

/**
 * BRAVO! slug field — replaces Payload's stock `slugField()` which is incompatible
 * with autosave (it locks to the first character after the first 100ms save).
 *
 * Behaviour:
 * - Slug starts empty
 * - As long as the slug equals the slugified version of the source field's PREVIOUS
 *   value (or the document has no previous slug yet), regenerate from the latest title.
 *   This means: while you type, the slug keeps following the title.
 * - As soon as the user types a custom value into the slug field directly,
 *   the slug stops auto-regenerating and the manual value sticks.
 *
 * Usage:
 *   bravoSlug()                          // source = 'title' (default)
 *   bravoSlug({ useAsSlug: 'name' })     // source = 'name' (for Team)
 *   bravoSlug({ position: undefined })   // no sidebar
 */
type Options = {
  useAsSlug?: string
  position?: 'sidebar' | undefined
  required?: boolean
}

export function bravoSlug(options: Options = {}): Field {
  const { useAsSlug = 'title', position = 'sidebar', required = true } = options

  const hook: FieldHook = ({ data, value, originalDoc }) => {
    const currentSource = data?.[useAsSlug]
    if (!currentSource) return value

    // No slug yet → derive from current source value
    if (!value) return slugifyString(currentSource)

    const originalSource = originalDoc?.[useAsSlug]

    // First save of a new doc (no previous source) → respect any explicit value
    // that was passed in (e.g. from a seed script or programmatic create).
    // Subsequent saves will resync the slug to the title as the user keeps typing.
    if (!originalSource) return value

    // Subsequent saves: if the current slug equals the auto-derived form of the
    // PREVIOUS source value, the user hasn't customised it → keep following.
    const expectedFromPrevious = slugifyString(originalSource)
    if (value === expectedFromPrevious) return slugifyString(currentSource)

    // Otherwise, user has customised the slug — keep their value untouched.
    return value
  }

  return {
    name: 'slug',
    type: 'text',
    index: true,
    required,
    admin: {
      position,
      description: `URL du document. Suit automatiquement « ${useAsSlug} » tant que tu n'édites pas ce champ manuellement.`,
    },
    hooks: {
      beforeChange: [hook],
    },
  }
}
