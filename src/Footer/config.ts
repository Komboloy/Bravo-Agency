import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'tagline',
      type: 'textarea',
      defaultValue:
        "Agence de communication multidisciplinaire à Bruxelles. Engagement, sens, déclenchements.",
      admin: {
        description: "Phrase qui apparaît sous le wordmark BRAVO! dans le footer.",
      },
    },
    {
      name: 'columns',
      type: 'array',
      label: 'Colonnes de liens',
      labels: { singular: 'Colonne', plural: 'Colonnes' },
      maxRows: 3,
      admin: {
        description: 'Jusqu’à 3 colonnes (ex: Studio · Suivez). Laisser vide pour utiliser les colonnes par défaut.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: 'Titre de la colonne (ex: "Studio", "Suivez").' },
        },
        {
          name: 'links',
          type: 'array',
          labels: { singular: 'Lien', plural: 'Liens' },
          maxRows: 8,
          fields: [link({ appearances: false })],
        },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Bloc Contact',
      admin: {
        description: 'Infos affichées dans la colonne Contact du footer.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'email',
              type: 'email',
              defaultValue: 'hello@bravo-agency.be',
              admin: { width: '50%' },
            },
            {
              name: 'phone',
              type: 'text',
              admin: { width: '50%', description: 'Format libre. Ex: "+32 2 000 00 00"' },
            },
          ],
        },
        {
          name: 'address',
          type: 'textarea',
          defaultValue: 'Rue exemple 12\n1000 Bruxelles · Belgique',
          admin: { description: 'Une ligne par ligne (sauts de ligne respectés).' },
        },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      label: 'Liens légaux (bas de footer)',
      labels: { singular: 'Lien légal', plural: 'Liens légaux' },
      maxRows: 6,
      admin: {
        description: 'Ex: Mentions, Cookies, Crédits.',
        initCollapsed: true,
      },
      fields: [link({ appearances: false })],
    },
    {
      // Kept for backwards compat / future flat menu use. Hidden by default.
      name: 'navItems',
      type: 'array',
      fields: [link({ appearances: false })],
      maxRows: 6,
      admin: {
        hidden: true,
      },
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
