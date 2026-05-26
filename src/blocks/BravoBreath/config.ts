import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const BravoBreath: Block = {
  slug: 'bravoBreath',
  interfaceName: 'BravoBreathBlock',
  labels: {
    singular: 'BRAVO! Breath (manifeste)',
    plural: 'BRAVO! Breath blocks',
  },
  admin: {
    group: 'BRAVO!',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Petit kicker en mono au-dessus du titre (optionnel). Ex: "Manifeste".',
      },
    },
    {
      name: 'heading',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
      admin: {
        description:
          'Phrase manifeste. Utilise gras + italique pour les moments forts. Le rendu est en huge Big Shoulders avec light/bold variants.',
      },
    },
  ],
}
