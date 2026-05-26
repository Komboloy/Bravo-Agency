import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const ImageOverlayCard: Block = {
  slug: 'imageOverlayCard',
  interfaceName: 'ImageOverlayCardBlock',
  labels: {
    singular: 'Image + glass card overlay',
    plural: 'Image overlay blocks',
  },
  admin: {
    group: 'BRAVO!',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Image plein-écran en arrière-plan (paysage idéalement, 2400x1600 minimum).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'cardPosition',
          type: 'select',
          defaultValue: 'bottom-left',
          options: [
            { label: 'Bas-gauche', value: 'bottom-left' },
            { label: 'Bas-droite', value: 'bottom-right' },
            { label: 'Centre', value: 'center' },
            { label: 'Haut-gauche', value: 'top-left' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'cardWidth',
          type: 'select',
          defaultValue: 'medium',
          options: [
            { label: 'Compact (480px)', value: 'compact' },
            { label: 'Medium (620px)', value: 'medium' },
            { label: 'Large (760px)', value: 'large' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'label',
      type: 'text',
      admin: { description: 'Kicker mono au-dessus du titre. Ex: "§03 · Le défi"' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
