import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import type { Media, Project, Sector, Service } from '@/payload-types'
import { ProjectsExplorer } from '@/components/ProjectsExplorer'

export const dynamic = 'force-static'
export const revalidate = 600

function imageUrl(m: number | Media | null | undefined): string | null {
  if (!m || typeof m === 'number') return null
  return m.url || null
}

function serviceTitles(items: (number | Service)[] | null | undefined): string[] {
  return (items || [])
    .map((s) => (typeof s === 'object' && s !== null ? s.title : ''))
    .filter(Boolean)
}

function sectorOf(p: Project): Sector | null {
  return typeof p.sector === 'object' && p.sector !== null ? p.sector : null
}

export const metadata: Metadata = {
  title: 'Travaux — BRAVO! Agency',
  description:
    "Projets livrés par BRAVO! Agency depuis 2018 pour des marques, ONG, institutions et nos propres initiatives.",
}

export default async function ProjectsPage() {
  const payload = await getPayload({ config: configPromise })

  const [projectsResult, sectorsResult] = await Promise.all([
    payload.find({
      collection: 'projects',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: '-year',
    }),
    payload.find({
      collection: 'sectors',
      depth: 0,
      limit: 100,
      sort: 'order',
    }),
  ])

  const projects = projectsResult.docs as Project[]
  const sectorsList = sectorsResult.docs as Sector[]
  const total = projects.length

  // Derived stats for the COUNTERS strip (V8 reference)
  const clientCounts = new Map<string, number>()
  for (const p of projects) if (p.client) clientCounts.set(p.client, (clientCounts.get(p.client) ?? 0) + 1)
  const recurrentClients = Array.from(clientCounts.values()).filter((c) => c >= 2).length
  const usedSectorIds = new Set(projects.map((p) => sectorOf(p)?.id).filter(Boolean))
  const sectorsCount = usedSectorIds.size
  const firstYear = projects.reduce<number | null>((min, p) => {
    if (!p.year) return min
    return min === null || p.year < min ? p.year : min
  }, null)

  // Featured for the hero — prefer the most recent flagged `featured`, else most recent overall
  const featuredProject = projects.find((p) => p.featured) || projects[0]
  const featuredImg = featuredProject
    ? imageUrl(featuredProject.heroImage) || imageUrl(featuredProject.thumbnail)
    : null
  const featuredSectorTitle = featuredProject ? (sectorOf(featuredProject)?.title || '') : ''

  return (
    <main className="surface-ink min-h-screen pb-20">
      {/* PAGE HERO — split 100vh BRAVO + featured project image. Same pattern
          as /posts and /posts/[slug] hero for site-wide consistency. */}
      <section className="relative grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] min-h-screen section-rule-bravo">
        {/* LEFT — BRAVO color block with atmosphere */}
        <div className="surface-bravo atmosphere-bravo-drift relative flex flex-col justify-between px-6 sm:px-10 pt-32 sm:pt-44 pb-10 sm:pb-14 overflow-hidden">
          <div className="relative z-10">
            <div
              className="font-mono text-[0.72rem] tracking-[0.12em] uppercase flex gap-2 items-center"
              style={{ color: 'rgba(244,237,225,0.65)' }}
            >
              <Link href="/" style={{ color: 'var(--color-paper)', opacity: 0.75 }} className="hover:!opacity-100">
                Accueil
              </Link>
              <span className="opacity-40">/</span>
              <span style={{ color: 'var(--color-paper)' }}>Travaux</span>
            </div>
          </div>
          <div className="relative z-10">
            <div
              className="prose-home-display"
              style={
                {
                  '--display-size': 'clamp(4rem,9vw,10rem)',
                  '--display-color': 'var(--color-paper)',
                  '--display-accent': 'var(--color-paper)',
                } as React.CSSProperties
              }
            >
              <h1>Travaux</h1>
              <h1 style={{ fontFamily: 'var(--font-editorial)', fontStyle: 'italic', fontWeight: 400, textTransform: 'none', letterSpacing: '-0.02em', fontSize: 'clamp(2rem,5vw,5rem)', marginTop: '0.4rem' }}>
                — index complet.
              </h1>
            </div>
            <p
              className="mt-8 sm:mt-10 font-editorial italic text-[1.15rem] leading-[1.5] max-w-[38ch]"
              style={{ color: 'var(--color-paper)', opacity: 0.92 }}
            >
              <strong className="font-sans not-italic font-bold" style={{ color: 'var(--color-paper)', fontStyle: 'normal' }}>
                {total} {total <= 1 ? 'projet' : 'projets'}
              </strong>{' '}
              livrés depuis 2018 pour des marques, ONG, institutions et nos propres initiatives.
            </p>
          </div>
        </div>

        {/* RIGHT — featured project hero image with meta overlay */}
        {featuredProject && (
          <Link
            href={`/projets/${featuredProject.slug}`}
            className="group relative overflow-hidden bg-[var(--color-ink-2)] min-h-[50vh] md:min-h-0"
          >
            {featuredImg && (
              <div
                className="absolute inset-0 bg-center bg-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]"
                style={{ backgroundImage: `url(${featuredImg})` }}
              />
            )}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, transparent 40%, rgba(5,5,7,0.78) 100%)',
              }}
            />
            <div className="absolute left-0 right-0 bottom-0 z-10 p-6 sm:p-10 text-[var(--color-paper)]">
              <div
                className="font-mono text-[0.72rem] tracking-[0.16em] uppercase font-bold mb-3 flex flex-wrap gap-2"
                style={{ color: 'var(--color-bravo-soft)' }}
              >
                <span>{featuredProject.featured ? 'À la une' : 'Dernier projet'}</span>
                {featuredProject.year && (
                  <>
                    <span className="opacity-50">·</span>
                    <span>{featuredProject.year}</span>
                  </>
                )}
                {featuredSectorTitle && (
                  <>
                    <span className="opacity-50">·</span>
                    <span>{featuredSectorTitle}</span>
                  </>
                )}
              </div>
              <h2 className="font-display font-extrabold uppercase leading-[0.92] tracking-[-0.005em] text-[clamp(2rem,3.5vw,3.4rem)] max-w-[22ch]">
                {featuredProject.title}
              </h2>
              <span className="inline-flex items-center gap-2 mt-5 font-mono text-[0.72rem] tracking-[0.12em] uppercase font-semibold pb-1 border-b border-current group-hover:text-[var(--color-bravo-soft)] transition-colors">
                Voir le projet <span>→</span>
              </span>
            </div>
          </Link>
        )}
      </section>

      {/* COUNTERS strip — V8 reference */}
      {total > 0 && (
        <section
          className="mx-auto px-6 sm:px-10 pt-12 sm:pt-16 pb-2"
          style={{ maxWidth: '1640px' }}
        >
          <dl
            className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8 text-[var(--color-paper)]"
          >
            <Counter num={`${total}+`} label="Projets livrés" highlight />
            <Counter num={String(recurrentClients).padStart(2, '0')} label="Clients récurrents" />
            <Counter num={String(sectorsCount).padStart(2, '0')} label="Secteurs couverts" />
            <Counter num={firstYear ? String(firstYear) : '—'} label="Premier projet" />
          </dl>
        </section>
      )}

      {/* GALLERY + FILTER UI (client component) */}
      {projects.length === 0 ? (
        <section className="mx-auto px-6 sm:px-10 pt-8 sm:pt-12" style={{ maxWidth: '1640px' }}>
          <EmptyState />
        </section>
      ) : (
        <ProjectsExplorer projects={projects} sectors={sectorsList} />
      )}
    </main>
  )
}

function Counter({
  num,
  label,
  highlight,
}: {
  num: string
  label: string
  /** Use BRAVO bright as primary color for the digit — emphasises the first stat. */
  highlight?: boolean
}) {
  // Splits num so the trailing `+` (when present) gets the BRAVO bright accent.
  const match = /^(.+?)(\+)?$/.exec(num)
  const main = match?.[1] ?? num
  const suffix = match?.[2]
  return (
    <div className="flex flex-col gap-2 pl-4 border-l" style={{ borderColor: highlight ? 'var(--color-bravo-bright)' : 'var(--color-rule-dark)' }}>
      <span
        className="font-display font-extrabold text-[clamp(1.8rem,3vw,2.4rem)] leading-none tracking-[-0.01em]"
        style={{ color: highlight ? 'var(--color-bravo-bright)' : 'var(--color-paper)' }}
      >
        {main}
        {suffix && (
          <span style={{ color: highlight ? 'var(--color-paper)' : 'var(--color-bravo-bright)' }}>
            {suffix}
          </span>
        )}
      </span>
      <span
        className="font-mono text-[0.72rem] tracking-[0.12em] uppercase font-semibold"
        style={{ color: 'var(--color-bravo-soft)' }}
      >
        {label}
      </span>
    </div>
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
