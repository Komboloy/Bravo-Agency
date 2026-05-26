import type { Block } from 'payload'

export const StatsGrid: Block = {
  slug: 'statsGrid',
  interfaceName: 'StatsGridBlock',
  labels: {
    singular: 'Grille de chiffres',
    plural: 'Grilles de chiffres',
  },
  admin: {
    group: 'BRAVO!',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Résultats chiffrés',
      admin: {
        description: 'Petit kicker en mono (ex: "§06 · Résultats chiffrés").',
      },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description: 'Titre de la section. Ex: "Ce que ça a déclenché."',
      },
    },
    {
      name: 'stats',
      type: 'array',
      labels: { singular: 'Chiffre', plural: 'Chiffres' },
      minRows: 1,
      maxRows: 8,
      admin: {
        description: 'De 1 à 4 par ligne. La grille s\'adapte.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { width: '40%', description: 'Ex: "+38%", "120k", "2,4M"' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '60%', description: 'Ex: "engagement", "vues organiques"' },
            },
          ],
        },
        {
          name: 'description',
          type: 'text',
          localized: true,
          admin: { description: 'Précision optionnelle.' },
        },
      ],
    },
  ],
}
