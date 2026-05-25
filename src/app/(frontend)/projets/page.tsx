import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Project } from '@/payload-types'

export const dynamic = 'force-static'
export const revalidate = 600

const SECTOR_LABELS: Record<string, string> = {
  ong: 'ONG',
  culture: 'Culture',
  industry: 'Industrie',
  tech: 'Tech',
  education: 'Éducation',
  health: 'Santé',
  public: 'Public',
  other: 'Autre',
}
const SERVICE_LABELS: Record<string, string> = {
  'brand-strategy': 'Stratégie',
  'visual-identity': 'Identité',
  website: 'Web',
  campaign: 'Campagne',
  'art-direction': 'Direction artistique',
  video: 'Vidéo',
  print: 'Print',
  social: 'Social',
  events: 'Événementiel',
  consulting: 'Conseil',
}

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

// Asymmetric grid placement rotation
const SIZES = ['lg', 'lg', 'md', 'md', 'md', 'lg', 'tall', 'sm', 'wide', 'tall', 'md'] as const
function sizeFor(i: number): (typeof SIZES)[number] {
  return SIZES[i % SIZES.length]
}

const sizeClasses: Record<(typeof SIZES)[number], string> = {
  lg: 'md:col-span-6',
  md: 'md:col-span-4',
  sm: 'md:col-span-3',
  tall: 'md:col-span-4',
  wide: 'md:col-span-8',
}
const aspectClasses: Record<(typeof SIZES)[number], string> = {
  lg: 'aspect-[5/4]',
  md: 'aspect-[4/5]',
  sm: 'aspect-square',
  tall: 'aspect-[3/4]',
  wide: 'aspect-[16/9]',
}

export const metadata: Metadata = {
  title: 'Travaux — BRAVO! Agency',
  description:
    "Projets livrés par BRAVO! Agency depuis 2018 pour des marques, ONG, institutions et nos propres initiatives.",
}

export default async function ProjectsPage() {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: '-year',
  })

  const projects = result.docs as Project[]
  const total = projects.length

  return (
    <main className="surface-ink min-h-screen pb-20">
      {/* PAGE HERO */}
      <section className="px-6 sm:px-10 pt-32 sm:pt-40 pb-16 sm:pb-24 section-rule-bravo">
        <div className="mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 items-end" style={{ maxWidth: '1640px' }}>
          <div>
            <div
              className="font-mono text-[0.72rem] tracking-[0.12em] uppercase mb-6 flex gap-2 items-center"
              style={{ color: 'var(--color-bravo-soft)' }}
            >
              <Link href="/" className="opacity-65 hover:opacity-100">Accueil</Link>
              <span className="opacity-40">/</span>
              <span>Travaux</span>
            </div>
            <h1 className="font-display font-extrabold uppercase leading-[0.84] tracking-[-0.015em] text-[clamp(5rem,16vw,18rem)] text-[var(--color-paper)]">
              Travaux<br />
              <span className="font-editorial italic font-normal normal-case tracking-[-0.02em]" style={{ color: 'var(--color-bravo-soft)' }}>
                — index complet.
              </span>
            </h1>
          </div>
          <p className="font-editorial italic text-[1.2rem] leading-[1.5] max-w-[38ch] opacity-92 text-[var(--color-paper)]">
            <strong className="font-sans not-italic font-bold" style={{ color: 'var(--color-bravo-soft)' }}>
              {total} {total <= 1 ? 'projet' : 'projets'}
            </strong>{' '}
            livrés depuis 2018 pour des marques, ONG, institutions et nos propres initiatives.
          </p>
        </div>
      </section>

      {/* GALLERY */}
      <section
        className="mx-auto px-6 sm:px-10 pt-8 sm:pt-12"
        style={{ maxWidth: '1640px' }}
      >
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 md:gap-y-12 lg:gap-y-16">
            {projects.map((p, i) => (
              <ProjectTile key={p.id} project={p} size={sizeFor(i)} featured={!!p.featured} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function ProjectTile({
  project,
  size,
  featured,
}: {
  project: Project
  size: (typeof SIZES)[number]
  featured: boolean
}) {
  const thumb = imageUrl(project.thumbnail) || imageUrl(project.heroImage)
  return (
    <Link
      href={`/projets/${project.slug}`}
      className={['group block relative overflow-hidden', sizeClasses[size]].join(' ')}
    >
      <div className={['relative overflow-hidden bg-[var(--color-ink-2)]', aspectClasses[size]].join(' ')}>
        {thumb ? (
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.05]"
            style={{ backgroundImage: `url(${thumb})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-ink-2)] to-[var(--color-bravo-deep)]" />
        )}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-transparent via-transparent to-black/70" />
        <span
          className={[
            'absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full backdrop-blur-sm',
            'font-mono text-[0.62rem] tracking-[0.12em] uppercase font-medium text-[var(--color-paper)]',
            'border',
            featured
              ? 'bg-[rgba(73,35,244,0.55)] border-[rgba(244,237,225,0.25)]'
              : 'bg-[rgba(5,5,7,0.55)] border-[rgba(244,237,225,0.18)]',
          ].join(' ')}
        >
          {featured ? '★ Featured' : project.year ?? ''}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 items-end">
        <h3 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(1.6rem,2.2vw,2.2rem)] text-[var(--color-paper)]">
          {project.title}
        </h3>
        <span className="font-mono text-[0.7rem] tracking-[0.1em] uppercase font-semibold" style={{ color: 'var(--color-bravo-soft)' }}>
          {project.year ?? ''}
        </span>
        {project.services && project.services.length > 0 && (
          <span className="col-span-full font-mono text-[0.65rem] tracking-[0.1em] uppercase opacity-65 text-[var(--color-paper)] flex flex-wrap gap-x-2">
            {project.services.slice(0, 3).map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <span className="opacity-50">·</span>}
                <span>{SERVICE_LABELS[s] || s}</span>
              </React.Fragment>
            ))}
          </span>
        )}
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="border border-[color:var(--color-rule-dark)] rounded-[28px] p-12 sm:p-16 text-center max-w-3xl mx-auto my-12">
      <div
        className="font-mono text-[0.72rem] tracking-[0.18em] uppercase font-semibold mb-4"
        style={{ color: 'var(--color-bravo-soft)' }}
      >
        En préparation
      </div>
      <h2 className="font-display font-extrabold uppercase leading-[0.95] tracking-[-0.005em] text-[clamp(2rem,4vw,3.5rem)] text-[var(--color-paper)] mb-4">
        Aucun projet <span className="font-editorial italic font-normal normal-case" style={{ color: 'var(--color-bravo-soft)' }}>publié</span> pour l'instant.
      </h2>
      <p className="font-editorial italic text-[1.05rem] opacity-80 max-w-[42ch] mx-auto text-[var(--color-paper)]">
        Ajoute un projet dans l'admin Payload (collection « Projets ») pour le voir apparaître ici.
      </p>
      <Link
        href="/admin/collections/projects/create"
        className="inline-block mt-8 px-5 py-3 rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] font-sans font-bold text-sm hover:bg-[var(--color-bravo)] hover:text-[var(--color-paper)] transition-colors"
      >
        Créer un projet →
      </Link>
    </div>
  )
}
