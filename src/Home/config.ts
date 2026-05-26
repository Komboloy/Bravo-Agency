import type { GlobalConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

/**
 * Home — Global Payload pour tous les textes éditoriaux de la page d'accueil.
 *
 * Convention rich text :
 * - Hero h1 : `*italique*` → `font-light` (poids 300), `**gras**` → couleur BRAVO bright.
 *   Le `<br />` (shift+enter) est respecté pour les sauts de ligne.
 * - Autres sections (intro, manifeste, projets, studio, CTA) : pattern standard du site,
 *   défaut light + `**gras**` heavy + `*italique*` Fraunces.
 */
export const Home: GlobalConfig = {
  slug: 'home',
  label: 'Page d\'accueil',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Textes éditoriaux de la page d\'accueil. Hero, marquee, intro, projets, manifeste, studio, CTA.',
  },
  fields: [
    /* ============ HERO ============ */
    {
      type: 'group',
      name: 'hero',
      label: 'Hero',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'badge',
              type: 'text',
              label: 'Badge top-left',
              defaultValue: 'Active · Bruxelles',
              admin: { width: '50%' },
            },
            {
              name: 'yearRange',
              type: 'text',
              label: 'Plage d\'années top-right',
              defaultValue: '2018 — 2026',
              admin: { width: '50%' },
            },
          ],
        },
        {
          name: 'title',
          type: 'richText',
          label: 'Titre h1',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h1'] }),
              FixedToolbarFeature(),
              InlineToolbarFeature(),
            ],
          }),
          admin: {
            description: 'Utiliser un titre H1. `*italique*` → font-light. `**gras**` → couleur BRAVO. Shift+Enter pour saut de ligne.',
          },
        },
      ],
    },

    /* ============ MARQUEE ============ */
    {
      name: 'marquee',
      type: 'array',
      label: 'Marquee (slogans défilants)',
      labels: { singular: 'Slogan', plural: 'Slogans' },
      minRows: 2,
      maxRows: 8,
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
        },
      ],
      defaultValue: [
        { text: 'Together for tomorrow' },
        { text: 'Porteurs de sens' },
        { text: "Déclencheurs d'actions" },
        { text: "Une goutte d'eau" },
      ],
    },

    /* ============ INTRO ============ */
    {
      type: 'group',
      name: 'intro',
      label: 'Intro statement (paper section)',
      fields: [
        {
          name: 'label',
          type: 'text',
          defaultValue: 'À propos · 01',
        },
        {
          name: 'title',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h2'] }),
              InlineToolbarFeature(),
            ],
          }),
        },
      ],
    },

    /* ============ PROJECTS SECTION HEADER ============ */
    {
      type: 'group',
      name: 'projectsSection',
      label: 'Section "Travaux" (en-tête)',
      fields: [
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Travaux · Sélection 2026',
        },
        {
          name: 'title',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h2'] }),
              InlineToolbarFeature(),
            ],
          }),
        },
        {
          name: 'cta',
          type: 'text',
          label: 'Texte du lien "voir tous les projets"',
          defaultValue: 'Voir tous les projets',
        },
      ],
    },

    /* ============ MANIFESTO ============ */
    {
      type: 'group',
      name: 'manifesto',
      label: 'Manifeste (BRAVO color)',
      fields: [
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Manifeste',
        },
        {
          name: 'title',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h2'] }),
              InlineToolbarFeature(),
            ],
          }),
        },
      ],
    },

    /* ============ STUDIO SECTION HEADER ============ */
    {
      type: 'group',
      name: 'studioSection',
      label: 'Section "Studio" (en-tête)',
      fields: [
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Studio · Effectif',
        },
        {
          name: 'title',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h2'] }),
              InlineToolbarFeature(),
            ],
          }),
        },
        {
          name: 'cta',
          type: 'text',
          label: 'Texte du lien "notre réseau"',
          defaultValue: 'Notre réseau',
        },
      ],
    },

    /* ============ CTA ============ */
    {
      type: 'group',
      name: 'cta',
      label: 'CTA final',
      fields: [
        {
          name: 'label',
          type: 'text',
          defaultValue: 'Premier pas',
        },
        {
          name: 'title',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              HeadingFeature({ enabledHeadingSizes: ['h2'] }),
              InlineToolbarFeature(),
            ],
          }),
        },
        {
          type: 'row',
          fields: [
            {
              name: 'buttonLabel',
              type: 'text',
              defaultValue: 'Démarrer la conversation',
              admin: { width: '60%' },
            },
            {
              name: 'buttonHref',
              type: 'text',
              defaultValue: '/contact',
              admin: { width: '40%' },
            },
          ],
        },
      ],
    },
  ],
}
