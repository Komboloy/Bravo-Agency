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
    const originalSource = originalDoc?.[useAsSlug]

    if (!currentSource) return value
    const expectedFromCurrent = slugifyString(currentSource)

    // No existing slug yet → start from the current source
    if (!value) return expectedFromCurrent

    // No previous source (very first save of a new doc) → keep following the source
    if (!originalSource) return expectedFromCurrent

    // The slug currently in the DB was generated from the OLD source value.
    // If it matches that auto-derived form, the user has NOT customised it → keep following.
    const expectedFromPrevious = slugifyString(originalSource)
    if (value === expectedFromPrevious) return expectedFromCurrent

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
