import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Rewrite media URLs from `/api/media/file/<filename>` → `/media/<filename>`.
 * Files live in `public/media/` (see `upload.staticDir`), so Next.js can serve them
 * directly as static assets — no Payload middleware, no DB hit, full HTTP caching.
 * Avoids 30s cold-start latency on Neon when serving public images.
 */
function rewriteMediaUrls(doc: Record<string, unknown>): Record<string, unknown> {
  if (typeof doc?.filename === 'string') {
    doc.url = `/media/${doc.filename}`
  }
  const sizes = doc?.sizes as Record<string, { filename?: string; url?: string }> | undefined
  if (sizes) {
    for (const key of Object.keys(sizes)) {
      const size = sizes[key]
      if (size?.filename) size.url = `/media/${size.filename}`
    }
  }
  return doc
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterRead: [({ doc }) => rewriteMediaUrls(doc)],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
