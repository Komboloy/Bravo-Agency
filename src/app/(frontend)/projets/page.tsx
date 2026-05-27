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

  return (
    <main className="surface-ink min-h-screen pb-20">
      {/* PAGE HERO — 100vh full-bleed with animated BRAVO atmosphere blobs */}
      <section className="relative min-h-screen flex items-end atmosphere-bravo-drift px-6 sm:px-10 pt-32 sm:pt-44 pb-[15vh] sm:pb-[18vh] section-rule-bravo">
        <div className="relative z-10 mx-auto w-full grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12 items-end" style={{ maxWidth: '1640px' }}>
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
              <span
                className="block font-editorial italic font-normal normal-case tracking-[-0.02em] text-[clamp(2rem,7vw,7rem)] leading-[1] mt-2"
                style={{ color: 'var(--color-bravo-soft)' }}
              >
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
