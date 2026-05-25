import React from 'react'

/**
 * Renders a <script type="application/ld+json"> tag with the given Schema.org payload.
 * Use sparingly — one per page is the typical pattern for the primary entity.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
