import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Media, Project } from '@/payload-types'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { JsonLd } from '@/components/JsonLd'
import { getServerSideURL } from '@/utilities/getURL'

// Pretty labels for the service select values stored in Payload
const SERVICE_LABELS: Record<string, string> = {
  'brand-strategy': 'Stratégie',
  'visual-identity': 'Identité',
  website: 'Web',
  campaign: 'Campagne',
  'art-direction': 'Direction artistique',
  video: 'Vidéo',
  print: 'Print / Édition',
  social: 'Réseaux sociaux',
  events: 'Événementiel',
  consulting: 'Conseil',
}
const SECTOR_LABELS: Record<string, string> = {
  ong: 'ONG · Engagement',
  culture: 'Culture',
  industry: 'Industrie',
  tech: 'Tech · Digital',
  education: 'Éducation',
  health: 'Santé',
  public: 'Public',
  other: 'Autre',
}

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return projects.docs.filter((p) => p.slug).map(({ slug }) => ({ slug: slug as string }))
}

type Args = { params: Promise<{ slug?: string }> }

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug({ slug: decodedSlug })

  if (!project) return notFound()

  const heroUrl = imageUrl(project.heroImage)
  const hasCreation = project.creation && project.creation.length > 0
  const hasPartners = project.partners && project.partners.length > 0

  const siteUrl = getServerSideURL()
  const canonicalUrl = `${siteUrl}/projets/${project.slug}`

  return (
    <article className="surface-ink min-h-screen">
      {draft && <LivePreviewListener />}

      {/* Schema.org CreativeWork — describes the case study */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          '@id': canonicalUrl,
          name: project.title,
          headline: project.tagline || project.title,
          url: canonicalUrl,
          image: heroUrl ? `${siteUrl}${heroUrl}` : undefined,
          dateCreated: project.year ? String(project.year) : undefined,
          dateModified: project.updatedAt,
          inLanguage: 'fr-BE',
          author: {
            '@type': 'Organization',
            name: 'BRAVO! Agency',
            url: siteUrl,
          },
          ...(project.client && {
            client: { '@type': 'Organization', name: project.client },
          }),
          ...(project.creation && project.creation.length > 0 && {
            creator: project.creation.map((c) => ({
              '@type': 'Person',
              name: c.name,
              ...(c.role && { jobTitle: c.role }),
              ...(c.agency && {
                worksFor: { '@type': 'Organization', name: c.agency, ...(c.agencyUrl && { url: c.agencyUrl }) },
              }),
            })),
          }),
          ...(project.partners && project.partners.length > 0 && {
            contributor: project.partners.map((p) => ({
              '@type': 'Organization',
              name: p.name,
              ...(p.url && { url: p.url }),
              ...(p.role && { description: p.role }),
            })),
          }),
          ...(project.services && project.services.length > 0 && {
            keywords: project.services.map((s) => SERVICE_LABELS[s] || s).join(', '),
          }),
        }}
      />

      {/* HERO — full bleed */}
      <section className="relative h-screen min-h-[700px] overflow-hidden">
        {heroUrl && (
          <div
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${heroUrl})` }}
          />
        )}
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,7,0.5) 0%, transparent 22%, transparent 45%, rgba(5,5,7,0.92) 100%), linear-gradient(135deg, rgba(73,35,244,0.2), transparent 50%)',
          }}
        />

        <div className="absolute inset-0 z-10 px-6 sm:px-10 pt-24 sm:pt-32 pb-10 sm:pb-14 grid grid-rows-[auto_1fr_auto] gap-4 text-[var(--color-paper)]">
          {/* Breadcrumb + featured badge */}
          <div className="flex justify-between items-start font-mono text-[0.72rem] tracking-[0.12em] uppercase">
            <div className="flex gap-2 items-center">
              <a
                href="/projets"
                className="border-b border-current pb-px opacity-75 hover:opacity-100"
              >
                Travaux
              </a>
              <span className="opacity-40">/</span>
              <span style={{ color: 'var(--color-bravo-soft)' }}>{project.title}</span>
            </div>
            {project.featured && (
              <span className="px-3 py-1.5 rounded-full bg-[var(--color-bravo)] font-semibold">
                ★ Featured
              </span>
            )}
          </div>

          {/* Title */}
          <div className="self-end max-w-[18ch]">
            <div
              className="font-mono text-[0.78rem] tracking-[0.18em] uppercase font-semibold mb-4"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              {project.client}
              {project.year ? ` · ${project.year}` : ''}
            </div>
            <h1 className="font-display font-extrabold uppercase leading-[0.84] tracking-[-0.015em] text-[clamp(4rem,13vw,14rem)]">
              {project.title}
            </h1>
            {project.tagline && (
              <p className="font-editorial italic mt-6 text-[1.1rem] leading-[1.5] opacity-90 max-w-[40ch]">
                {project.tagline}
              </p>
            )}
          </div>

          {/* Scroll cue */}
          <div className="grid grid-cols-[1fr_auto] gap-6 items-end">
            <span />
            <span className="font-mono text-[0.65rem] tracking-[0.18em] uppercase opacity-80 text-center">
              Scroll
              <span
                className="block w-px h-9 mx-auto mt-3"
                style={{
                  background: 'var(--color-paper)',
                  animation: 'scrolldown 2.2s ease-in-out infinite',
                }}
              />
            </span>
          </div>
        </div>
        <style>{`@keyframes scrolldown { 0% { transform: scaleY(0); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } 50.001% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }`}</style>
      </section>

      {/* META BAR — Credits / Réalisation / Partenaires */}
      <section
        className="bg-[var(--color-ink-2)] section-rule-bravo px-6 sm:px-10 py-6 mx-auto"
        style={{ maxWidth: '1640px' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-[0.72rem] tracking-[0.1em] uppercase">
          <Field k="Client" v={project.client} />
          {project.year && <Field k="Année" v={project.year.toString()} accent />}
          {hasCreation ? (
            <CreationField creation={project.creation!} />
          ) : (
            project.sector && (
              <Field k="Secteur" v={SECTOR_LABELS[project.sector] || project.sector} editorial />
            )
          )}
          {project.services && project.services.length > 0 ? (
            <Field
              k="Réalisation"
              v={project.services.map((s) => SERVICE_LABELS[s] || s).join(' · ')}
            />
          ) : (
            <Field k="Notre rôle" v="—" />
          )}
        </div>

        {hasPartners && (
          <div
            className="mt-7 pt-6 border-t grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4"
            style={{ borderColor: 'var(--color-rule-dark)' }}
          >
            <span className="font-mono text-[0.7rem] tracking-[0.1em] uppercase opacity-55 pt-1">
              Partenaires
            </span>
            <ul className="list-none flex flex-wrap gap-x-8 gap-y-2 font-sans text-[0.92rem]">
              {project.partners!.map((p, i) => (
                <li key={p.id || i} className="inline-flex items-baseline gap-2">
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-bold text-[var(--color-paper)] hover:text-[var(--color-bravo-bright)]"
                    >
                      {p.name}
                    </a>
                  ) : (
                    <strong className="font-bold text-[var(--color-paper)]">{p.name}</strong>
                  )}
                  {p.role && (
                    <span className="font-mono text-[0.7rem] tracking-[0.06em] uppercase opacity-55">
                      — {p.role}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* §01 Introduction — full bleed, choose your background */}
      {project.introduction && (
        <section
          className={`${surfaceClass(project.introBackground, 'bravo')} ${
            isBravoSurface(project.introBackground ?? 'bravo') ? 'bravo-atmosphere' : ''
          } px-6 sm:px-10 py-24 sm:py-36`}
        >
          <div
            className="relative z-10 mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-20 items-start"
            style={{ maxWidth: '1640px' }}
          >
            <span className="section-label" style={{ color: 'var(--prose-label-color)' }}>
              §01 · Introduction
            </span>
            <div className="prose-bravo-intro">
              <RichText data={project.introduction} enableGutter={false} />
            </div>
          </div>
        </section>
      )}

      {/* §02 Le contexte — standard split (image left, text right) */}
      {project.context && (
        <Block
          num="§02 · Le contexte"
          content={project.context}
          imageUrl={imageUrl(project.contextImage)}
          reverse={false}
          background={project.contextBackground}
        />
      )}

      {/* §03 Le défi — full bleed image + glass card overlay */}
      {project.challenge && (
        <ChallengeOverlay
          challenge={project.challenge}
          imageUrl={imageUrl(project.challengeImage) || heroUrl}
          background={project.challengeBackground}
        />
      )}

      {/* §04 Notre approche — standard split (image right, text left) */}
      {project.solution && (
        <Block
          num="§04 · Notre approche"
          content={project.solution}
          imageUrl={imageUrl(project.solutionImage)}
          reverse={true}
          background={project.solutionBackground}
        />
      )}

      {/* §05 Gallery — varied layouts */}
      {project.gallery && project.gallery.length > 0 && (
        <Gallery items={project.gallery} />
      )}

      {/* §06 Results chiffrés */}
      {project.results && project.results.length > 0 && (
        <ResultsSection results={project.results} />
      )}

      {/* Testimonial — BRAVO bookend with light gradient spotlight */}
      {project.testimonial?.quote && (
        <Testimonial testimonial={project.testimonial} />
      )}

      {/* Related projects */}
      {project.relatedProjects && project.relatedProjects.length > 0 && (
        <RelatedProjects projects={project.relatedProjects} />
      )}

      {/* Next project */}
      <section className="relative overflow-hidden section-rule-bravo-top section-rule-bravo">
        <a
          href="/projets"
          className="relative z-10 grid grid-cols-[1fr_auto] items-center gap-8 px-6 sm:px-10 py-20 mx-auto bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[var(--color-ink-2)] transition-colors"
          style={{ maxWidth: '1640px' }}
        >
          <div>
            <div
              className="font-mono text-[0.72rem] tracking-[0.22em] uppercase font-semibold mb-3"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              Retour à l'index
            </div>
            <h3 className="font-display font-extrabold uppercase tracking-[-0.005em] leading-[0.9] text-[clamp(3rem,8vw,8rem)]">
              Tous les <span className="font-editorial italic font-normal normal-case" style={{ color: 'var(--color-bravo-soft)' }}>projets</span>
            </h3>
          </div>
          <span className="font-display font-light text-[clamp(3rem,6vw,5rem)] leading-none">→</span>
        </a>
      </section>
    </article>
  )
}

/* ===========================================================
   Helpers — small render functions used above
   =========================================================== */

type BackgroundChoice = 'ink' | 'paper' | 'bravo' | 'bravo-bright' | null | undefined

/** Map background choice to surface-* class. Falls back to `fallback` when nullish. */
function surfaceClass(bg: BackgroundChoice, fallback: 'ink' | 'paper' | 'bravo' | 'bravo-bright'): string {
  const key = bg ?? fallback
  return `surface-${key}`
}

/** Map background choice to theme-* class — sets prose color vars without overriding background.
 *  Use on translucent surfaces (glass cards). */
function themeClass(bg: BackgroundChoice, fallback: 'ink' | 'paper' | 'bravo' | 'bravo-bright'): string {
  const key = bg ?? fallback
  return `theme-${key}`
}

function isBravoSurface(bg: BackgroundChoice): boolean {
  return bg === 'bravo' || bg === 'bravo-bright'
}

/** Map background choice to glass card class (used in §03 overlay). */
function glassClass(bg: BackgroundChoice): string {
  switch (bg) {
    case 'paper':
      return 'paper-glass'
    case 'bravo':
      return 'bravo-glass'
    case 'bravo-bright':
      return 'bravo-bright-glass'
    case 'ink':
    default:
      return 'dark-glass'
  }
}

function Field({
  k,
  v,
  accent,
  editorial,
}: {
  k: string
  v: string
  accent?: boolean
  editorial?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="opacity-55">{k}</span>
      <span
        className={[
          editorial
            ? 'font-editorial italic font-normal normal-case tracking-[-0.02em] text-[1.5rem]'
            : 'font-display font-bold tracking-[-0.01em] text-[1.4rem] leading-none',
          accent ? '' : '',
        ].join(' ')}
        style={{
          color: accent ? 'var(--color-bravo-bright)' : 'var(--color-paper)',
        }}
      >
        {v}
      </span>
    </div>
  )
}

function CreationField({ creation }: { creation: NonNullable<Project['creation']> }) {
  const first = creation[0]
  return (
    <div className="flex flex-col gap-2">
      <span className="opacity-55">Création</span>
      <span
        className="font-editorial italic font-normal normal-case tracking-[-0.02em] text-[1.5rem]"
        style={{ color: 'var(--color-paper)' }}
      >
        {first.name}
        {creation.length > 1 && <span className="opacity-55"> + {creation.length - 1}</span>}
      </span>
      {first.agency && (
        <span className="font-sans font-normal text-[0.78rem] tracking-normal normal-case opacity-65">
          {first.role && <>{first.role} — </>}chez{' '}
          {first.agencyUrl ? (
            <a
              href={first.agencyUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold border-b pb-px"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              {first.agency}
            </a>
          ) : (
            <span className="font-semibold" style={{ color: 'var(--color-bravo-soft)' }}>
              {first.agency}
            </span>
          )}
        </span>
      )}
    </div>
  )
}

function Block({
  num,
  content,
  imageUrl,
  reverse,
  background,
}: {
  num: string
  content: Project['context']
  imageUrl: string | null
  reverse: boolean
  background?: BackgroundChoice
}) {
  if (!content) return null
  return (
    <section className={`${surfaceClass(background, 'ink')} section-rule-bravo py-24 sm:py-36`}>
      <div
        className={[
          'mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center px-6 sm:px-10',
          reverse ? 'md:[direction:rtl]' : '',
        ].join(' ')}
        style={{ maxWidth: '1640px' }}
      >
        <div style={{ direction: 'ltr' }}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="w-full h-auto block"
              loading="lazy"
            />
          ) : (
            <div className="aspect-[4/5] bg-[var(--color-ink-2)] flex items-center justify-center">
              <span className="font-mono text-[0.7rem] tracking-[0.12em] uppercase opacity-40 text-[var(--color-paper)]">
                Image à uploader
              </span>
            </div>
          )}
        </div>
        <div className="md:[direction:ltr]">
          <span
            className="font-mono text-[0.72rem] tracking-[0.16em] uppercase font-semibold mb-4 block"
            style={{ color: 'var(--prose-label-color)' }}
          >
            {num}
          </span>
          <div className="prose-bravo-block">
            <RichText data={content} enableGutter={false} />
          </div>
        </div>
      </div>
    </section>
  )
}

function ChallengeOverlay({
  challenge,
  imageUrl,
  background,
}: {
  challenge: Project['challenge']
  imageUrl: string | null
  background?: BackgroundChoice
}) {
  if (!challenge || !imageUrl) return null
  const glass = glassClass(background)
  const theme = themeClass(background, 'ink')
  return (
    <section className="relative min-h-screen overflow-hidden section-rule-bravo flex items-end">
      <div
        className="absolute inset-0 bg-center bg-cover"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(5,5,7,0.25) 0%, transparent 40%, rgba(5,5,7,0.55) 100%), linear-gradient(180deg, rgba(5,5,7,0.35) 0%, transparent 30%, rgba(73,35,244,0.18) 100%)',
        }}
      />
      <div
        className="relative z-10 w-full mx-auto px-6 sm:px-10 pb-12 sm:pb-20 flex"
        style={{ maxWidth: '1640px' }}
      >
        <div className={`${glass} ${theme} max-w-[620px] w-full p-8 sm:p-12 rounded-[28px]`}>
          <div
            className="font-mono text-[0.72rem] tracking-[0.16em] uppercase font-semibold mb-4"
            style={{ color: 'var(--prose-label-color)' }}
          >
            §03 · Le défi
          </div>
          <div className="prose-bravo-overlay">
            <RichText data={challenge} enableGutter={false} />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ===========================================================
   §05 Gallery — varied layouts (full / contained / half-left / half-right / two-col)
   =========================================================== */

type GalleryItemType = NonNullable<Project['gallery']>[number]

/** Group consecutive `two-col` items into pairs of 2 so they render side-by-side. */
function groupGalleryItems(items: GalleryItemType[]): Array<GalleryItemType | GalleryItemType[]> {
  const groups: Array<GalleryItemType | GalleryItemType[]> = []
  let i = 0
  while (i < items.length) {
    const item = items[i]
    if (item.layout === 'two-col' && items[i + 1]?.layout === 'two-col') {
      groups.push([item, items[i + 1]])
      i += 2
    } else {
      groups.push(item)
      i += 1
    }
  }
  return groups
}

function Gallery({ items }: { items: NonNullable<Project['gallery']> }) {
  const groups = groupGalleryItems(items)
  return (
    <section className="surface-paper section-rule-bravo py-20 sm:py-32">
      <div
        className="mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-end mb-12 sm:mb-16 pb-6 border-b"
        style={{ maxWidth: '1640px', borderColor: 'var(--color-rule-light)' }}
      >
        <div>
          <span className="section-label" style={{ color: 'var(--color-bravo)' }}>
            §05 · Galerie
          </span>
          <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2.4rem,5vw,5rem)]">
            Le projet{' '}
            <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo)' }}>
              visuellement.
            </span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:gap-10">
        {groups.map((g, i) =>
          Array.isArray(g) ? (
            <TwoColPair key={`pair-${i}`} left={g[0]} right={g[1]} />
          ) : (
            <GalleryItem key={g.id || `g-${i}`} item={g} />
          ),
        )}
      </div>
    </section>
  )
}

function TwoColPair({ left, right }: { left: GalleryItemType; right: GalleryItemType }) {
  return (
    <div
      className="mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-2 gap-6"
      style={{ maxWidth: '1640px' }}
    >
      <TwoColFigure item={left} />
      <TwoColFigure item={right} />
    </div>
  )
}

function TwoColFigure({ item }: { item: GalleryItemType }) {
  const url = imageUrl(item.image)
  if (!url) return null
  const fit = (item as { fit?: 'natural' | 'cover' | 'contain' }).fit || 'natural'
  const media = typeof item.image === 'object' && item.image !== null ? item.image : null
  const alt = media?.alt || item.caption || ''
  const w = media?.width
  const h = media?.height
  return (
    <figure>
      {fit === 'natural' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} width={w || undefined} height={h || undefined} className="block w-full h-auto" loading="lazy" />
      ) : (
        <div
          className={fit === 'contain' ? 'bg-[var(--color-paper-2)] w-full' : 'w-full'}
          style={{ aspectRatio: '4 / 5' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={alt}
            className={[
              'w-full h-full',
              fit === 'cover' ? 'object-cover' : 'object-contain',
            ].join(' ')}
            loading="lazy"
          />
        </div>
      )}
      {item.caption && (
        <figcaption className="mt-2 font-mono text-[0.7rem] tracking-[0.1em] uppercase opacity-55">
          {item.caption}
        </figcaption>
      )}
    </figure>
  )
}

function GalleryItem({ item }: { item: NonNullable<Project['gallery']>[number] }) {
  const url = imageUrl(item.image)
  if (!url) return null
  const layout = item.layout || 'contained'
  const fit = (item as { fit?: 'natural' | 'cover' | 'contain' }).fit || 'natural'
  const media = typeof item.image === 'object' && item.image !== null ? item.image : null
  const alt = media?.alt || item.caption || ''
  const w = media?.width || undefined
  const h = media?.height || undefined

  /** Image renderer — respects `fit`. Natural = no crop, browser uses intrinsic ratio. */
  const Img = ({ ratio }: { ratio?: string }) => {
    if (fit === 'natural') {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          width={w}
          height={h}
          className="block w-full h-auto"
          loading="lazy"
        />
      )
    }
    return (
      <div
        className={[
          'w-full',
          fit === 'contain' ? 'bg-[var(--color-ink-2)]' : '',
        ].join(' ')}
        style={ratio ? { aspectRatio: ratio } : { aspectRatio: w && h ? `${w} / ${h}` : '16 / 9' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          className={[
            'w-full h-full',
            fit === 'cover' ? 'object-cover' : 'object-contain',
          ].join(' ')}
          loading="lazy"
        />
      </div>
    )
  }

  // Full bleed — escape any container
  if (layout === 'full') {
    return (
      <figure className="w-full">
        <Img ratio={fit === 'cover' ? '21 / 9' : undefined} />
        {item.caption && (
          <figcaption
            className="mx-auto px-6 sm:px-10 mt-3 font-mono text-[0.72rem] tracking-[0.1em] uppercase opacity-55"
            style={{ maxWidth: '1640px' }}
          >
            {item.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  // Contained — centered with caption row
  if (layout === 'contained') {
    return (
      <figure className="mx-auto px-6 sm:px-10 w-full" style={{ maxWidth: '1640px' }}>
        <Img ratio={fit === 'cover' ? '16 / 9' : undefined} />
        {item.caption && (
          <figcaption className="mt-3 font-mono text-[0.72rem] tracking-[0.1em] uppercase opacity-55">
            {item.caption}
          </figcaption>
        )}
      </figure>
    )
  }

  // Half-left / Half-right — image one side + caption other side
  if (layout === 'half-left' || layout === 'half-right') {
    const reverse = layout === 'half-right'
    return (
      <div
        className={[
          'mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center',
          reverse ? 'md:[direction:rtl]' : '',
        ].join(' ')}
        style={{ maxWidth: '1640px' }}
      >
        <div style={{ direction: 'ltr' }}>
          <Img ratio={fit === 'cover' ? '5 / 6' : undefined} />
        </div>
        <div className="md:[direction:ltr] max-w-[40ch]">
          {item.caption ? (
            <p className="font-editorial italic text-[1.1rem] leading-[1.55] opacity-85">
              {item.caption}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  // Two-col — half-width centered card
  return (
    <div
      className="mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-2 gap-6"
      style={{ maxWidth: '1640px' }}
    >
      <figure>
        <Img ratio={fit === 'cover' ? '4 / 5' : undefined} />
        {item.caption && (
          <figcaption className="mt-2 font-mono text-[0.7rem] tracking-[0.1em] uppercase opacity-55">
            {item.caption}
          </figcaption>
        )}
      </figure>
    </div>
  )
}

/* ===========================================================
   §06 Results chiffrés — big numbers grid
   =========================================================== */

function ResultsSection({ results }: { results: NonNullable<Project['results']> }) {
  return (
    <section className="surface-ink section-rule-bravo py-20 sm:py-32">
      <div className="mx-auto px-6 sm:px-10 pb-10 sm:pb-16" style={{ maxWidth: '1640px' }}>
        <span className="section-label" style={{ color: 'var(--color-bravo-soft)' }}>
          §06 · Résultats chiffrés
        </span>
        <h2 className="mt-4 font-display font-extrabold uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2.5rem,6vw,6rem)] text-[var(--color-paper)]">
          Ce que ça <span className="font-light">a</span>
          <br />
          <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo-soft)' }}>
            déclenché.
          </span>
        </h2>
      </div>

      <div
        className="mx-auto px-6 sm:px-10 grid grid-cols-2 md:grid-cols-4 border-t"
        style={{ maxWidth: '1640px', borderColor: 'var(--color-rule-dark)' }}
      >
        {results.map((r, i) => (
          <div
            key={r.id || i}
            className="py-10 pr-6 border-r border-b"
            style={{
              borderRightColor: 'var(--color-rule-dark)',
              borderBottomColor: 'var(--color-rule-dark)',
              ...(((i + 1) % 4 === 0) ? { borderRightWidth: 0 } : {}),
            }}
          >
            <div
              className="font-display font-extrabold uppercase tracking-[-0.02em] leading-[0.95] text-[clamp(3.5rem,8vw,7rem)]"
              style={{ color: 'var(--color-bravo-bright)' }}
            >
              {r.value}
            </div>
            <div className="mt-2 font-sans font-bold text-[1.05rem] tracking-[-0.01em] text-[var(--color-paper)]">
              {r.label}
            </div>
            {r.description && (
              <p className="mt-1 font-editorial italic text-[0.92rem] leading-[1.5] opacity-75 max-w-[30ch] text-[var(--color-paper)]">
                {r.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

/* ===========================================================
   Testimonial — BRAVO bookend with light gradient spotlight
   =========================================================== */

function Testimonial({ testimonial }: { testimonial: NonNullable<Project['testimonial']> }) {
  const photoUrl = imageUrl(testimonial.photo)
  return (
    <section className="surface-bravo section-rule-bravo relative overflow-hidden py-24 sm:py-44 px-6 sm:px-10">
      {/* Top spotlight */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: '-20%',
          width: '110%',
          height: '80%',
          background:
            'radial-gradient(ellipse at center, rgba(244,237,225,0.18) 0%, rgba(244,237,225,0.04) 40%, transparent 70%)',
        }}
      />
      {/* Bottom-left atmospheric blob */}
      <div
        aria-hidden
        className="absolute pointer-events-none rounded-full"
        style={{
          left: '-10vw',
          bottom: '-25vw',
          width: '80vw',
          height: '80vw',
          background: 'radial-gradient(circle, var(--color-bravo-bright) 0%, transparent 60%)',
          filter: 'blur(140px)',
          opacity: 0.55,
        }}
      />
      <div className="relative z-10 mx-auto text-center" style={{ maxWidth: '1100px' }}>
        <span
          className="inline-block font-editorial italic font-normal text-[8rem] leading-[0.7] mb-4 text-[var(--color-paper)]"
          style={{ opacity: 0.5 }}
          aria-hidden
        >
          &ldquo;
        </span>
        <blockquote className="font-editorial italic font-normal text-[clamp(1.6rem,3.5vw,3rem)] leading-[1.25] tracking-[-0.02em] max-w-[26ch] mx-auto mb-10 text-[var(--color-paper)]">
          {testimonial.quote}
        </blockquote>
        {(testimonial.author || testimonial.role) && (
          <div className="inline-flex items-center gap-4 font-sans">
            {photoUrl && (
              <span
                className="w-14 h-14 rounded-full bg-center bg-cover"
                style={{
                  backgroundImage: `url(${photoUrl})`,
                  boxShadow:
                    '0 0 0 1px rgba(244,237,225,0.3), 0 8px 24px rgba(5,5,7,0.25)',
                }}
              />
            )}
            <div className="text-left">
              {testimonial.author && (
                <div className="font-bold text-[1.05rem] text-[var(--color-paper)]">
                  {testimonial.author}
                </div>
              )}
              {testimonial.role && (
                <div className="font-mono text-[0.72rem] tracking-[0.1em] uppercase opacity-80 mt-1 text-[var(--color-paper)]">
                  {testimonial.role}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ===========================================================
   Related projects
   =========================================================== */

function RelatedProjects({
  projects,
}: {
  projects: NonNullable<Project['relatedProjects']>
}) {
  const items = projects.filter((p): p is Project => typeof p === 'object' && p !== null)
  if (items.length === 0) return null
  return (
    <section className="surface-ink section-rule-bravo py-20 sm:py-32 px-6 sm:px-10">
      <div className="mx-auto" style={{ maxWidth: '1640px' }}>
        <div
          className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end mb-10 pb-4 border-b"
          style={{ borderColor: 'var(--color-rule-dark)' }}
        >
          <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2.4rem,5vw,4.5rem)] text-[var(--color-paper)]">
            Projets{' '}
            <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo-soft)' }}>
              connexes.
            </span>
          </h2>
          <a
            href="/projets"
            className="inline-flex items-center gap-1.5 font-mono text-[0.78rem] tracking-[0.14em] uppercase font-semibold border-b border-current pb-1 text-[var(--color-paper)] hover:text-[var(--color-bravo-bright)] transition-colors"
          >
            Voir tous <span>→</span>
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {items.slice(0, 3).map((p) => {
            const thumb = imageUrl(p.thumbnail) || imageUrl(p.heroImage)
            return (
              <a
                key={p.id}
                href={`/projets/${p.slug}`}
                className="group block"
              >
                <div className="aspect-[4/5] overflow-hidden bg-[var(--color-ink-2)] relative">
                  {thumb && (
                    <div
                      className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]"
                      style={{ backgroundImage: `url(${thumb})` }}
                    />
                  )}
                </div>
                <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 items-end">
                  <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[1.6rem] text-[var(--color-paper)]">
                    {p.title}
                  </h3>
                  {p.year && (
                    <span className="font-mono text-[0.7rem] tracking-[0.1em] uppercase" style={{ color: 'var(--color-bravo-soft)' }}>
                      {p.year}
                    </span>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ===========================================================
   Data
   =========================================================== */

const queryProjectBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'projects',
    draft,
    limit: 1,
    depth: 2,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })
  return (result.docs?.[0] as Project | undefined) || null
})

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug({ slug: decodedSlug })
  return generateMeta({ doc: project })
}
