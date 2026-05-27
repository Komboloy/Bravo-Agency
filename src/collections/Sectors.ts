import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { bravoSlug } from '@/fields/bravoSlug'

export const Sectors: CollectionConfig = {
  slug: 'sectors',
  labels: {
    singular: 'Secteur',
    plural: 'Secteurs',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'slug'],
    description: 'Secteurs des projets (ONG, Culture, Industrie...). Affichés comme filtres sur /projets.',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Libellé',
    },
    bravoSlug({ position: undefined }),
    {
      name: 'order',
      type: 'number',
      label: 'Ordre d\'affichage',
      defaultValue: 100,
      admin: {
        description: 'Ordre dans les pills de filtre. Plus petit = plus à gauche.',
      },
    },
  ],
}
