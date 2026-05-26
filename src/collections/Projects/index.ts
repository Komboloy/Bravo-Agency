import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { bravoSlug } from '@/fields/bravoSlug'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
// BRAVO! custom blocks
import { BravoBreath } from '../../blocks/BravoBreath/config'
import { EditorialQuote } from '../../blocks/EditorialQuote/config'
import { StatsGrid } from '../../blocks/StatsGrid/config'
import { ImageOverlayCard } from '../../blocks/ImageOverlayCard/config'
import { ProjectShowcase } from '../../blocks/ProjectShowcase/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

export const Projects: CollectionConfig<'projects'> = {
  slug: 'projects',
  labels: {
    singular: 'Projet',
    plural: 'Projets',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    client: true,
    year: true,
    sector: true,
    thumbnail: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    defaultColumns: ['title', 'client', 'year', 'sector', '_status'],
    useAsTitle: 'title',
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'projects',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'projects',
        req,
      }),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Nom interne du projet (souvent le nom du client ou de la campagne).',
      },
    },
    {
      name: 'tagline',
      type: 'text',
      localized: true,
      admin: {
        description: 'Phrase courte qui résume le projet (apparaît sous le titre).',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'client',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'year',
          type: 'number',
          admin: { width: '25%' },
        },
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Mettre en avant',
          defaultValue: false,
          admin: {
            width: '25%',
            description: 'Affiché sur la home et en tête de liste.',
          },
        },
      ],
    },
    {
      name: 'sector',
      type: 'select',
      options: [
        { label: 'ONG / Engagement', value: 'ong' },
        { label: 'Culture', value: 'culture' },
        { label: 'Industrie', value: 'industry' },
        { label: 'Tech / Digital', value: 'tech' },
        { label: 'Éducation', value: 'education' },
        { label: 'Santé', value: 'health' },
        { label: 'Public', value: 'public' },
        { label: 'Autre', value: 'other' },
      ],
    },
    {
      name: 'services',
      type: 'select',
      hasMany: true,
      label: 'Réalisation (disciplines livrées)',
      admin: {
        description:
          'Les disciplines effectivement livrées par BRAVO! sur ce projet. Apparaît dans la meta-bar de la page projet.',
      },
      options: [
        { label: 'Stratégie de marque', value: 'brand-strategy' },
        { label: 'Identité visuelle', value: 'visual-identity' },
        { label: 'Site web', value: 'website' },
        { label: 'Campagne', value: 'campaign' },
        { label: 'Direction artistique', value: 'art-direction' },
        { label: 'Production vidéo', value: 'video' },
        { label: 'Édition / Print', value: 'print' },
        { label: 'Réseaux sociaux', value: 'social' },
        { label: 'Événementiel', value: 'events' },
        { label: 'Conseil', value: 'consulting' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Crédits — Création & partenaires',
      admin: {
        description:
          'À remplir uniquement si le projet a été réalisé en collaboration ou créé dans un autre contexte (ex. ancienne agence). Laisser vide si BRAVO! est l\'auteur unique.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'creation',
          type: 'array',
          label: 'Création (crédits du concept)',
          labels: { singular: 'Crédit', plural: 'Crédits création' },
          admin: {
            description:
              'Personnes qui ont conçu le projet. Utile si Stephan ou Michael l\'ont créé dans une autre agence avant BRAVO!, ou si le concept vient d\'un partenaire.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: { width: '40%', description: 'Ex : "Stephan Marly"' },
                },
                {
                  name: 'role',
                  type: 'text',
                  admin: { width: '30%', description: 'Ex : "Direction artistique"' },
                },
                {
                  name: 'agency',
                  type: 'text',
                  admin: {
                    width: '30%',
                    description: 'Si applicable. Ex : "Second Floor"',
                  },
                },
              ],
            },
            {
              name: 'agencyUrl',
              type: 'text',
              admin: { description: 'Lien optionnel vers l\'agence.' },
            },
          ],
        },
        {
          name: 'partners',
          type: 'array',
          label: 'Partenaires / Collaborateurs externes',
          labels: { singular: 'Partenaire', plural: 'Partenaires' },
          admin: {
            description:
              'Studios, productions, réalisateurs, photographes qui ont travaillé sur le projet avec BRAVO!.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                  admin: { width: '40%' },
                },
                {
                  name: 'role',
                  type: 'text',
                  admin: { width: '40%', description: 'Ex : "Production", "Réalisation film"' },
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: { width: '20%' },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Visuels',
          fields: [
            {
              name: 'thumbnail',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Visuel utilisé sur les listings et cartes (format ~16:10).',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Visuel principal en haut de la page case study (plein écran).',
              },
            },
            {
              name: 'heroLayout',
              type: 'select',
              defaultValue: 'high',
              options: [
                { label: 'High Impact (visuel plein écran)', value: 'high' },
                { label: 'Medium Impact (visuel + texte côte-à-côte)', value: 'medium' },
                { label: 'Low Impact (texte seul, sobre)', value: 'low' },
              ],
              admin: {
                description: 'Comment afficher le hero en haut de la page projet.',
              },
            },
            {
              name: 'gallery',
              type: 'array',
              labels: { singular: 'Visuel', plural: 'Visuels' },
              admin: {
                description:
                  'Galerie d’images projet. L’option layout par item permet de varier l’affichage. Pour mettre deux images côte à côte : choisis « Deux colonnes » sur 2 items consécutifs — ils s’apparient automatiquement.',
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                  localized: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'layout',
                      type: 'select',
                      defaultValue: 'contained',
                      admin: { width: '60%', description: 'Où / comment placer l\'image' },
                      options: [
                        { label: 'Pleine largeur', value: 'full' },
                        { label: 'Largeur contenue (avec marges)', value: 'contained' },
                        { label: 'Demi-largeur gauche', value: 'half-left' },
                        { label: 'Demi-largeur droite', value: 'half-right' },
                        { label: 'Deux colonnes (paire automatique)', value: 'two-col' },
                      ],
                    },
                    {
                      name: 'fit',
                      type: 'select',
                      defaultValue: 'natural',
                      admin: {
                        width: '40%',
                        description: 'Comment afficher l\'image dans son cadre.',
                      },
                      options: [
                        { label: 'Naturel (pas de crop) ✓', value: 'natural' },
                        { label: 'Cover (rempli, crop si besoin)', value: 'cover' },
                        { label: 'Contain (entière + marges si besoin)', value: 'contain' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Contenu',
          fields: [
            {
              name: 'introduction',
              type: 'richText',
              localized: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
              admin: {
                description: 'Pitch en 2-3 phrases du projet.',
              },
            },
            {
              type: 'collapsible',
              label: 'Contexte / Challenge / Solution',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'context',
                      type: 'richText',
                      localized: true,
                      label: '§02 · Le contexte',
                      admin: { width: '60%' },
                      editor: lexicalEditor({
                        features: ({ rootFeatures }) => [
                          ...rootFeatures,
                          HeadingFeature({ enabledHeadingSizes: ['h3'] }),
                          InlineToolbarFeature(),
                        ],
                      }),
                    },
                    {
                      name: 'contextImage',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Image du contexte',
                      admin: {
                        width: '40%',
                        description: 'Visuel à côté du contexte (split layout).',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'challenge',
                      type: 'richText',
                      localized: true,
                      label: '§03 · Le défi (sur image full-bleed)',
                      admin: { width: '60%' },
                      editor: lexicalEditor({
                        features: ({ rootFeatures }) => [
                          ...rootFeatures,
                          HeadingFeature({ enabledHeadingSizes: ['h3'] }),
                          InlineToolbarFeature(),
                        ],
                      }),
                    },
                    {
                      name: 'challengeImage',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Image plein-écran',
                      admin: {
                        width: '40%',
                        description:
                          'Image en background du §03. Le texte du défi apparaît dans une glass card par-dessus. Utiliser une image dramatique.',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'solution',
                      type: 'richText',
                      localized: true,
                      label: '§04 · Notre approche / La solution',
                      admin: { width: '60%' },
                      editor: lexicalEditor({
                        features: ({ rootFeatures }) => [
                          ...rootFeatures,
                          HeadingFeature({ enabledHeadingSizes: ['h3'] }),
                          InlineToolbarFeature(),
                        ],
                      }),
                    },
                    {
                      name: 'solutionImage',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Image de la solution',
                      admin: {
                        width: '40%',
                        description: 'Visuel à côté de la solution (split layout, image à droite).',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'results',
              type: 'array',
              labels: { singular: 'Résultat', plural: 'Résultats chiffrés' },
              admin: {
                description: 'Mets en avant les chiffres clés. Ex : "+38% engagement", "120k vues".',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'value',
                      type: 'text',
                      required: true,
                      admin: { width: '40%', description: 'Ex : "+38%" ou "120k"' },
                    },
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      localized: true,
                      admin: { width: '60%', description: 'Ex : "engagement" ou "vues"' },
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
            {
              name: 'testimonial',
              type: 'group',
              label: 'Témoignage client (optionnel)',
              fields: [
                {
                  name: 'quote',
                  type: 'textarea',
                  localized: true,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'author',
                      type: 'text',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'role',
                      type: 'text',
                      localized: true,
                      admin: { width: '50%', description: 'Ex : "Directrice communication, WWF Belgium"' },
                    },
                  ],
                },
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                },
              ],
            },
          ],
        },
        {
          label: 'Sections libres',
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              admin: {
                description:
                  'Blocs libres pour enrichir la page avec du contenu sur mesure (CTA, galerie média, texte enrichi, etc.).',
              },
              blocks: [
                BravoBreath,
                EditorialQuote,
                StatsGrid,
                ImageOverlayCard,
                ProjectShowcase,
                Banner,
                CallToAction,
                Content,
                MediaBlock,
              ],
            },
          ],
        },
        {
          label: 'SEO',
          name: 'meta',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'relatedProjects',
      type: 'relationship',
      admin: { position: 'sidebar' },
      filterOptions: ({ id }) => ({ id: { not_in: [id] } }),
      hasMany: true,
      relationTo: 'projects',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    bravoSlug(),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: { interval: 100 },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
