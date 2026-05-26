import type { Block } from 'payload'

export const ProjectShowcase: Block = {
  slug: 'projectShowcase',
  interfaceName: 'ProjectShowcaseBlock',
  labels: {
    singular: 'Vitrine de projets',
    plural: 'Vitrines de projets',
  },
  admin: {
    group: 'BRAVO!',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      defaultValue: 'Travaux',
      admin: { description: 'Kicker mono. Ex: "Travaux · Sélection 2026"' },
    },
    {
      name: 'heading',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'Titre de la section. Ex: "Quelques projets qui nous représentent."' },
    },
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Manuel (je choisis les projets)', value: 'manual' },
        { label: 'Auto: projets featured', value: 'featured' },
        { label: 'Auto: derniers projets', value: 'latest' },
      ],
      admin: { description: 'Comment sélectionner les projets à afficher.' },
    },
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.mode === 'manual',
        description: 'Sélection manuelle. Ordre = ordre d\'affichage.',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 6,
      admin: {
        condition: (_, siblingData) => siblingData?.mode !== 'manual',
        description: 'Nombre de projets à afficher (1-6).',
      },
    },
    {
      name: 'showViewAll',
      type: 'checkbox',
      defaultValue: true,
      label: 'Afficher le lien "Voir tous les projets"',
    },
  ],
}
