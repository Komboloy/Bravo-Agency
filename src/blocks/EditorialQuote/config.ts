import type { Block } from 'payload'

export const EditorialQuote: Block = {
  slug: 'editorialQuote',
  interfaceName: 'EditorialQuoteBlock',
  labels: {
    singular: 'Citation éditoriale',
    plural: 'Citations éditoriales',
  },
  admin: {
    group: 'BRAVO!',
  },
  fields: [
    {
      name: 'background',
      type: 'select',
      defaultValue: 'bravo',
      options: [
        { label: 'BRAVO color (avec spotlight cream)', value: 'bravo' },
        { label: 'Sombre (sur ink)', value: 'ink' },
        { label: 'Clair (sur paper)', value: 'paper' },
      ],
      admin: {
        description: 'Choisis l\'arrière-plan. BRAVO = bookend pour testimonials.',
      },
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'La citation en italique Fraunces. Mets *des étoiles* autour d\'un mot pour le passer en accent éditorial.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'author',
          type: 'text',
          admin: { width: '50%', description: 'Nom de l\'auteur (optionnel).' },
        },
        {
          name: 'role',
          type: 'text',
          localized: true,
          admin: {
            width: '50%',
            description: 'Ex: "Directrice communication, WWF Belgium"',
          },
        },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Photo de profil ronde à côté du nom (optionnel).',
      },
    },
  ],
}
