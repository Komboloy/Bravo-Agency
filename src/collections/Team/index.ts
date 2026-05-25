import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'

export const Team: CollectionConfig<'team'> = {
  slug: 'team',
  labels: {
    singular: 'Membre',
    plural: 'L’équipe',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'role', 'order', '_status'],
    useAsTitle: 'name',
    description: 'Profils des membres de l’équipe affichés sur la page Équipe.',
  },
  defaultPopulate: {
    name: true,
    slug: true,
    role: true,
    photo: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'order',
          type: 'number',
          defaultValue: 0,
          admin: {
            width: '50%',
            description: 'Ordre d’affichage. Plus petit = en premier.',
          },
        },
      ],
    },
    {
      name: 'role',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Ex : "Création & UX/UI Design"' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'photoHover',
          type: 'upload',
          relationTo: 'media',
          admin: {
            width: '50%',
            description: 'Variante affichée au hover (optionnel).',
          },
        },
      ],
    },
    {
      name: 'bio',
      type: 'richText',
      localized: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'links',
      type: 'array',
      labels: { singular: 'Lien', plural: 'Liens' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: { width: '40%', description: 'Ex : "LinkedIn", "Site perso"' },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
    {
      name: 'email',
      type: 'email',
      admin: { description: 'Optionnel — pour un lien de contact direct.' },
    },
    slugField({ useAsSlug: 'name' }),
  ],
  versions: {
    drafts: {
      autosave: { interval: 200 },
    },
    maxPerDoc: 20,
  },
}
